import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from '../components/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  function goToRegister() {
    navigate('register/')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await loginUser(username, password)
    navigate('/')
  }

  return (
    <div>
      <h1>Hi, Welcome To The Login Page</h1>
      <h1>Please Enter Your Username And Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type='text'
          placeholder='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type='Submit'>Login</button>
      </form>
      <button onClick={goToRegister}>Need An Account?</button>
    </div>
  )
}

export default Login
