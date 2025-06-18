'use client'

import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import NotAuthenticated from '../components/NotAuthenticated'

export default function Home(){
  const router = useRouter()
  const { data: session, status } = useSession()

  return(
    <div className='w-screen h-screen bg-gray-100 text-black flex items-center justify-center'>
      <div className='bg-white shadow-lg rounded-lg py-10 px-10 flex flex-col items-center gap-4'>
        {session ? (
          <>
            <h1>Hello, Welcome To The Basketball Stats And Betting App!</h1>
            <h1>Press Search To Begin Looking At Players, Teams, Stats, And Games</h1>
            <button onClick={() => router.push('/home/search')} className='hover:text-blue-500'>Search</button>
            <button onClick={() => signOut({ callbackUrl: '/' })} className='hover:text-blue-500'>Logout</button>
          </>
        ) : (
          <NotAuthenticated />
        )}
      </div>
    </div>
  )
}
