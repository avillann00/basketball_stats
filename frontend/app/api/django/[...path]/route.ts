import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }){
  return handleRequest(request, await params, 'GET')
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }){
  return handleRequest(request, await params, 'POST')
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }){
  return handleRequest(request, await params, 'PUT')
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }){
  return handleRequest(request, await params, 'DELETE')
}

async function handleRequest(request: NextRequest, params: { path: string[] }, method: string){
  const cookieStore = await cookies()
  const djangoToken = cookieStore.get('django-access-token')?.value
  
  if(!djangoToken){
    return NextResponse.json({ error: 'No auth token' }, { status: 401 })
  }
  
  let pathString = params.path.join('/')
  
  if(!pathString.endsWith('/')){
    pathString += '/'
  }
  
  const body = method !== 'GET' ? await request.json() : undefined
  
  try{
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${pathString}`, {
      method,
      headers: {
        'Authorization': `Bearer ${djangoToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    
    if(!response.ok){
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  }
  catch(error){
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
