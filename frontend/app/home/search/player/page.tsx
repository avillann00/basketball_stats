'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import NotAuthenticated from '../../../components/NotAuthenticated'
import { useSession } from 'next-auth/react'

type Player = {
  player_id: string
  first_name: string
  last_name: string
  player_number: string
  player_weight: string
  player_height: string
  seasons: string
  position: string
  year_started: string
  draft_pick: string
  draft_year: string
}

export default function Player(){
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [player, setPlayer] = useState<Player>()
  const first = searchParams.get('first')
  const last = searchParams.get('last')

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getPlayer = async () => {
      try{
        setLoading(true)

        const response = await axios.get(`/api/django/api/player/${first}/${last}`)

        setPlayer(response.data)
      }
      catch(error){
        console.error('Error getting player data: ', error)
        alert('Error getting team data')
      }
      finally{
        setLoading(false)
      }
    }

    getPlayer()
  }, [first, last])

  const goToStats = () => {
    router.push(`/home/search/player/stats?player=${encodeURIComponent(first + '-' + last)}&id=${player.player_id}`)
  }

  if(!session){
    return(
      <div className='bg-gray-100 w-screen h-screen flex justify-center items-center text-black'>
        <div className='bg-white flex flex-col gap-4 p-10 items-center rounded-lg shadow-lg'>
          <NotAuthenticated />
        </div>
      </div>
    )
  }

  if(loading){
    return (
       <div className='bg-gray-100 w-screen h-screen flex justify-center items-center text-black'>
        <div className='bg-white flex flex-col gap-4 p-10 items-center rounded-lg shadow-lg'>
          <h1>Player data loading</h1>
        </div>
      </div>
    )
  }

  if(!player){
    return (
      <div className='bg-gray-100 w-screen h-screen flex justify-center items-center text-black'>
        <div className='bg-white flex flex-col gap-4 p-10 items-center rounded-lg shadow-lg'>
          <h1>No Player Data Found</h1>
          <button onClick={() => router.back()} className='hover:text-blue-500'>Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gray-100 w-screen h-screen flex justify-center items-center text-black'>
      <div className='bg-white flex flex-col gap-4 p-10 items-center rounded-lg shadow-lg w-1/2'>
        <h1 className='text-xl'>Player Page</h1>
        <h1>First Name: {player.first_name}</h1> 
        <h1>Last Name: {player.last_name}</h1> 
        <h1>Number: {player.player_number}</h1> 
        <h1>Weight: {player.player_weight}</h1> 
        <h1>Height: {player.player_height}</h1> 
        <h1>Seasons Played: {player.seasons}</h1> 
        <h1>Position: {player.position}</h1> 
        <h1>Year Started: {player.year_started}</h1> 
        <h1>Draft Year: {player.draft_year}</h1> 
        <h1>Draft Pick: {player.draft_pick}</h1> 

        <button onClick={goToStats} className='hover:text-blue-500'>Go To Player Stats</button>
        <button onClick={() => router.back()} className='hover:text-blue-500'>Go Back</button>
      </div>
    </div>
  )
}
