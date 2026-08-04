import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Activity, ShieldCheck, Lock, Mail } from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('kleber.carrascosa@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Preencha e-mail e senha.')
      return
    }

    setLoading(true)
    if (isSignUp) {
      const { error } = await signUp(email, password)
      if (error) {
        toast.error('Erro ao criar conta: ' + (error.message || 'Verifique as credenciais'))
      } else {
        toast.success('Conta criada e autenticada com sucesso!')
        navigate('/')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        toast.error('Falha no login. Verifique e-mail e senha.')
      } else {
        toast.success('Bem-vindo ao Dashboard Ações Ativas BI!')
        navigate('/')
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
            Acesso seguro para controle comercial e acompanhamento YoY
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">E-mail Corporativo</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="pl-9 bg-slate-800/80 border-slate-700 text-slate-100 h-10 text-xs focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Senha de Acesso</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-slate-800/80 border-slate-700 text-slate-100 h-10 text-xs focus-visible:ring-emerald-500"
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
                  ? 'Criar Conta de Acesso'
                  : 'Entrar no Dashboard BI'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-emerald-400 hover:underline transition-colors"
            >
              {isSignUp ? 'Já possui conta? Faça login aqui' : 'Criar nova conta de usuário'}
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Credenciais de Demonstração:
            </p>
            <p>
              E-mail: <code className="text-slate-200 font-mono">kleber.carrascosa@gmail.com</code>
            </p>
            <p>
              Senha: <code className="text-slate-200 font-mono">Skip@Pass</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
