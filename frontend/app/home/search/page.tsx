'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import NotAuthenticated from '../../components/NotAuthenticated'

export default function Search(){
  const { data: session, status } = useSession()
  const [input, setInput] = useState('')
  const [type, setType] = useState('')

  const router = useRouter()

  const handleSubmit = () => {
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
      router.push(`/home/search/player?first=${first}&last=${last}`)
    }
    else{
      router.push(`/home/search/team?city=${first}&team=${last}`)
    }
  }

  return (
    <div className='bg-gray-100 h-screen w-screen text-black flex items-center justify-center'>
      <div className='bg-white shadow-lg rounded-lg flex flex-col justify-center items-center p-10 gap-4'>
        {session ? (
          <>
            <div className='text-xl text-center'>
              <h1>Enter A Player Or Team Name</h1>
              <h1>Make Sure It Is Just The First And Last Name Or The City Then Team Name</h1>
              <h1>Also Make Sure The First Letter Of Each Word Is Capitalized</h1>
            </div>
            <form onSubmit={handleSubmit} className='flex flex-col items-center gap-4 w-full'>
              <div className='flex flex-row gap-4'>
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
              </div>
              <input
                type='text'
                placeholder='e.g., Paolo Banchero or Orlando Magic'
                element={input}
                onChange={(e) => setInput(e.target.value)}
                className='w-full text-center'
              />
              <button type='submit' className='hover:text-blue-500'>Submit</button>
            </form>
            <button onClick={() => router.push('/home')} className='hover:text-blue-500'>Go Home</button>
          </>
        ) : (
          <NotAuthenticated />
        )}
      </div>
    </div>
  )

}
