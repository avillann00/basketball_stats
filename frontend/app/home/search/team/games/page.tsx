'use client'

import axios from 'axios'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import NotAuthenticated from '../../../../components/NotAuthenticated'
import { useSession } from 'next-auth/react'

type Game = {
  game_id: string
  home: {
    team_city: string
    team_name: string
  }
  away: {
    team_city: string
    team_name: string
  }
  home_score: string
  away_score: string
  date: string
  season: string
  post_season: string
}

export default function Games(){
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [games, setGames] = useState<Game[]>()
  const id = searchParams.get('id')
  const team = searchParams.get('team') ? searchParams.get('team').split('-') : ['Unknown', 'Team']

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getGames = async () => {
      try{
        setLoading(true)
        const response = await axios.get(`/api/django/api/games/${id}`)
        setGames(response.data)
      }
      catch(error){
        console.error('Error getting player stats: ', error)
        alert('Error getting team games')
      }
      finally{
        setLoading(false)
      }
    }

    getGames()
  }, [id, team])

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
          <h1>Game data loading</h1>
        </div>
      </div>
    )
  }

  if(!games){
    return(
      <div className='bg-gray-100 w-screen h-screen flex justify-center items-center text-black'>
        <div className='bg-white flex flex-col gap-4 p-10 items-center rounded-lg shadow-lg'>
          <h1>No Games Found</h1>
          <button className='hover:text-blue-500' onClick={() => router.back()}>Go Back</button>
        </div>
      </div>
    )
  }
  
  const mappedGames = games?.map((game: Game) => (
    <li key={game.game_id} className='border border-black py-4 px-4'>
      <h3>Home Team: {game.home.team_city} {game.home.team_name}</h3>
      <h3>Away Team: {game.away.team_city} {game.away.team_name}</h3>
      <h3>Home Team Score: {game.home_score}</h3>
      <h3>Away Team Score: {game.away_score}</h3>
      <h3>Date: {game.date}</h3>
      <h3>Season: {game.season}</h3>
      <h3>Post Season: {game.post_season === 'true' ? 'True' : 'False'}</h3>
    </li>
  ))

  return(
    <div className='bg-gray-100 w-screen h-screen flex justify-center items-center text-black'>
      <div className='bg-white flex flex-col gap-4 p-10 items-center rounded-lg shadow-lg w-1/2 min-h-1/2'>
        <h1>{team[0]} {team[1]} Games Page</h1>
        <ul className='overflow-y-auto'>
          {mappedGames}
        </ul>
        <button onClick={() => router.back()} className='hover:text-blue-500'>Go Back</button>
      </div>
    </div>
  )

}
