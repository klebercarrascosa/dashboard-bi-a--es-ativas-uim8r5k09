import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Activity, Lock, User, UserPlus } from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [executiveName, setExecutiveName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Preencha usuário e senha.')
      return
    }
    if (isSignUp && !executiveName.trim()) {
      toast.error('Informe o nome do executivo.')
      return
    }

    setLoading(true)
    if (isSignUp) {
      const { error } = await signUp(username, password, executiveName.trim())
      if (error) {
        toast.error('Erro ao criar conta: ' + (error.message || 'Verifique os dados informados'))
      } else {
        toast.success('Conta criada com sucesso!')
        navigate('/dashboard')
      }
    } else {
      const { error } = await signIn(username, password)
      if (error) {
        toast.error('Falha no login. Verifique usuário e senha.')
      } else {
        toast.success('Bem-vindo ao Dashboard Ações Ativas BI!')
        navigate('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-900/90 text-slate-100 backdrop-blur">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Activity className="h-7 w-7 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-white">
            BI Ações Ativas
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            {isSignUp
              ? 'Crie sua conta de executivo para acessar o dashboard'
              : 'Acesso seguro para controle comercial e acompanhamento YoY'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: PAULAPEXE"
                  className="pl-9 bg-slate-800/80 border-slate-700 text-slate-100 h-10 text-xs focus-visible:ring-emerald-500"
                  autoCapitalize="none"
                  autoComplete="username"
                />
              </div>
              <p className="text-[10px] text-slate-500">Usuário ou e-mail para acesso.</p>
            </div>

            {isSignUp && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Nome do Executivo</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="text"
                    value={executiveName}
                    onChange={(e) => setExecutiveName(e.target.value)}
                    placeholder="Ex: PAULA CAROLINA PEXE"
                    className="pl-9 bg-slate-800/80 border-slate-700 text-slate-100 h-10 text-xs focus-visible:ring-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Use o mesmo nome que aparece na planilha de vendas.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-slate-800/80 border-slate-700 text-slate-100 h-10 text-xs focus-visible:ring-emerald-500"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all shadow-lg shadow-emerald-500/20"
            >
              {loading
                ? 'Autenticando...'
                : isSignUp
                  ? 'Criar Conta de Executivo'
                  : 'Entrar no Dashboard BI'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setExecutiveName('')
              }}
              className="text-xs text-emerald-400 hover:underline transition-colors"
            >
              {isSignUp ? 'Já possui conta? Faça login aqui' : 'Criar conta de executivo'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
