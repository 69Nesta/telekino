import { useState } from 'react'
import {
  BookmarkPlus,
  ExternalLink,
  Globe,
  Loader2,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react'
import { BrandIcon } from '@/components/BrandIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  createFavoriteSite,
  normalizeUrl,
  PRESET_FAVORITES,
  QUICK_ADD_PRESETS,
  type FavoriteSite,
} from '@/lib/favorites'
import { toast } from 'sonner'

type FavoriteSitesSheetProps = {
  favorites: FavoriteSite[]
  onUpdateFavorites: (favorites: FavoriteSite[]) => void
  onOpenUrl: (url: string) => void
  disabled: boolean
}

const COLOR_OPTIONS = [
  '#E50914',
  '#FF0000',
  '#1DB954',
  '#9146FF',
  '#113CCF',
  '#00A8E1',
  '#10A37F',
  '#F47521',
  '#FF5500',
  '#262626',
]

export function FavoriteSitesSheet({
  favorites,
  onUpdateFavorites,
  onOpenUrl,
  disabled,
}: FavoriteSitesSheetProps) {
  const [open, setOpen] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0])
  const [quickUrl, setQuickUrl] = useState('')
  const [launchingId, setLaunchingId] = useState<string | null>(null)

  function handleLaunch(site: FavoriteSite) {
    if (disabled) return

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25)
      } catch { }
    }

    setLaunchingId(site.id)
    onOpenUrl(site.url)
    toast.success(`Opening ${site.title} on Mac`)
    setTimeout(() => {
      setLaunchingId(null)
      setOpen(false)
    }, 600)
  }

  function handleQuickLaunch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const trimmed = quickUrl.trim()
    if (!trimmed || disabled) return

    const normalized = normalizeUrl(trimmed)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25)
      } catch { }
    }

    onOpenUrl(normalized)
    toast.success(`Opening ${normalized} on Mac`)
    setQuickUrl('')
    setOpen(false)
  }

  function handleAddCustom(e: React.FormEvent) {
    e.preventDefault()
    const trimmedUrl = newUrl.trim()
    if (!trimmedUrl) {
      toast.error('Please enter a valid website URL')
      return
    }

    const title = newTitle.trim() || new URL(normalizeUrl(trimmedUrl)).hostname.replace('www.', '')
    const site = createFavoriteSite(title, trimmedUrl, selectedColor)
    const updated = [...favorites, site]
    onUpdateFavorites(updated)
    toast.success(`Added ${site.title} to favorites`)

    setNewTitle('')
    setNewUrl('')
    setIsAdding(false)
  }

  function handleQuickAddPreset(preset: Omit<FavoriteSite, 'id'>) {
    const exists = favorites.some(
      (f) =>
        f.url.toLowerCase() === preset.url.toLowerCase() ||
        f.title.toLowerCase() === preset.title.toLowerCase()
    )
    if (exists) {
      toast.info(`${preset.title} is already in your favorites`)
      return
    }

    const site = createFavoriteSite(preset.title, preset.url, preset.color, preset.category)
    const updated = [...favorites, site]
    onUpdateFavorites(updated)
    toast.success(`Added ${preset.title}`)
  }

  function handleRemove(id: string, title: string) {
    const updated = favorites.filter((item) => item.id !== id)
    onUpdateFavorites(updated)
    toast.info(`Removed ${title}`)
  }

  function handleReset() {
    onUpdateFavorites(PRESET_FAVORITES)
    toast.info('Favorites reset to defaults')
    setIsManaging(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/80 bg-background/60 px-3 text-xs font-semibold text-foreground backdrop-blur-xs transition-colors hover:bg-accent cursor-pointer select-none"
        aria-label="Open streaming favorites and website launcher"
      >
        <span>Apps & Bookmarks</span>
        <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
          {favorites.length}
        </span>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="max-h-[85svh] overflow-y-auto rounded-t-3xl border-t border-border bg-background/95 p-5 pb-8 backdrop-blur-xl sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-bold tracking-tight">
                Apps & Streaming Hub
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Tap to launch instantly in your Mac browser.
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsManaging(!isManaging)
                  if (isAdding) setIsAdding(false)
                }}
                className={isManaging ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}
                aria-label={isManaging ? 'Done managing' : 'Manage favorites'}
              >
                <SlidersHorizontal className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsAdding(!isAdding)
                  if (isManaging) setIsManaging(false)
                }}
                className={isAdding ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}
                aria-label={isAdding ? 'Close add bookmark' : 'Add new bookmark'}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 pt-1">
          <form onSubmit={handleQuickLaunch} className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Open any URL (e.g. crunchyroll.com)..."
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                disabled={disabled}
                className="h-10 pl-9 pr-3 text-xs rounded-xl"
              />
            </div>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={disabled || !quickUrl.trim()}
              className="h-10 px-4 text-xs font-semibold gap-1.5 rounded-xl"
            >
              <ExternalLink className="size-3.5" /> Launch
            </Button>
          </form>

          {isAdding && (
            <form
              onSubmit={handleAddCustom}
              className="space-y-3 rounded-2xl border border-border bg-muted/40 p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <BookmarkPlus className="size-3.5 text-primary" /> New Bookmark
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setIsAdding(false)}
                  aria-label="Cancel"
                >
                  <X className="size-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Website name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-9 text-xs rounded-lg"
                />
                <Input
                  type="text"
                  placeholder="Website URL (e.g. hulu.com)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="h-9 text-xs rounded-lg"
                  required
                />
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Tile accent color</p>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`size-6 rounded-full border transition-all ${selectedColor === color
                        ? 'scale-110 border-white ring-2 ring-primary ring-offset-1'
                        : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                  Quick add popular services
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ADD_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handleQuickAddPreset(preset)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-muted"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: preset.color }}
                      />
                      + {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" className="flex-1 rounded-lg">
                  Save Bookmark
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {isManaging && (
            <div className="flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Tap the red trash icon to delete a site.</span>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleReset}
                className="h-6 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3" /> Reset defaults
              </Button>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2.5">
            {favorites.map((site) => {
              const isLaunching = launchingId === site.id
              return (
                <div key={site.id} className="relative group">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleLaunch(site)}
                    aria-label={`Open ${site.title} on Mac`}
                    className={`relative flex aspect-square w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border p-2 transition-all select-none ${disabled
                      ? 'cursor-not-allowed opacity-50 border-border bg-card/40'
                      : 'cursor-pointer border-border/80 bg-card/90 hover:bg-card hover:border-border hover:shadow-md active:scale-95 shadow-xs'
                      }`}
                  >
                    <div
                      className="flex size-10 items-center justify-center rounded-xl text-white shadow-inner transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: site.color,
                        boxShadow: `0 4px 12px -2px ${site.color}40`,
                      }}
                    >
                      {isLaunching ? (
                        <Loader2 className="size-5 animate-spin text-white" />
                      ) : (
                        <BrandIcon
                          title={site.title}
                          url={site.url}
                          badge={site.badge}
                          className="size-5"
                        />
                      )}
                    </div>

                    <span className="w-full truncate text-center text-[11px] font-semibold tracking-tight text-foreground">
                      {site.title}
                    </span>
                  </button>

                  {isManaging && (
                    <button
                      type="button"
                      onClick={() => handleRemove(site.id, site.title)}
                      className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-transform hover:scale-110"
                      aria-label={`Delete ${site.title}`}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
              )
            })}

            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsAdding(true)}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-muted/30 p-2 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-95 select-none"
              aria-label="Add custom favorite site"
            >
              <div className="flex size-10 items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/50">
                <Plus className="size-5" />
              </div>
              <span className="text-[11px] font-medium">Add</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
