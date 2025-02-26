from rest_framework.views import APIView, Response
from .models import Team, Player, Stat, Game
from rest_framework.permissions import IsAuthenticated
from .serializers import PlayerSerializer, TeamSerializer, GameSerializer, StatSerializer
from rest_framework import status
from stats.main import get_player, get_player_stats, get_team, get_team_games
from datetime import datetime

def find_team(team_city, team_name):
    other_team = Team.objects.filter(team_name=team_name).first()
    if not other_team:
        new_team = get_team(team_city, team_name)
        if new_team:
            other_team = Team.objects.create(
                team_id=new_team.id,
                team_name=new_team.name,
                team_city=new_team.city,
                team_conference=new_team.conference,
                team_division=new_team.division
            )

    return other_team

def find_game(team, date):
    try:
        date = date[:10]
        game = Game.objects.filter(date=date, home=team).first()
        if not game:
            game = Game.objects.filter(date=date, away=team).first()
            if not game:
                new_game = get_team_games(team.team_city, team.team_name, [2023], date)
                if new_game:
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
    except Exception as e:
        print(e)

class PlayerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, first, last):
        player = Player.objects.filter(first_name=first, last_name=last).first()
        if not player:
            new_player = get_player(first, last)
            if new_player:
                team = Team.objects.filter(team_name=new_player['team']['teamName']).first()
                if not team:
                    new_team = get_team(new_player['team']['teamCity'], new_player['team']['teamName'])
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
                    player_height=str(new_player['height']),
                    player_weight=int(new_player['weight']),
                    seasons=new_player['seasonExp'],
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

    def get(self, request, city_name, team_name):
        team = Team.objects.filter(team_name=team_name, team_city=city_name).first()

        if not team:
            new_team = get_team(city_name, team_name)
            if new_team:
                team, created = Team.objects.get_or_create(
                    team_id=new_team.id,
                    team_name=new_team.name,
                    team_city=new_team.city,
                    team_conference=new_team.conference,
                    team_division=new_team.division
                )

                if created: 
                    serializer = TeamSerializer(team)
                    return Response(serializer.data)
            return Response(status=status.HTTP_404_NOT_FOUND)
        elif team:
            serializer = TeamSerializer(team)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

class GameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        team = Team.objects.filter(team_id=pk).first()
        games = Game.objects.filter(home=team)

        if not games:
            new_games = get_team_games(team.team_city, team.team_name, [2024], None)
            if new_games:
                games_to_create = [Game(
                    game_id=new_games[i].id,
                    home=team,
                    away=find_team(new_games[i].visitor_team.city, new_games[i].visitor_team.name),
                    home_score=new_games[i].home_team_score,
                    away_score=new_games[i].visitor_team_score,
                    date=new_games[i].date,
                    season=new_games[i].season,
                    post_season=new_games[i].postseason ) for i in range(len(new_games))
                ]

                games = Game.objects.bulk_create(games_to_create)

                serializer = GameSerializer(games, many=True)
                return Response(serializer.data)
        elif games:
            serializer = GameSerializer(games, many=True)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
# only thing that is causing an error right now (date format is acting weird and i just got an error about a missing field 'minutes')
class StatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        player = Player.objects.filter(player_id=pk).first()
        stats = Stat.objects.filter(player=player)

        if not stats:
            new_stats = get_player_stats(player.first_name, player.last_name, '2023-24')
            if new_stats:
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
                    game=find_game(player.team, new_stats[i]['game']['date']),
                    player=player) for i in range(len(new_stats))
                ]

                new_stats = Stat.objects.bulk_create(stats_to_create)

                serializer = StatSerializer(new_stats, many=True)
                return Response(serializer.data)
        elif stats:
            serializer = StatSerializer(stats, many=True)
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
