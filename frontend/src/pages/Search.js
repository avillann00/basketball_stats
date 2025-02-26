import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../components/AuthContext'

function Search() {
  const [input, setInput] = useState('')
  const [type, setType] = useState('')
  const { authTokens } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = () => {
    if(!authTokens){
      navigate('/login')
      return
    }
    
    if(input.length < 2){
      alert('Please Enter A Complete Name')
      return
    }

    const names = input.split(' ')
    const first = names.slice(0, -1).join(' ')
    const last = names[names.length - 1]

    if(type === ''){
      alert('Please Select A Search Type')
      return
    }

    if(type === 'player'){
      navigate(`/player/${first}/${last}`)
    }
    else{
      navigate(`/team/${first}/${last}`)
    }
  }

  return (
    <div>
      <h1>Enter A Player Or Team Name</h1>
      <h1>Make Sure It Is Just The First And Last Name Or The City Then Team Name</h1>
      <h1>Also Make Sure The First Letter Of Each Word Is Capitalized</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type='radio'
            name='searchType'
            value='team'
            checked={type === 'team'}
            onChange={(e) => setType(e.target.value)}
          />
          Team
        </label>
        <label>
          <input
            type='radio'
            name='searchType'
            value='player'
            checked={type === 'player'}
            onChange={(e) => setType(e.target.value)}
          />
          Player
        </label>
        <input
          type='text'
          placeholder='e.g., Paolo Banchero or Orlando Magic'
          element={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type='submit'>Search</button>
      </form>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  )
}

export default Search
