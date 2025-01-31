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

def get_player_id(first_name, last_name):
    url = get_api_url('player', first_name=first_name, last_name=last_name)
    response = requests.get(url, headers=headers).json()

    player = next((player for player in response if player['firstName'] == first_name and player['lastName'] == last_name), None)

    if player:
        player_id = player['personId']
        
        return player_id
    else:
        return None

def get_player_stats(first_name, last_name, season):
    player_id = get_player_id(first_name, last_name)
    url = get_api_url('player_stats', player_id=player_id, season=season)

    time.sleep(30)

    response = requests.get(url, headers=headers).json()

    return response

def get_team_games(team_name, seasons):
    api = BalldontlieAPI(api_key=str(os.environ.get('NBA_API_KEY')))
    teams = api.nba.teams.list()
    
    for team in teams.data:
        if team.full_name == team_name:
            id = team.id

            games = api.nba.games.list(team_ids=[id], seasons=seasons)
            return games.data

    return None
