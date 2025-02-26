import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import AuthContext from '../components/AuthContext'

function Games() {
  const navigate = useNavigate()
  const { authTokens } = useContext(AuthContext)
  const [data, setData] = useState(null)
  const { id } = useParams()
  const location = useLocation()
  const { city, team } = location.state || {}

  useEffect(() => {
    if(!authTokens){
      navigate('/login')
      return
    }

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000'
    axios.get(`${apiUrl}/api/games/${id}`, {
      headers: {
        'Authorization': `Bearer ${authTokens.access}`
      }
    })
    .then(response => setData(response.data))
    .catch(error => console.error('Error getting games data: ', error))
  }, [authTokens, id, navigate])

  if(!data){
    return (
      <div>
        <h1>No Games Found</h1>
        <h1>It May Be Loading Wait A Couple Minutes</h1>
        <button onClick={() => navigate(`/team/${city}/${team}`)}>Go Back</button>
      </div>
    )
  }
  
  const games = data.map((item) => (
    <li key={item.game_id}>
      <h3>Home Team: {item.home.team_city} {item.home.team_name}</h3>
      <h3>Away Team: {item.away.team_city} {item.away.team_name}</h3>
      <h3>Home Team Score: {item.home_score}</h3>
      <h3>Away Team Score: {item.away_score}</h3>
      <h3>Date: {item.date}</h3>
      <h3>Season: {item.season}</h3>
      <h3>Post Season: {item.post_season ? 'True': 'False'}</h3>
    </li>
  ))

  return (
    <div>
      <h1>{city} {team} Games Page</h1>
      <ul>
        {games}
      </ul>
      <button onClick={() => navigate(`/team/${city}/${team}`)}>Go Back</button>
    </div>
  )
}

export default Games
