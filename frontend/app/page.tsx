'use client'

import { useRouter } from 'next/navigation'

export default function Home(){
  const router = useRouter()

  return(
    <div className='w-screen h-screen bg-gray-100 flex items-center justify-center'>
      <div className='text-black border px-4 py-4 rounded-lg bg-white shadow-lg flex flex-col items-center justify-center'>
        <div className='flex flex-col text-center'>
          <h1>Welcome to the Basketball stats and betting app</h1>
          <h1>Login to get started</h1>
        </div>
        <button
          onClick={() => router.push('/login')}
          className='hover:text-blue-500'
        >
          Login
        </button>
      </div>
    </div>
  )
}
