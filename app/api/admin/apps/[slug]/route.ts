import { NextRequest, NextResponse } from 'next/server'
import { updateApp, deleteApp, getAppBySlug } from '@/lib/db'
import { checkAuth } from '@/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = params
    const body = await request.json()
    const { name, slug: newSlug, knownIssues } = body

    // Check if app exists
    const existingApp = getAppBySlug(slug)
    if (!existingApp) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (newSlug !== undefined) updates.slug = newSlug
    if (knownIssues !== undefined) updates.knownIssues = knownIssues

    const app = updateApp(slug, updates)
    return NextResponse.json({ data: app })
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'App with this slug already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update app' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = params
    const success = deleteApp(slug)

    if (!success) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    return NextResponse.json({ data: { success: true } })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete app' },
      { status: 500 }
    )
  }
}
