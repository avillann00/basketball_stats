from rest_framework.views import APIView, Response
from .models import Team, Player, Stat, Game
from rest_framework.permissions import IsAuthenticated
from .serializers import PlayerSerializer, TeamSerializer, GameSerializer, StatSerializer
from rest_framework import status
from stats.main import get_player, get_player_stats, get_team, get_team_games

class PlayerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, first, last):
        player = Player.objects.get(first_name=first, last_name=last)

        if not player:
            new_player = get_player(first, last)
            if new_player:
                team = Team.objects.get(team_name=new_player['team']['team_name'])
                if not team:
                    new_team = get_team(new_player['team']['teamCity'] + new_player['team']['teamName'])
                    if new_team:
                        team = Team.objects.create(
                            team_id=new_team.id,
                            team_name=new_team.name,
                            team_city=new_team.city,
                            team_conference=new_team.conference,
                            team_division=new_team.division
                        )
                player = Player.objects.create(
                    player_id=new_player['personId'],
                    first_name=new_player['firstName'],
                    last_name=new_player['lastName'],
                    player_number=new_player['jersey'],
                    player_height=new_player['height'],
                    player_weight=new_player['weight'],
                    seasons=new_player['seasonsExp'],
                    position=new_player['position'],
                    year_started=new_player['fromYear'],
                    draft_year=new_player['draft']['draftYear'],
                    draft_pick=new_player['draft']['draftNumber'],
                    team=team
                )

                serializer = PlayerSerializer(player)
                return Response(serializer.data)
        elif player:
            serializer = PlayerSerializer(player)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

class TeamView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, city, team):
        team = Team.objects.get(team_name=team, team_city=city)

        if not team:
            new_team = get_team(city + team)
            if new_team:
                team = Team.objects.create(
                    team_id=new_team.id,
                    team_name=new_team.name,
                    team_city=new_team.city,
                    team_conference=new_team.conference,
                    team_division=new_team.division
                )

                serializer = TeamSerializer(team)
                return Response(serializer.data)
        elif team:
            serializer = TeamSerializer(team)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
 
class GameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        team = Team.objects.get(team_id=pk)
        games = Game.objects.filter(home=team)

        if not games:
            new_games = get_team_games(team.team_city + team.team_name, [2023-2024], None)
            if games:

                def find_team(team_city, team_name):
                    other_team = Team.objects.get(team_name=team_name)
                    if not team:
                        new_team = get_team(team_city + team_name)
                        if new_team:
                            other_team = Team.objects.create(
                                team_id=new_team.id,
                                team_name=new_team.name,
                                team_city=new_team.city,
                                team_conference=new_team.conference,
                                team_division=new_team.division
                            )

                    return other_team

                games_to_create = [Game(
                    game_id=games[i].id,
                    home=team,
                    away=find_team(games[i].visitor_team.city, games[i].visitor_team.name),
                    home_score=games[i].home_team_score,
                    away_score=games[i].visitor_team_score,
                    date=games[i].date,
                    season=games[i].season,
                    post_season=games[i].postseason) for i in range(games.__len__())]

                new_games = Game.objects.bulk_create(games_to_create)

                serializer = GameSerializer(new_games, many=True)
                return Response(serializer.data)
        elif games:
            serializer = GameSerializer(games)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

class StatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        player = Team.objects.get(player_id=pk)
        stats = Stat.objects.filter(player=player)

        if not stats:
            new_stats = get_player_stats(player.first_name, player.last_name, '2023-24')
            if new_stats:
                
                def find_game(team, matchup, date):
                    game = Game.objects.get(date=date, home=team)
                    if not game.exists():
                        game = Game.objects.get(date=date, away=team)
                        if not game.exists():
                            new_game = get_team_games(team.team_city + team.team_name, [2023-2024], date)
                            if new_game:
                                def find_team(team_city, team_name):
                                    other_team = Team.objects.get(team_name=team_name)
                                    if not other_team:
                                        new_team = get_team(team_city + team_name)
                                        if new_team:
                                            other_team = Team.objects.create(
                                                team_id=new_team.id,
                                                team_name=new_team.name,
                                                team_city=new_team.city,
                                                team_conference=new_team.conference,
                                                team_division=new_team.division
                                            )
                                    return other_team

                                game = Game.objects.create(
                                    game_id=new_game[0].id,
                                    home=team,
                                    away=find_team(new_game[0].visitor_team.name, new_game[0].visitor_team.name),
                                    home_score=new_game[0].home_team_score,
                                    away_score=new_game[0].visitor_team_score,
                                    date=new_game[0].date,
                                    season=new_game[0].season,
                                    post_season=new_game[0].postseason
                                )

                    return game

                stats_to_create = [Stat(
                    minutes=new_stats[i]['stats']['minutes'],
                    points=new_stats[i]['stats']['points'],
                    offensive_rebounds=new_stats[i]['stats']['rebounds']['offensive'],
                    defensive_rebounds=new_stats[i]['stats']['rebounds']['defensive'],
                    assists=new_stats[i]['stats']['assists'],
                    steals=new_stats[i]['stats']['steals'],
                    blocks=new_stats[i]['stats']['blocks'],
                    fgm=new_stats[i]['stats']['fieldGoals']['made'],
                    fga=new_stats[i]['stats']['fieldGoals']['attempted'],
                    tpm=new_stats[i]['stats']['threePointers']['made'],
                    tpa=new_stats[i]['stats']['threePointers']['attempted'],
                    ftm=new_stats[i]['stats']['freeThrows']['made'],
                    fta=new_stats[i]['stats']['freeThrows']['attempted'],
                    turnovers=new_stats[i]['stats']['turnovers'],
                    fouls=new_stats[i]['stats']['personalFouls'],
                    game=find_game(player.team, new_stats[i]['game']['matchup'], new_stats[i]['game']['date']),
                    player=player) for i in range(len(new_stats))]

                new_stats = Stat.objects.bulk_create(stats_to_create)

                serializer = StatSerializer(new_stats, many=True)
                return Response(serializer.data)
        elif stats:
            serializer = StatSerializer(stats)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
