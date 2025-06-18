'use client'

import { useRouter } from 'next/navigation'

export default function NotAuthenticated(){
  const router = useRouter()
  
  return(
    <>
      <h1>You need to sign in first</h1>
      <button className='hover:text-blue-500' onClick={() => router.push('/login')}>Login</button>
    </>
  )
}
