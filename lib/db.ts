import Database from 'better-sqlite3'
import { Review, AppStats, App } from './types'
import { SEED_APPS } from './seed-apps'
import path from 'path'

let db: Database.Database | null = null

const DEFAULT_DB_PATH = path.join(process.cwd(), 'db', 'feedback.db')

export function initDb(dbPath: string = DEFAULT_DB_PATH) {
  if (db) {
    db.close()
  }

  // Ensure db directory exists
  const fs = require('fs')
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  db = new Database(dbPath)
  
  // Create apps table
  db.exec(`
    CREATE TABLE IF NOT EXISTS apps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      known_issues TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)
  
  // Seed apps table
  const seedStmt = db.prepare(`
    INSERT OR IGNORE INTO apps (slug, name, known_issues)
    VALUES (@slug, @name, @known_issues)
  `)
  
  for (const app of SEED_APPS) {
    seedStmt.run({
      slug: app.slug,
      name: app.name,
      known_issues: app.knownIssues || null,
    })
  }
  
  // Create reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tester_name TEXT NOT NULL,
      telegram_handle TEXT NOT NULL,
      app_slug TEXT NOT NULL,
      wallet_connection INTEGER CHECK(wallet_connection BETWEEN 1 AND 5),
      ui_ux_quality INTEGER CHECK(ui_ux_quality BETWEEN 1 AND 5),
      core_functionality INTEGER CHECK(core_functionality BETWEEN 1 AND 5),
      mobile_experience INTEGER CHECK(mobile_experience BETWEEN 1 AND 5),
      speed_performance INTEGER CHECK(speed_performance BETWEEN 1 AND 5),
      overall_rating INTEGER CHECK(overall_rating BETWEEN 1 AND 5),
      needs_access_code BOOLEAN DEFAULT FALSE,
      bugs_issues TEXT,
      general_comments TEXT,
      date_tested TEXT DEFAULT (date('now')),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(telegram_handle, app_slug)
    )
  `)

  return db
}

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DB_PATH || DEFAULT_DB_PATH
    initDb(dbPath)
  }
  return db!
}

export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}

export function createReview(review: Review): Review {
  const database = getDb()
  
  const stmt = database.prepare(`
    INSERT INTO reviews (
      tester_name, telegram_handle, app_slug,
      wallet_connection, ui_ux_quality, core_functionality,
      mobile_experience, speed_performance, overall_rating,
      needs_access_code, bugs_issues, general_comments
    ) VALUES (
      @tester_name, @telegram_handle, @app_slug,
      @wallet_connection, @ui_ux_quality, @core_functionality,
      @mobile_experience, @speed_performance, @overall_rating,
      @needs_access_code, @bugs_issues, @general_comments
    )
    ON CONFLICT(telegram_handle, app_slug) DO UPDATE SET
      tester_name = @tester_name,
      wallet_connection = @wallet_connection,
      ui_ux_quality = @ui_ux_quality,
      core_functionality = @core_functionality,
      mobile_experience = @mobile_experience,
      speed_performance = @speed_performance,
      overall_rating = @overall_rating,
      needs_access_code = @needs_access_code,
      bugs_issues = @bugs_issues,
      general_comments = @general_comments,
      date_tested = date('now')
  `)

  const info = stmt.run({
    tester_name: review.tester_name,
    telegram_handle: review.telegram_handle,
    app_slug: review.app_slug,
    wallet_connection: review.wallet_connection,
    ui_ux_quality: review.ui_ux_quality,
    core_functionality: review.core_functionality,
    mobile_experience: review.mobile_experience,
    speed_performance: review.speed_performance,
    overall_rating: review.overall_rating,
    needs_access_code: review.needs_access_code ? 1 : 0,
    bugs_issues: review.bugs_issues || null,
    general_comments: review.general_comments || null,
  })

  // Get the inserted/updated review
  const selectStmt = database.prepare(`
    SELECT * FROM reviews 
    WHERE telegram_handle = ? AND app_slug = ?
  `)
  
  return selectStmt.get(review.telegram_handle, review.app_slug) as Review
}

export function getReviewsByApp(appSlug: string): Review[] {
  const database = getDb()
  const stmt = database.prepare(`
    SELECT * FROM reviews WHERE app_slug = ? ORDER BY created_at DESC
  `)
  return stmt.all(appSlug) as Review[]
}

