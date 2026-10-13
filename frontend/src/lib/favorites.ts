export type FavoriteCategory = 'streaming' | 'music' | 'video' | 'social' | 'tools' | 'custom'

export type FavoriteSite = {
  id: string
  title: string
  url: string
  badge: string
  category: FavoriteCategory
}

export const FAVORITES_STORAGE_KEY = 'telekino-favorite-sites'

export const PRESET_FAVORITES: FavoriteSite[] = [
  {
    id: 'fav-canal',
    title: 'Canal+',
    url: 'https://www.canalplus.com',
    badge: 'C+',
    category: 'streaming',
  },
  {
    id: 'fav-youtube',
    title: 'YouTube',
    url: 'https://www.youtube.com',
    badge: 'YT',
    category: 'video',
  },
  {
    id: 'fav-netflix',
    title: 'Netflix',
    url: 'https://www.netflix.com',
    badge: 'N',
    category: 'streaming',
  },
  {
    id: 'fav-spotify',
    title: 'Spotify',
    url: 'https://spotify.com',
    badge: 'SP',
    category: 'music',
  },
  {
    id: 'fav-twitch',
    title: 'Twitch',
    url: 'https://www.twitch.tv',
    badge: 'TW',
    category: 'streaming',
  },
  {
    id: 'fav-disney',
    title: 'Disney+',
    url: 'https://www.disneyplus.com',
    badge: 'D+',
    category: 'streaming',
  },
  {
    id: 'fav-prime',
    title: 'Prime Video',
    url: 'https://www.primevideo.com',
    badge: 'PV',
    category: 'streaming',
  },
  {
    id: 'fav-appletv',
    title: 'Apple TV+',
    url: 'https://tv.apple.com',
    badge: 'TV+',
    category: 'streaming',
  },
]

export const QUICK_ADD_PRESETS: Array<Omit<FavoriteSite, 'id'>> = [
  {
    title: 'Crunchyroll',
    url: 'https://www.crunchyroll.com',
    badge: 'CR',
    category: 'streaming',
  },
  {
    title: 'SoundCloud',
    url: 'https://soundcloud.com',
    badge: 'SC',
    category: 'music',
  },
  {
    title: 'Reddit',
    url: 'https://www.reddit.com',
    badge: 'RD',
    category: 'social',
  },
  {
    title: 'GitHub',
    url: 'https://github.com',
    badge: 'GH',
    category: 'tools',
  },
  {
    title: 'Max',
    url: 'https://www.max.com',
    badge: 'MAX',
    category: 'streaming',
  },
  {
    title: 'Hulu',
    url: 'https://www.hulu.com',
    badge: 'HULU',
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

export function createFavoriteSite(
  title: string,
  url: string,
  category: FavoriteCategory = 'custom'
): FavoriteSite {
  const normalized = normalizeUrl(url)
  return {
    id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim() || 'Custom Site',
    url: normalized,
    badge: generateFavoriteBadge(title),
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
