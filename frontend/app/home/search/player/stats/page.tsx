'use client'

import axios from 'axios'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import NotAuthenticated from '../../../../components/NotAuthenticated'
import { useSession } from 'next-auth/react'

type Stat = {
  id: string
  game: {
    date: string
  }
  minutes: string
  points: string
  offensive_rebounds: string
  defensive_rebounds: string
  assists: string
  steals: string
  blocks: string
  fga: string
  fgm: string
  fta: string
  ftm: string
  tpa: string
  tpm: string
  turnovers: string
  fouls: string
}

export default function Stats(){
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const name = searchParams.get('player') ? searchParams.get('player').split('-') : ['Unknown', 'Player']
  const id = searchParams.get('id')
  const [stats, setStats] = useState<Stat[]>([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getStats = async () => {
      try{
        setLoading(true)
        const response = await axios.get(`/api/django/api/stats/${id}/`)
        setStats(response.data)
      }
      catch(error){
        console.error('Error getting player stats: ', error)
        alert('Error getting player stats')
      }
      finally{
        setLoading(false)
      }
    }

    getStats()
  }, [name, id])

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
          <h1>Stats data loading</h1>
        </div>
      </div>
    )
  }

  if(!data){
    return(
      <div className='bg-gray-100 w-screen h-screen flex justify-center items-center text-black'>
        <div className='bg-white flex flex-col gap-4 p-10 items-center rounded-lg shadow-lg'>
          <h1>No Player Stats Found</h1>
          <button className='hover:text-blue-500' onClick={() => router.back()}>Go Back</button>
        </div>
      </div>
    )
  }

  const mappedStats = stats?.map((stat: Stat) => (
    <li key={stats.id} className='border border-black py-4 px-4'>
      <h3>Date: {stat.game.date}</h3>
      <h3>Minutes: {stat.minutes}</h3>
      <h3>Points: {stat.points}</h3>
      <h3>Offensive Rebounds: {stat.offensive_rebounds}</h3>
      <h3>Defensive Rebounds: {stat.defensive_rebounds}</h3>
      <h3>Assists: {stat.assists}</h3>
      <h3>Steals: {stat.steals}</h3>
      <h3>Blocks: {stat.blocks}</h3>
      <h3>Field Goals Made: {stat.fgm}</h3>
      <h3>Field Goals Attempted: {stat.fga}</h3>
      <h3>Three Pointers Made: {stat.tpm}</h3>
      <h3>Three Pointers Attempted: {stat.tpa}</h3>
      <h3>Free Throws Made: {stat.ftm}</h3>
      <h3>Free Throws Attempted: {stat.fta}</h3>
      <h3>Turnovers: {stat.turnovers}</h3>
      <h3>Fouls: {stat.fouls}</h3>
    </li>
  ))

    return(
    <div className='bg-gray-100 w-screen h-screen flex justify-center items-center text-black'>
      <div className='bg-white flex flex-col gap-4 p-10 items-center rounded-lg shadow-lg w-1/2 min-h-1/2'>
        <h1>{name[0]} {name[1]} Stats</h1>
        <ul>
          {mappedStats}
        </ul>
        <button onClick={() => router.back()} className='hover:text-blue-500'>Go Back</button>
      </div>
    </div>
  )

}
