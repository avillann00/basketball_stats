from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError, transaction
from django.db import models
from django.shortcuts import get_object_or_404
import logging

from .models import Team, Player, Stat, Game
from .serializers import PlayerSerializer, TeamSerializer, GameSerializer, StatSerializer
from stats.main import get_player, get_player_stats, get_team, get_team_games

logger = logging.getLogger(__name__)


class BaseAPIView(APIView):
    """Base view with common functionality"""
    permission_classes = [IsAuthenticated]
    
    def handle_exception(self, exc):
        logger.error(f"Error in {self.__class__.__name__}: {exc}")
        return Response(
            {"error": "An error occurred processing your request"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class TeamService:
    """Service class for team-related operations"""
    
    @staticmethod
    def get_or_create_team(city, name):
        """Get existing team or create new one from external API"""
        # Try to find existing team first
        team = Team.objects.filter(team_name=name, team_city=city).first()
        
        if not team:
            # Fetch from external API
            external_team = get_team(city, name)
            if external_team:
                try:
                    with transaction.atomic():
                        team, created = Team.objects.get_or_create(
                            team_id=external_team.id,
                            defaults={
                                'team_name': external_team.name,
                                'team_city': external_team.city,
                                'team_conference': external_team.conference,
                                'team_division': external_team.division
                            }
                        )
                except IntegrityError:
                    # Handle race condition - team was created by another request
                    team = Team.objects.filter(team_id=external_team.id).first()
        
        return team


class GameService:
    """Service class for game-related operations"""
    
    @staticmethod
    def get_or_create_game(team, date_str):
        """Get existing game or create new one from external API"""
        try:
            date = date_str[:10]  # Extract date part
            
            # Check if game exists (check both home and away)
            game = Game.objects.filter(
                date=date
            ).filter(
                models.Q(home=team) | models.Q(away=team)
            ).first()
            
            if not game:
                # Fetch from external API
                external_games = get_team_games(team.team_city, team.team_name, [2023], date)
                if external_games:
                    external_game = external_games[0]
                    
                    # Get or create the opposing team
                    opposing_team = TeamService.get_or_create_team(
                        external_game.visitor_team.city,
                        external_game.visitor_team.name
                    )
                    
                    if opposing_team:
                        try:
                            with transaction.atomic():
                                game, created = Game.objects.get_or_create(
                                    game_id=external_game.id,
                                    defaults={
                                        'home': team,
                                        'away': opposing_team,
                                        'home_score': external_game.home_team_score,
                                        'away_score': external_game.visitor_team_score,
                                        'date': external_game.date,
                                        'season': external_game.season,
                                        'post_season': external_game.postseason
                                    }
                                )
                        except IntegrityError:
                            # Handle race condition
                            game = Game.objects.filter(game_id=external_game.id).first()
            
            return game
            
        except Exception as e:
            logger.error(f"Error in get_or_create_game: {e}")
            return None


class PlayerView(BaseAPIView):
    """Get player information"""
    
    def get(self, request, first, last):
        # Try database first with optimized query
        player = Player.objects.select_related('team').filter(
            first_name=first, 
            last_name=last
        ).first()
        
        if not player:
            player = self._create_player_from_api(first, last)
            
        if player:
            serializer = PlayerSerializer(player)
            return Response(serializer.data)
        
        return Response(
            {"error": "Player not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    def _create_player_from_api(self, first, last):
        """Create player from external API"""
        try:
            external_player = get_player(first, last)
            if not external_player:
                return None
            
            # Get or create team
            team = TeamService.get_or_create_team(
                external_player['team']['teamCity'],
                external_player['team']['teamName']
            )
            
            if not team:
                return None
            
            with transaction.atomic():
                player, created = Player.objects.get_or_create(
                    player_id=external_player['personId'],
                    defaults={
                        'first_name': external_player['firstName'],
                        'last_name': external_player['lastName'],
                        'player_number': external_player['jersey'],
                        'player_height': str(external_player['height']),
                        'player_weight': int(external_player['weight']),
                        'seasons': external_player['seasonExp'],
                        'position': external_player['position'],
                        'year_started': external_player['fromYear'],
                        'draft_year': external_player['draft']['draftYear'],
                        'draft_pick': external_player['draft']['draftNumber'],
                        'team': team
                    }
                )
            
            return player
            
        except Exception as e:
            logger.error(f"Error creating player {first} {last}: {e}", exc_info=True)
            return None


class TeamView(BaseAPIView):
    """Get team information"""
    
    def get(self, request, city_name, team_name):
        team = TeamService.get_or_create_team(city_name, team_name)
        
        if team:
            serializer = TeamSerializer(team)
            return Response(serializer.data)
        
        return Response(
            {"error": "Team not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )


class GameView(BaseAPIView):
    """Get games for a team"""
    
    def get(self, request, pk):
        team = get_object_or_404(Team, team_id=pk)
        
        # Get games with optimized query
        games = Game.objects.filter(
            models.Q(home=team) | models.Q(away=team)
        ).select_related('home', 'away').order_by('-date')
        
        # If no games exist, try to create from API
        if not games.exists():
            games = self._create_games_from_api(team)
        
        if games and games.exists():
            serializer = GameSerializer(games, many=True)
            return Response(serializer.data)
        
        return Response(
            {"error": "No games found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    def _create_games_from_api(self, team):
        """Create games from external API"""
        try:
            external_games = get_team_games(team.team_city, team.team_name, [2024], None)
            if not external_games:
                return Game.objects.none()
            
            games_to_create = []
            for external_game in external_games:
                opposing_team = TeamService.get_or_create_team(
                    external_game.visitor_team.city,
                    external_game.visitor_team.name
                )
                
                if opposing_team:
                    games_to_create.append(Game(
                        game_id=external_game.id,
                        home=team,
                        away=opposing_team,
                        home_score=external_game.home_team_score,
                        away_score=external_game.visitor_team_score,
                        date=external_game.date,
                        season=external_game.season,
                        post_season=external_game.postseason
                    ))
            
            if games_to_create:
                with transaction.atomic():
                    # Use bulk_create with ignore_conflicts to handle duplicates
                    Game.objects.bulk_create(games_to_create, ignore_conflicts=True)
                    
                    # Return the created games
                    return Game.objects.filter(
                        models.Q(home=team) | models.Q(away=team)
                    ).select_related('home', 'away').order_by('-date')
            
            return Game.objects.none()
            
        except Exception as e:
            logger.error(f"Error creating games for team {team.team_name}: {e}")
            return Game.objects.none()


class StatView(BaseAPIView):
    """Get player statistics"""
    
    def get(self, request, pk):
        player = get_object_or_404(Player, player_id=pk)
        
        # Get stats with optimized query
        stats = Stat.objects.filter(player=player).select_related('game', 'game__home', 'game__away').order_by('-game__date')
        
        # If no stats exist, try to create from API
        if not stats.exists():
            stats = self._create_stats_from_api(player)
        
        if stats and stats.exists():
            serializer = StatSerializer(stats, many=True)
            return Response(serializer.data)
        
        return Response(
            {"error": "No stats found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    def _create_stats_from_api(self, player):
        """Create player stats from external API"""
        try:
            external_stats = get_player_stats(player.first_name, player.last_name, '2023-24')
            if not external_stats:
                return Stat.objects.none()
            
            stats_to_create = []
            for stat_data in external_stats:
                game = GameService.get_or_create_game(player.team, stat_data['game']['date'])
                
                if game:
                    # Use .get() with defaults to handle missing fields gracefully
                    stats_to_create.append(Stat(
                        minutes=stat_data['stats'].get('minutes', 0),
                        points=stat_data['stats'].get('points', 0),
                        offensive_rebounds=stat_data['stats'].get('rebounds', {}).get('offensive', 0),
                        defensive_rebounds=stat_data['stats'].get('rebounds', {}).get('defensive', 0),
                        assists=stat_data['stats'].get('assists', 0),
                        steals=stat_data['stats'].get('steals', 0),
                        blocks=stat_data['stats'].get('blocks', 0),
                        fgm=stat_data['stats'].get('fieldGoals', {}).get('made', 0),
                        fga=stat_data['stats'].get('fieldGoals', {}).get('attempted', 0),
                        tpm=stat_data['stats'].get('threePointers', {}).get('made', 0),
                        tpa=stat_data['stats'].get('threePointers', {}).get('attempted', 0),
                        ftm=stat_data['stats'].get('freeThrows', {}).get('made', 0),
                        fta=stat_data['stats'].get('freeThrows', {}).get('attempted', 0),
                        turnovers=stat_data['stats'].get('turnovers', 0),
                        fouls=stat_data['stats'].get('personalFouls', 0),
                        game=game,
                        player=player
                    ))
            
            if stats_to_create:
                with transaction.atomic():
                    # Use bulk_create with ignore_conflicts to handle duplicates
                    Stat.objects.bulk_create(stats_to_create, ignore_conflicts=True)
                    
                    # Return the created stats
                    return Stat.objects.filter(player=player).select_related(
                        'game', 'game__home', 'game__away'
                    ).order_by('-game__date')
            
            return Stat.objects.none()
            
        except Exception as e:
            logger.error(f"Error creating stats for player {player.first_name} {player.last_name}: {e}")
            return Stat.objects.none()
