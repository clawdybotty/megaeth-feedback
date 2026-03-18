// This file now exports functions that read from the database
// The static APPS array has been moved to seed-apps.ts and stored in SQLite
import { getAllApps as dbGetAllApps, getAppBySlug as dbGetAppBySlug } from './db'
import { App } from './types'

export function getAllApps(): App[] {
  return dbGetAllApps()
}

export function getAppBySlug(slug: string): App | undefined {
  return dbGetAppBySlug(slug)
}
