import React, { useEffect, useState, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AuthContext from '../components/AuthContext'
import axios from 'axios'

function Player() {
  const navigate = useNavigate()
  const { first, last } = useParams()
  const [data, setData] = useState(null)
  const { authTokens } = useContext(AuthContext)

  useEffect(() => {
    if(!authTokens){
      navigate('/login')
      return
    }

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000'
    axios.get(`${apiUrl}/api/player/${first}/${last}`, {
      headers: {
        'Authorization': `Bearer ${authTokens.access}`
      }
    })
    .then(response => setData(response.data))
    .catch(error => console.error('Error occurred getting player: ', error))


  }, [authTokens, first, last, navigate])

  const goToStats = () => {
    navigate(`/stats/${data.player_id}`, { state: { first, last } })
    return
  }

  if(!data){
    return (
      <div>
        <h1>No Player Data Found</h1>
        <h1>It May Be Loading Wait A Couple Minutes</h1>
        <button onClick={() => navigate('/search')}>Go Back</button>
      </div>
    )
  }

  return (
    <div>
      <h1>Player Page</h1>
      <h1>First Name: {data.first_name}</h1> 
      <h1>Last Name: {data.last_name}</h1> 
      <h1>Number: {data.player_number}</h1> 
      <h1>Weight: {data.player_weight}</h1> 
      <h1>Height: {data.player_height}</h1> 
      <h1>Seasons Played: {data.seasons}</h1> 
      <h1>Position: {data.position}</h1> 
      <h1>Year Started: {data.year_started}</h1> 
      <h1>Draft Year: {data.draft_year}</h1> 
      <h1>Draft Pick: {data.draft_pick}</h1> 

      <button onClick={goToStats}>Go To Player Stats</button>
      <button onClick={() => navigate('/search')}>Go Back</button>
    </div>
  )
}

export default Player
