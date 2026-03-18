import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USERNAME = 'megaman'
const ADMIN_PASSWORD = 'megatheeth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return NextResponse.json({ authenticated: true })
    }

    return NextResponse.json(
      { authenticated: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}
