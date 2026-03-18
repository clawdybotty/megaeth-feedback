import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  initDb, 
  createReview, 
  getReviewsByApp, 
  getReviewsByTester,
  getReviewByTesterAndApp,
  getStats,
  getAllReviews,
  closeDb,
  getAllApps,
  getAppBySlug,
  createApp,
  updateApp,
  deleteApp
} from '../lib/db'
import { Review } from '../lib/types'
import fs from 'fs'
import path from 'path'

const TEST_DB_PATH = path.join(__dirname, '../db/test-feedback.db')

describe('Database Operations', () => {
  beforeEach(() => {
    // Clean up test database
    const dbDir = path.dirname(TEST_DB_PATH)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }
    initDb(TEST_DB_PATH)
  })

  afterEach(() => {
    closeDb()
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }
  })

  describe('createReview', () => {
    it('should create a new review', () => {
      const review: Review = {
        tester_name: 'Alice',
        telegram_handle: '@alice',
        app_slug: 'aave',
        wallet_connection: 5,
        ui_ux_quality: 4,
        core_functionality: 5,
        mobile_experience: 3,
        speed_performance: 4,
        overall_rating: 4,
        needs_access_code: false,
        bugs_issues: 'None',
        general_comments: 'Great app!'
      }

      const created = createReview(review)
      expect(created).toHaveProperty('id')
      expect(created.tester_name).toBe('Alice')
      expect(created.app_slug).toBe('aave')
    })

    it('should upsert on duplicate tester+app', () => {
      const review1: Review = {
        tester_name: 'Bob',
        telegram_handle: '@bob',
        app_slug: 'brix',
        wallet_connection: 3,
        ui_ux_quality: 3,
        core_functionality: 3,
        mobile_experience: 3,
        speed_performance: 3,
        overall_rating: 3,
        needs_access_code: false
      }

      const created1 = createReview(review1)
      
      // Submit again with different ratings
      const review2: Review = {
        ...review1,
        wallet_connection: 5,
        overall_rating: 5
      }

      const created2 = createReview(review2)
      
      // Should have same ID (upsert)
      expect(created2.id).toBe(created1.id)
      expect(created2.wallet_connection).toBe(5)
      expect(created2.overall_rating).toBe(5)
      
      // Should only have one review in db
      const reviews = getReviewsByApp('brix')
      expect(reviews).toHaveLength(1)
    })
  })

  describe('getReviewsByApp', () => {
    it('should return all reviews for an app', () => {
      createReview({
        tester_name: 'Alice',
        telegram_handle: '@alice',
        app_slug: 'aave',
        wallet_connection: 5,
        ui_ux_quality: 4,
        core_functionality: 5,
        mobile_experience: 3,
        speed_performance: 4,
        overall_rating: 4,
        needs_access_code: false
      })

      createReview({
        tester_name: 'Bob',
        telegram_handle: '@bob',
        app_slug: 'aave',
        wallet_connection: 4,
        ui_ux_quality: 4,
        core_functionality: 4,
        mobile_experience: 4,
        speed_performance: 4,
        overall_rating: 4,
        needs_access_code: true
      })

      createReview({
        tester_name: 'Charlie',
        telegram_handle: '@charlie',
        app_slug: 'brix',
        wallet_connection: 3,
        ui_ux_quality: 3,
        core_functionality: 3,
        mobile_experience: 3,
        speed_performance: 3,
        overall_rating: 3,
        needs_access_code: false
      })

      const aaveReviews = getReviewsByApp('aave')
      expect(aaveReviews).toHaveLength(2)
      expect(aaveReviews.every(r => r.app_slug === 'aave')).toBe(true)
    })
  })

  describe('getReviewsByTester', () => {
    it('should return all reviews by a tester', () => {
      createReview({
        tester_name: 'Alice',
        telegram_handle: '@alice',
        app_slug: 'aave',
        wallet_connection: 5,
        ui_ux_quality: 4,
        core_functionality: 5,
        mobile_experience: 3,
        speed_performance: 4,
        overall_rating: 4,
        needs_access_code: false
      })

      createReview({
        tester_name: 'Alice',
        telegram_handle: '@alice',
        app_slug: 'brix',
        wallet_connection: 4,
        ui_ux_quality: 4,
        core_functionality: 4,
        mobile_experience: 4,
        speed_performance: 4,
        overall_rating: 4,
        needs_access_code: false
      })

      const aliceReviews = getReviewsByTester('@alice')
      expect(aliceReviews).toHaveLength(2)
      expect(aliceReviews.every(r => r.telegram_handle === '@alice')).toBe(true)
    })
  })

  describe('getReviewByTesterAndApp', () => {
    it('should return specific review', () => {
      createReview({
        tester_name: 'Alice',
        telegram_handle: '@alice',
        app_slug: 'aave',
        wallet_connection: 5,
        ui_ux_quality: 4,
        core_functionality: 5,
        mobile_experience: 3,
        speed_performance: 4,
        overall_rating: 4,
        needs_access_code: false
      })

      const review = getReviewByTesterAndApp('@alice', 'aave')
      expect(review).toBeDefined()
      expect(review?.tester_name).toBe('Alice')
      expect(review?.app_slug).toBe('aave')
    })

    it('should return undefined if not found', () => {
      const review = getReviewByTesterAndApp('@nobody', 'aave')
      expect(review).toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('should calculate aggregated stats per app', () => {
      // Create 3 reviews for aave
      createReview({
        tester_name: 'Alice',
        telegram_handle: '@alice',
        app_slug: 'aave',
        wallet_connection: 5,
        ui_ux_quality: 4,
        core_functionality: 5,
        mobile_experience: 3,
        speed_performance: 4,
        overall_rating: 4,
        needs_access_code: false
      })

      createReview({
        tester_name: 'Bob',
        telegram_handle: '@bob',
        app_slug: 'aave',
        wallet_connection: 3,
        ui_ux_quality: 4,
        core_functionality: 3,
        mobile_experience: 3,
        speed_performance: 4,
        overall_rating: 3,
        needs_access_code: false
      })

      createReview({
        tester_name: 'Charlie',
        telegram_handle: '@charlie',
        app_slug: 'aave',
        wallet_connection: 4,
        ui_ux_quality: 4,
        core_functionality: 4,
        mobile_experience: 4,
        speed_performance: 4,
        overall_rating: 4,
        needs_access_code: false
      })

      const stats = getStats()
      expect(stats).toHaveLength(1)
      
      const aaveStats = stats[0]
      expect(aaveStats.app_slug).toBe('aave')
      expect(aaveStats.review_count).toBe(3)
      expect(aaveStats.avg_wallet_connection).toBeCloseTo(4, 1)
      expect(aaveStats.avg_overall_rating).toBeCloseTo(3.67, 1)
    })
  })

  describe('getAllReviews', () => {
    it('should return all reviews', () => {
      createReview({
        tester_name: 'Alice',
        telegram_handle: '@alice',
        app_slug: 'aave',
        wallet_connection: 5,
        ui_ux_quality: 4,
        core_functionality: 5,
        mobile_experience: 3,
        speed_performance: 4,
        overall_rating: 4,
        needs_access_code: false
      })

      createReview({
        tester_name: 'Bob',
        telegram_handle: '@bob',
        app_slug: 'brix',
        wallet_connection: 4,
        ui_ux_quality: 4,
        core_functionality: 4,
        mobile_experience: 4,
        speed_performance: 4,
        overall_rating: 4,
        needs_access_code: false
      })

      const reviews = getAllReviews()
      expect(reviews).toHaveLength(2)
    })
  })

  describe('Apps CRUD', () => {
    it('should seed apps on init', () => {
      const apps = getAllApps()
      expect(apps.length).toBeGreaterThan(0)
      expect(apps.some(a => a.slug === 'aave')).toBe(true)
    })

    it('should get app by slug', () => {
      const app = getAppBySlug('aave')
      expect(app).toBeDefined()
      expect(app?.name).toBe('Aave')
    })

    it('should create a new app', () => {
      const newApp = createApp({
        slug: 'test-app',
        name: 'Test App',
        knownIssues: 'None'
      })

      expect(newApp).toHaveProperty('id')
      expect(newApp.slug).toBe('test-app')
      expect(newApp.name).toBe('Test App')
      expect(newApp.knownIssues).toBe('None')
    })

    it('should update an app', () => {
      const updated = updateApp('aave', {
        name: 'Aave V3',
        knownIssues: 'Some issues'
      })

      expect(updated.name).toBe('Aave V3')
      expect(updated.knownIssues).toBe('Some issues')
      expect(updated.slug).toBe('aave')
    })

    it('should update app slug', () => {
      const updated = updateApp('aave', {
        slug: 'aave-v3'
      })

      expect(updated.slug).toBe('aave-v3')
      
      // Old slug should not exist
      const oldApp = getAppBySlug('aave')
      expect(oldApp).toBeUndefined()
    })

    it('should delete an app', () => {
      const deleted = deleteApp('aave')
      expect(deleted).toBe(true)

      const app = getAppBySlug('aave')
      expect(app).toBeUndefined()
    })

    it('should return false when deleting non-existent app', () => {
      const deleted = deleteApp('non-existent')
      expect(deleted).toBe(false)
    })

    it('should prevent duplicate slugs', () => {
      expect(() => {
        createApp({
          slug: 'aave',
          name: 'Another Aave'
        })
      }).toThrow()
    })
  })
})
