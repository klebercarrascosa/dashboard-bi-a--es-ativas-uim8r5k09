import { Button } from '@/components/ui/button'
import { RefreshCw, Settings, ZoomIn, ZoomOut, Sun, Moon, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import { CURRENT_YEAR, formatLastUpdated } from '@/lib/date-utils'

interface NavbarProps {
  zoom: number
  setZoom: (zoom: number) => void
  onRefresh: () => void
  isRefreshing: boolean
  onOpenSettings: () => void
  lastUpdated: Date | null
}

export function Navbar({
  zoom,
  setZoom,
  onRefresh,
  isRefreshing,
  onOpenSettings,
  lastUpdated,
}: NavbarProps) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isAdmin = user?.role === 'admin'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-foreground">Dashboard BI</h1>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50">
            {CURRENT_YEAR}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAdmin && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenSettings}>
              <Settings className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {user?.name || user?.email}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {lastUpdated && (
        <div className="px-4 md:px-6 py-1 text-xs text-muted-foreground border-t border-border bg-muted/30">
          Última atualização: {formatLastUpdated(lastUpdated)}
        </div>
      )}
    </header>
  )
}
