'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import axios from 'axios'
import NotAuthenticated from '../../../components/NotAuthenticated'
import { useSession } from 'next-auth/react'

type Team = {
  team_city: string
  team_name: string
  team_conference: string
  team_division: string
}

export default function Team(){
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [team, setTeam] = useState<Team>()
  const city = searchParams.get('city')
  const teamName = searchParams.get('team')

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getTeam = async () => {
      try{
        setLoading(true)
        const response = await axios.get(`/api/django/api/team/${city}/${teamName}`)

        setTeam(response.data)
      }
      catch(error){
        console.error('Error getting team data: ', error)
        alert('Error getting team data')
      }
      finally{
        setLoading(false)
      }
    }

    getTeam()
  }, [city, teamName])

  const goToGames = () => {
    router.push(`/home/search/team/games?team=${encodeURIComponent(city + '-' + team)}&id=${team.team_id}`)
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
          <h1>Team data loading</h1>
        </div>
      </div>
    )
  }

  if(!team){
    return (
       <div className='bg-gray-100 w-screen h-screen flex justify-center items-center text-black'>
        <div className='bg-white flex flex-col gap-4 p-10 items-center rounded-lg shadow-lg'>
          <h1>No Team Data Found</h1>
          <button className='hover:text-blue-500' onClick={() => router.back()}>Go Back</button>
        </div>
      </div>
    )
  }

  return(
    <div className='bg-gray-100 w-screen h-screen flex justify-center items-center text-black'>
      <div className='bg-white flex flex-col gap-4 p-10 items-center rounded-lg shadow-lg w-1/2'>
        <h1 className='text-xl'>Team Page</h1>
        <h1>City: {team.team_city}</h1>
        <h1>Name: {team.team_name}</h1>
        <h1>Conference: {team.team_conference}</h1>
        <h1>Division: {team.team_division}</h1>

        <button onClick={goToGames} className='hover:text-blue-500'>Go To Team Games</button>
        <button onClick={() => router.back()} className='hover:text-blue-500'>Go Back</button>
      </div>
    </div>
  )

}
