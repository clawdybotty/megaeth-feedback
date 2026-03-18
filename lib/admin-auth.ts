import { NextRequest } from 'next/server'

const ADMIN_USERNAME = 'megaman'
const ADMIN_PASSWORD = 'megatheeth'

export function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false
  }

  try {
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    const [username, password] = credentials.split(':')

    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
  } catch {
    return false
  }
}
