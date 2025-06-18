import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { cookies } from 'next/headers'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials){
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
          }),
        }) 
        const data = await res.json() 
        if(res.ok && data){
          return{
            ...data.user,
            djangoAccessToken: data.access,
            djangoRefreshToken: data.refresh,
          } 
        }
        return null 
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async signIn({ user, account }){
      if(account && ['credentials'].includes(account.provider)){
        return true
      }
      return false
    },

    async redirect({ url, baseUrl }){
      if (url.startsWith('/')) return `${baseUrl}${url}` 
      if (url.startsWith(baseUrl)) return url 
      return baseUrl 
    },

    async jwt({ token, user, account }){
      if(account && user){
        if(account.provider === 'credentials'){
          try{
            const cookieStore = await cookies() 

            const existingDjangoAccessToken = cookieStore.get('django-access-token') 
            if(user.djangoAccessToken && !existingDjangoAccessToken){
              cookieStore.set('django-access-token', user.djangoAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 365,
                path: '/'
              }) 
            }

            const existingDjangoRefreshToken = cookieStore.get('django-refresh-token') 
            if(user.djangoRefreshToken && !existingDjangoRefreshToken){
              cookieStore.set('django-refresh-token', user.djangoRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 365,
                path: '/'
              }) 
            }

            const userInfo = {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
            } 

            const existingUserInfo = cookieStore.get('user-info') 
            if(userInfo && !existingUserInfo){
              cookieStore.set('user-info', JSON.stringify(userInfo), {
                httpOnly: false, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
              }) 
            }

            token.id = user.id 
            token.userId = user.id 
            token.email = user.email 
            token.first_name = user.first_name 
            token.last_name = user.last_name 
            token.username = user.username 
          } 
          catch(error){
            console.log('Error in jwt() function: ', error) 
          }
        }
      }

      return token 
    },

    async session({ session, token }){
      session.user = {
        ...session.user,
        id: token.id,
        email: token.email,
        first_name: token.first_name,
        last_name: token.last_name,
        username: token.username,
      } 
      return session 
    }
  },

  events: {
    async signOut(){
      try{
        const cookieStore = await cookies() 
        cookieStore.delete('django-access-token') 
        cookieStore.delete('django-refresh-token') 
        cookieStore.delete('user-info') 
        console.log('Cookies cleared on sign out') 
      } 
      catch(error){
        console.error('Failed to clear cookies:', error) 
      }
    }
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET
}) 

export { handler as GET, handler as POST } 
