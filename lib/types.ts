export interface App {
  id?: number
  slug: string
  name: string
  knownIssues?: string
  created_at?: string
}

export interface Review {
  id?: number
  tester_name: string
  telegram_handle: string
  app_slug: string
  wallet_connection: number
  ui_ux_quality: number
  core_functionality: number
  mobile_experience: number
  speed_performance: number
  overall_rating: number
  needs_access_code: boolean
  bugs_issues?: string
  general_comments?: string
  date_tested?: string
  created_at?: string
}

export interface AppStats {
  app_slug: string
  app_name: string
  review_count: number
  avg_wallet_connection: number
  avg_ui_ux_quality: number
  avg_core_functionality: number
  avg_mobile_experience: number
  avg_speed_performance: number
  avg_overall_rating: number
}
