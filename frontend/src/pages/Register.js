import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from 'axios'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const navigate = useNavigate()

  function goToLogin() {
    navigate('login/')
  } 

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!password1 === password2) {
      alert('Passwords Do Not Match!')
      return
    }
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000'
      await axios.post(`${apiUrl}/users/register/`, {
        username: username,
        email: email,
        password: password
      })
    } 
    catch (error) {
      console.error('Error Registering User: ', error)
    }
  }

  return (
    <div>
      <h1>Hi, Welcome To The Register Page</h1>
      <h1>Enter Your Username, Email, And Password To Continue</h1>
      <form>
        <input
          type='text'
          placeholder='username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        /> 
        <input
          type='text'
          placeholder='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type='password'
          placeholder='password'
          value={password1}
          onChange={(e) => setPassword1(e.target.value)}
        /> 
        <input
          type='password'
          placeholder='confirm password'
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
        <button type='submit'>Register</button>
      </form>
      <button onClick={goToLogin}>Already Have An Account?</button>
    </div>
  )
}
