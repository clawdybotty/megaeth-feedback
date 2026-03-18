import { NextRequest, NextResponse } from 'next/server'
import { getAllApps, createApp } from '@/lib/db'
import { checkAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const apps = getAllApps()
    return NextResponse.json({ data: apps })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch apps' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, slug, knownIssues } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Auto-generate slug from name if not provided
    const finalSlug = slug || name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const app = createApp({
      slug: finalSlug,
      name,
      knownIssues,
    })

    return NextResponse.json({ data: app }, { status: 201 })
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'App with this slug already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create app' },
      { status: 500 }
    )
  }
}
