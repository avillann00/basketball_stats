# **Basketball Stats App** 

### At A Glance

This repo contains the full stack app for basketball stats and stat prediction.

The app uses React, Django, and PostgreSQL to collect the information and show it to the user.

### Frontend

Features:
- Multiple Pages to show basic and advanced stats for individual players and teams.
- Also has a game and stat prediction feature so the user can see if a team will win their next matchup or what a player will do.
- Implements OAuth to make sure users are protected

### Backend

Features:
- Creates a Django Rest API framework that seamlessly sends data to the frontend
- Uses a robust PostgreSQL database to store information securely
- Uses JWT Tokens to provide advanced security
- Utilizes dependable machine learning models to predict data

### How To Use

1. Create a .env file with the appropriate environment variables
2. Install the Node dependencies in the frontend directory
3. Install the Python dependencies in the backend directory
4. Do 'npm start' in the frontend directory
5. Do 'python3 manage.py runserver' in the backend directory
6. Go to your web browser at 'http://localhost:3000'
