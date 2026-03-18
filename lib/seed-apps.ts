import { App } from './types'

export const SEED_APPS: Omit<App, 'id' | 'created_at'>[] = [
  { slug: 'aave', name: 'Aave' },
  { slug: 'avon', name: 'Avon' },
  { slug: 'blackhaven', name: 'Blackhaven' },
  { slug: 'brix', name: 'Brix' },
  { slug: 'dorado', name: 'Dorado' },
  { slug: 'euphoria', name: 'Euphoria' },
  { slug: 'hit-one', name: 'Hit.One' },
  { 
    slug: 'kumbaya', 
    name: 'Kumbaya',
    knownIssues: 'Can connect to wallet but faces RPC rate limits on phone'
  },
  { slug: 'nectar', name: 'Nectar' },
  { 
    slug: 'supernova', 
    name: 'Supernova',
    knownIssues: "Can't connect to wallet through phone"
  },
  { 
    slug: 'wcm', 
    name: 'WCM',
    knownIssues: "Can't login through phone"
  },
  { slug: 'showdown', name: 'Showdown' },
  { slug: 'topstrike', name: 'TopStrike' },
  { slug: 'hello-trade', name: 'Hello.trade' },
  { slug: 'blitzo', name: 'Blitzo' },
]
