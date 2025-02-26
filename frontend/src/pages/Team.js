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

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000'
    axios.get(`${apiUrl}/api/team/${city}/${team}`, {
      headers: {
        'Authorization': `Bearer ${authTokens.access}`
      }
    })
    .then(response => setData(response.data))
    .catch(error => console.error('Error occurred getting team', error))
  }, [authTokens, city, team, navigate])

  const goToGames = () => {
    navigate(`/games/${data.team_id}`, { state: { city, team } })
    return
  }

  if(!data){
    return (
      <div>
        <h1>No Team Data Found</h1>
        <h1>It May Be Loading Wait A Couple Minutes</h1>
        <button onClick={() => navigate('/search')}>Go Back</button>
      </div>
    )
  }

  return (
    <div>
      <h1>Team Page</h1>
      <h1>City: {data.team_city}</h1>
      <h1>Name: {data.team_name}</h1>
      <h1>Conference: {data.team_conference}</h1>
      <h1>Division: {data.team_division}</h1>

      <button onClick={goToGames}>Go To Team Games</button>
      <button onClick={() => navigate('/search')}>Go Back</button>
    </div>
  )
}

export default Team
