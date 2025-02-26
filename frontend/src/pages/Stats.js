import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import AuthContext from '../components/AuthContext'

function Stats() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const { authTokens } = useContext(AuthContext)
  const { id } = useParams()
  const location = useLocation()
  const { first, last } = location.state || {}

  useEffect(() => {
    if(!authTokens){
      navigate('/login')
      return
    }
    
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000'
    axios.get(`${apiUrl}/api/stats/${id}/`, {
      headers: {
        'Authorization': `Bearer ${authTokens.access}`
      }
    })
    .then(response => setData(response.data))
    .catch(error => console.error('Error getting player stats', error))
  }, [authTokens, id, navigate])

  if(!data){
    return (
      <div>
        <h1>No Player Stats Found</h1>
        <h1>It May Be Loading Wait A Couple Minutes</h1>
        <button onClick={() => navigate(`/player/${first}/${last}`)}>Go Back</button>
      </div>
    )
  }


  const stats = data.map((item) => (
    <li key={item.id}>
      <h3>Date: {item.game.date}</h3>
      <h3>Minutes: {item.minutes}</h3>
      <h3>Points: {item.points}</h3>
      <h3>Offensive Rebounds: {item.offensive_rebounds}</h3>
      <h3>Defensive Rebounds: {item.defensive_rebounds}</h3>
      <h3>Assists: {item.assists}</h3>
      <h3>Steals: {item.steals}</h3>
      <h3>Blocks: {item.blocks}</h3>
      <h3>Field Goals Made: {item.fgm}</h3>
      <h3>Field Goals Attempted: {item.fga}</h3>
      <h3>Three Pointers Made: {item.tpm}</h3>
      <h3>Three Pointers Attempted: {item.tpa}</h3>
      <h3>Free Throws Made: {item.ftm}</h3>
      <h3>Free Throws Attempted: {item.fta}</h3>
      <h3>Turnovers: {item.turnovers}</h3>
      <h3>Fouls: {item.fouls}</h3>
    </li>
  ))

    return (
    <div>
      <h1>{first} {last} Stats</h1>
      <ul>
        {stats}
      </ul>
      <button onClick={() => navigate(`/player/${first}/${last}`)}>Go Back</button>
    </div>
  )
}

export default Stats
