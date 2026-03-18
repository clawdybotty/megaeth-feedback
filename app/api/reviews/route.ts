import { NextRequest, NextResponse } from 'next/server'
import { 
  createReview, 
  getReviewsByApp, 
  getReviewsByTester, 
  getAllReviews
} from '@/lib/db'
import { Review } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const app = searchParams.get('app')
    const tester = searchParams.get('tester')

    let reviews
    if (app) {
      reviews = getReviewsByApp(app)
    } else if (tester) {
      reviews = getReviewsByTester(tester)
    } else {
      reviews = getAllReviews()
    }

    return NextResponse.json({ data: reviews })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'tester_name',
      'telegram_handle',
      'app_slug',
      'wallet_connection',
      'ui_ux_quality',
      'core_functionality',
      'mobile_experience',
      'speed_performance',
      'overall_rating',
    ]

    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate rating ranges
    const ratingFields = [
      'wallet_connection',
      'ui_ux_quality',
      'core_functionality',
      'mobile_experience',
      'speed_performance',
      'overall_rating',
    ]

    for (const field of ratingFields) {
      const value = body[field]
      if (typeof value !== 'number' || value < 1 || value > 5) {
        return NextResponse.json(
          { error: `${field} must be between 1 and 5` },
          { status: 400 }
        )
      }
    }

    const review: Review = {
      tester_name: body.tester_name,
      telegram_handle: body.telegram_handle,
      app_slug: body.app_slug,
      wallet_connection: body.wallet_connection,
      ui_ux_quality: body.ui_ux_quality,
      core_functionality: body.core_functionality,
      mobile_experience: body.mobile_experience,
      speed_performance: body.speed_performance,
      overall_rating: body.overall_rating,
      needs_access_code: body.needs_access_code || false,
      bugs_issues: body.bugs_issues,
      general_comments: body.general_comments,
    }

    const created = createReview(review)

    return NextResponse.json({ data: created })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