export function getReviewsByTester(telegramHandle: string): Review[] {
  const database = getDb()
  const stmt = database.prepare(`
    SELECT * FROM reviews WHERE telegram_handle = ? ORDER BY created_at DESC
  `)
  return stmt.all(telegramHandle) as Review[]
}

export function getReviewByTesterAndApp(telegramHandle: string, appSlug: string): Review | undefined {
  const database = getDb()
  const stmt = database.prepare(`
    SELECT * FROM reviews WHERE telegram_handle = ? AND app_slug = ?
  `)
  return stmt.get(telegramHandle, appSlug) as Review | undefined
}

export function getAllReviews(): Review[] {
  const database = getDb()
  const stmt = database.prepare(`
    SELECT * FROM reviews ORDER BY created_at DESC
  `)
  return stmt.all() as Review[]
}

export function getStats(): AppStats[] {
  const database = getDb()
  const stmt = database.prepare(`
    SELECT 
      app_slug,
      COUNT(*) as review_count,
      ROUND(AVG(wallet_connection), 2) as avg_wallet_connection,
      ROUND(AVG(ui_ux_quality), 2) as avg_ui_ux_quality,
      ROUND(AVG(core_functionality), 2) as avg_core_functionality,
      ROUND(AVG(mobile_experience), 2) as avg_mobile_experience,
      ROUND(AVG(speed_performance), 2) as avg_speed_performance,
      ROUND(AVG(overall_rating), 2) as avg_overall_rating
    FROM reviews
    GROUP BY app_slug
    ORDER BY avg_overall_rating DESC
  `)
  
  const stats = stmt.all() as any[]
  const apps = getAllApps()
  
  // Add app names
  return stats.map(stat => {
    const app = apps.find(a => a.slug === stat.app_slug)
    return {
      ...stat,
      app_name: app?.name || stat.app_slug,
    }
  })
}

// Apps CRUD functions
function mapDbAppToApp(dbApp: any): App {
  return {
    id: dbApp.id,
    slug: dbApp.slug,
    name: dbApp.name,
    knownIssues: dbApp.known_issues,
    created_at: dbApp.created_at
  }
}

export function getAllApps(): App[] {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM apps ORDER BY name ASC')
  const dbApps = stmt.all() as any[]
  return dbApps.map(mapDbAppToApp)
}

export function getAppBySlug(slug: string): App | undefined {
  const database = getDb()
  const stmt = database.prepare('SELECT * FROM apps WHERE slug = ?')
  const dbApp = stmt.get(slug) as any
  return dbApp ? mapDbAppToApp(dbApp) : undefined
}

export function createApp(app: Omit<App, 'id' | 'created_at'>): App {
  const database = getDb()
  const stmt = database.prepare(`
    INSERT INTO apps (slug, name, known_issues)
    VALUES (@slug, @name, @known_issues)
  `)
  
  stmt.run({
    slug: app.slug,
    name: app.name,
    known_issues: app.knownIssues || null,
  })
  
  return getAppBySlug(app.slug)!
}

export function updateApp(slug: string, app: Partial<Omit<App, 'id' | 'created_at'>>): App {
  const database = getDb()
  
  const updates: string[] = []
  const params: any = { slug }
  
  if (app.name !== undefined) {
    updates.push('name = @name')
    params.name = app.name
  }
  
  if (app.knownIssues !== undefined) {
    updates.push('known_issues = @known_issues')
    params.known_issues = app.knownIssues || null
  }
  
  if (app.slug !== undefined) {
    updates.push('slug = @new_slug')
    params.new_slug = app.slug
  }
  
  if (updates.length === 0) {
    return getAppBySlug(slug)!
  }
  
  const stmt = database.prepare(`
    UPDATE apps SET ${updates.join(', ')}
    WHERE slug = @slug
  `)
  
  stmt.run(params)
  
  return getAppBySlug(app.slug || slug)!
}

export function deleteApp(slug: string): boolean {
  const database = getDb()
  const stmt = database.prepare('DELETE FROM apps WHERE slug = ?')
  const info = stmt.run(slug)
  return info.changes > 0
}
