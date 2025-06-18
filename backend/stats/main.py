import requests
import os
from dotenv import load_dotenv
from pathlib import Path
from balldontlie import BalldontlieAPI
import time

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env')) 

headers = {
    'Authorization': str(os.environ.get('HOOP_API_KEY'))
}

urls = {
    'player': 'https://api.hoopdatahub.com/players?lastName={last_name}&firstName={first_name}',
    'player_stats': 'https://api.hoopdatahub.com/stats?playerID={player_id}&season={season}',
}

def get_api_url(endpoint, **kwargs):
    if endpoint in urls:
        return urls[endpoint].format(**kwargs)
    else: 
        raise ValueError('Invalid Endpoint')

def get_player(first_name, last_name):
    time.sleep(30)

    url = get_api_url('player', first_name=first_name, last_name=last_name)
    response = requests.get(url, headers=headers).json()

    if not isinstance(response, list):
        print(f'Unexpected player api response for {first_name} {last_name}: {response}')
        return None
    player = next((player for player in response if player['firstName'] == first_name and player['lastName'] == last_name), None)

    return player

def get_player_stats(first_name, last_name, season): # eg. season = '2023-24'
    player = get_player(first_name, last_name)
    if player:
        player_id = player['personId']
        url = get_api_url('player_stats', player_id=player_id, season=season)

        time.sleep(30)

        response = requests.get(url, headers=headers).json()

        return response

def get_team(team_city, team_name):
    full_name = team_city + ' ' + team_name
    api = BalldontlieAPI(api_key=str(os.environ.get('NBA_API_KEY')))
    teams = api.nba.teams.list()

    for team in teams.data:
            if team.full_name == full_name:

                return team

def get_team_games(team_city, team_name, seasons, date): # e.g. seasons = [2023-24]
    time.sleep(5)

    team = get_team(team_city, team_name)
    
    if team:
        team_id = team.id
        api = BalldontlieAPI(api_key=str(os.environ.get('NBA_API_KEY')))
        if date is None:
            games = api.nba.games.list(team_ids=[team_id], seasons=seasons, per_page=100)
        else:
            games = api.nba.games.list(team_ids=[team_id], seasons=seasons, per_page=100, dates=[date])

        return games.data
