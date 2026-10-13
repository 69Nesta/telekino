import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { BrandIcon } from '@/components/BrandIcon'
import { FavoriteSitesSheet } from '@/components/FavoriteSitesSheet'
import type { FavoriteSite } from '@/lib/favorites'
import { toast } from 'sonner'

type QuickAppsStripProps = {
  favorites: FavoriteSite[]
  onUpdateFavorites: (favorites: FavoriteSite[]) => void
  onOpenUrl: (url: string) => void
  disabled: boolean
}

export function QuickAppsStrip({
  favorites,
  onUpdateFavorites,
  onOpenUrl,
  disabled,
}: QuickAppsStripProps) {
  const [launchingId, setLaunchingId] = useState<string | null>(null)

  function handleLaunch(site: FavoriteSite) {
    if (disabled) return

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25)
      } catch {}
    }

    setLaunchingId(site.id)
    onOpenUrl(site.url)
    toast.success(`Opening ${site.title} on Mac`)
    setTimeout(() => {
      setLaunchingId(null)
    }, 1000)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Quick Launch
        </span>
        <FavoriteSitesSheet
          favorites={favorites}
          onUpdateFavorites={onUpdateFavorites}
          onOpenUrl={onOpenUrl}
          disabled={disabled}
        />
      </div>

      <div className="relative -mx-2 flex gap-2 overflow-x-auto px-2 pb-1.5 pt-0.5 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
        {favorites.slice(0, 8).map((site) => {
          const isLaunching = launchingId === site.id
          return (
            <button
              key={site.id}
              type="button"
              disabled={disabled}
              onClick={() => handleLaunch(site)}
              aria-label={`Open ${site.title} on Mac`}
              className={`group flex shrink-0 items-center gap-2 rounded-xl border border-border/80 bg-card/75 px-3 py-2 text-left shadow-2xs backdrop-blur-xs transition-all select-none ${
                disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:border-border hover:bg-card hover:shadow-xs hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              <div
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-white shadow-inner transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: site.color,
                  boxShadow: `0 2px 8px -1px ${site.color}50`,
                }}
              >
                {isLaunching ? (
                  <Loader2 className="size-3.5 animate-spin text-white" />
                ) : (
                  <BrandIcon
                    title={site.title}
                    url={site.url}
                    badge={site.badge}
                    className="size-3.5"
                  />
                )}
              </div>
              <span className="text-xs font-semibold tracking-tight text-foreground">
                {site.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
