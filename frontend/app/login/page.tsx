'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await signIn('credentials', {
      redirect: false,
      username: username,
      password: password
    })

    if(response?.ok){
      alert('Login success.')
      router.push('/home')
    }
    else{
      alert('Login error.')
    }
  }

  return(
    <div className='bg-gray-100 w-screen h-screen text-black flex flex-col items-center justify-center'>
      <div className='bg-white px-10 py-10 rounded-lg gap-4 shadow-lg flex flex-col'>
        <h1 className='text-center text-2xl'>Hi, Welcome To The Login Page</h1>
        <h1 className='text-center text-lg'>Please Enter Your Username And Password</h1>
        <form onSubmit={handleSubmit} className='flex flex-col items-center justify-center gap-2'>
          <input
            type='text'
            placeholder='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='text-center'
          />
          <input
            type='password'
            placeholder='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='text-center'
          />
          <button type='submit' className='mt-4 hover:text-blue-500'>Login</button>
        </form>
        <button onClick={() => router.push('/register')} className='hover:text-blue-500'>Need An Account?</button>
      </div>
    </div>
  )
}
