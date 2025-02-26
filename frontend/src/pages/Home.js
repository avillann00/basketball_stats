import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../components/AuthContext'

function Home() {
  const navigate = useNavigate()
  const { authTokens, logoutUser } = useContext(AuthContext)

  if(!authTokens){
    navigate('/login')
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <div>
      <h1>Hello, Welcome To The Basketball Stats And Betting App!</h1>
      <h1>Press Search To Begin Looking At Players, Teams, Stats, And Games</h1>
      <button onClick={() => navigate('/search')}>Search</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Home
