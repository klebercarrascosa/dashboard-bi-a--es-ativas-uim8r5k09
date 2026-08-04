import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/hooks/use-theme'
import {
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings,
  ShieldCheck,
  Activity,
} from 'lucide-react'

interface NavbarProps {
  zoom: number
  setZoom: React.Dispatch<React.SetStateAction<number>>
  onRefresh: () => void
  isRefreshing: boolean
  onOpenSettings?: () => void
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

  const zoomIn = () => setZoom((prev) => Math.min(prev + 10, 150))
  const zoomOut = () => setZoom((prev) => Math.max(prev - 10, 70))
  const zoomReset = () => setZoom(100)

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">Ações Ativas BI</h1>
              <Badge
                variant="outline"
                className={`text-xs ${user?.role === 'admin' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'}`}
              >
                <ShieldCheck className="mr-1 h-3 w-3" />{' '}
                {user?.role === 'admin' ? 'Admin' : 'Executivo'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Controle Comercial Google Sheets &amp; Análise YoY
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden md:flex items-center border rounded-lg p-1 bg-muted/40 gap-1 text-xs">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={zoomOut}
              title="Diminuir Zoom"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <button
              onClick={zoomReset}
              className="px-1.5 font-mono font-medium hover:underline"
              title="Resetar Zoom"
            >
              {zoom}%
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={zoomIn}
              title="Aumentar Zoom"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            {zoom !== 100 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={zoomReset}
                title="Restaurar 100%"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Sync Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </Button>

          {/* Settings Modal - Only visible to admin */}
          {isAdmin && onOpenSettings && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onOpenSettings}
              title="Configurações de Planilha"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleTheme}
            title="Alternar Tema"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </Button>

          {/* User & Logout */}
          <div className="flex items-center pl-2 border-l gap-2">
            <div className="hidden lg:block text-right text-xs">
              <p className="font-semibold leading-tight">
                {user?.name || user?.email || 'Usuário'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {user?.role === 'admin' ? 'Administrador' : user?.executive_name || user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:bg-destructive/10"
              onClick={signOut}
              title="Sair do Sistema"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
