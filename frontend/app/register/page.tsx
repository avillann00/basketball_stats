'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from 'axios'

export default function Register(){
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if(password1 !== password2){
      alert('Passwords Do Not Match!')
      return
    }

    try{
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      await axios.post(`${apiUrl}/users/register/`, {
        username: username,
        email: email,
        password: password1
      })
      router.push('/login')
    } 
    catch(error){
      console.error('Error Registering User: ', error)
    }
  }

  return(
    <div className='bg-gray-100 w-screen h-screen text-black flex flex-col items-center justify-center'>
      <div className='bg-white px-10 py-10 rounded-lg gap-4 shadow-lg flex flex-col'>
        <h1 className='text-center text-2xl'>Hi, Welcome To The Register Page</h1>
        <h1 className='text-center text-lg'>Enter Your Username, Email, And Password To Continue</h1>
        <form onSubmit={handleSubmit} className='flex flex-col items-center justify-center gap-2'>
          <input
            type='text'
            placeholder='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='text-center'
          /> 
          <input
            type='text'
            placeholder='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='text-center'
          />
          <input
            type='password'
            placeholder='password'
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            className='text-center'
          /> 
          <input
            type='password'
            placeholder='confirm password'
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className='text-center'
          />
          <button className='mt-4 hover:text-blue-500' type='submit'>Register</button>
        </form>
        <button onClick={() => router.push('/login')} className='hover:text-blue-500'>Already Have An Account?</button>
      </div>
    </div>
  )

}
