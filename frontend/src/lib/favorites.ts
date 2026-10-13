export type FavoriteCategory = 'streaming' | 'music' | 'video' | 'social' | 'tools' | 'custom'

export type FavoriteSite = {
  id: string
  title: string
  url: string
  badge: string
  color: string
  category: FavoriteCategory
}

export const FAVORITES_STORAGE_KEY = 'telekino-favorite-sites'

export const PRESET_FAVORITES: FavoriteSite[] = [
  {
    id: 'fav-canal',
    title: 'Canal+',
    url: 'https://www.canalplus.com',
    badge: 'C+',
    color: '#1a1a1a',
    category: 'streaming',
  },
  {
    id: 'fav-youtube',
    title: 'YouTube',
    url: 'https://www.youtube.com',
    badge: 'YT',
    color: '#FF0000',
    category: 'video',
  },
  {
    id: 'fav-netflix',
    title: 'Netflix',
    url: 'https://www.netflix.com',
    badge: 'N',
    color: '#E50914',
    category: 'streaming',
  },
  {
    id: 'fav-spotify',
    title: 'Spotify',
    url: 'https://open.spotify.com',
    badge: 'SP',
    color: '#1DB954',
    category: 'music',
  },
  {
    id: 'fav-twitch',
    title: 'Twitch',
    url: 'https://www.twitch.tv',
    badge: 'TW',
    color: '#9146FF',
    category: 'streaming',
  },
  {
    id: 'fav-disney',
    title: 'Disney+',
    url: 'https://www.disneyplus.com',
    badge: 'D+',
    color: '#113CCF',
    category: 'streaming',
  },
  {
    id: 'fav-prime',
    title: 'Prime Video',
    url: 'https://www.primevideo.com',
    badge: 'PV',
    color: '#00A8E1',
    category: 'streaming',
  },
  {
    id: 'fav-appletv',
    title: 'Apple TV+',
    url: 'https://tv.apple.com',
    badge: 'TV+',
    color: '#262626',
    category: 'streaming',
  },
  {
    id: 'fav-chatgpt',
    title: 'ChatGPT',
    url: 'https://chatgpt.com',
    badge: 'AI',
    color: '#10A37F',
    category: 'tools',
  },
]

export const QUICK_ADD_PRESETS: Array<Omit<FavoriteSite, 'id'>> = [
  {
    title: 'Crunchyroll',
    url: 'https://www.crunchyroll.com',
    badge: 'CR',
    color: '#F47521',
    category: 'streaming',
  },
  {
    title: 'SoundCloud',
    url: 'https://soundcloud.com',
    badge: 'SC',
    color: '#FF5500',
    category: 'music',
  },
  {
    title: 'Reddit',
    url: 'https://www.reddit.com',
    badge: 'RD',
    color: '#FF4500',
    category: 'social',
  },
  {
    title: 'GitHub',
    url: 'https://github.com',
    badge: 'GH',
    color: '#24292F',
    category: 'tools',
  },
  {
    title: 'Max',
    url: 'https://www.max.com',
    badge: 'MAX',
    color: '#002BE7',
    category: 'streaming',
  },
  {
    title: 'Hulu',
    url: 'https://www.hulu.com',
    badge: 'HULU',
    color: '#1CE783',
    category: 'streaming',
  },
]

export function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function generateFavoriteBadge(title: string): string {
  const words = title.trim().split(/\s+/)
  if (words.length >= 2) {
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
  }
  return title.slice(0, 3).toUpperCase()
}

export function pickBrandColor(title: string, url: string): string {
  const lower = `${title} ${url}`.toLowerCase()
  if (lower.includes('youtube')) return '#FF0000'
  if (lower.includes('netflix')) return '#E50914'
  if (lower.includes('spotify')) return '#1DB954'
  if (lower.includes('twitch')) return '#9146FF'
  if (lower.includes('disney')) return '#113CCF'
  if (lower.includes('prime') || lower.includes('amazon')) return '#00A8E1'
  if (lower.includes('apple')) return '#262626'
  if (lower.includes('chatgpt') || lower.includes('openai')) return '#10A37F'
  if (lower.includes('crunchyroll')) return '#F47521'
  if (lower.includes('soundcloud')) return '#FF5500'
  if (lower.includes('reddit')) return '#FF4500'
  if (lower.includes('github')) return '#24292F'
  if (lower.includes('max') || lower.includes('hbo')) return '#002BE7'
  if (lower.includes('hulu')) return '#1CE783'

  const palette = [
    '#6366F1',
    '#EC4899',
    '#8B5CF6',
    '#06B6D4',
    '#10B981',
    '#F59E0B',
    '#3B82F6',
    '#14B8A6',
  ]
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % palette.length
  return palette[index]
}

export function createFavoriteSite(
  title: string,
  url: string,
  customColor?: string,
  category: FavoriteCategory = 'custom'
): FavoriteSite {
  const normalized = normalizeUrl(url)
  return {
    id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim() || 'Custom Site',
    url: normalized,
    badge: generateFavoriteBadge(title),
    color: customColor || pickBrandColor(title, normalized),
    category,
  }
}

export function loadFavorites(): FavoriteSite[] {
  if (typeof window === 'undefined') return PRESET_FAVORITES
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) {
      saveFavorites(PRESET_FAVORITES)
      return PRESET_FAVORITES
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    return PRESET_FAVORITES
  } catch {
    return PRESET_FAVORITES
  }
}

export function saveFavorites(favorites: FavoriteSite[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
}
