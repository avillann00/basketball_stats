import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AuthContext from '../components/AuthContext'
import axios from 'axios'

function Team() {
  const navigate = useNavigate()
  const { city, team } = useParams()
  const [data, setData] = useState(null)
  const { authTokens } = useContext(AuthContext)

  useEffect(() => {
    if(!authTokens){
      navigate('/login')
      return
    }

    const apiUrl = process.env.REACT_APP_API_URL || 'https://localhost:8000'
    axios.get(`${apiUrl}/api/team/${city}/${team}`, {
      headers: {
        'Authorization': `Bearer ${authTokens}`
      }
    })
    .then(response => setData(response.data))
    .catch(error => console.error('Error occurred getting team', error))
  }, [authTokens, city, team])

  const goToGames = () => {
    naviage(`/games/${data.team_id}`)
    return
  }

  if(!data){
    return (
      <h1>No Team Data Found</h1>
      <button onClick={() => navigate('/search')}>Go Back</button>
    )
  }

  return (
    <h1>Team Page</h1>
    <h1>City: {data.team_city}</h1>
    <h1>Name: {data.team_name}</h1>
    <h1>Conference: {data.team_conference}</h1>
    <h1>Division: {data.team_division}</h1>

    <button onClick={goToGames}>Go To Team Games</button>
    <button onClick={() => navigate('/search')>Go Back</button>
  )
}

export defualt Team
