import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEFAULT_SPREADSHEET_ID } from '@/services/sheets'
import { toast } from 'sonner'
import { Link2, RefreshCw } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  spreadsheetId: string
  setSpreadsheetId: (id: string) => void
  onReload: () => void
}

export function SettingsModal({
  isOpen,
  onClose,
  spreadsheetId,
  setSpreadsheetId,
  onReload,
}: SettingsModalProps) {
  const [inputVal, setInputVal] = useState(spreadsheetId)

  const extractId = (urlOrId: string) => {
    const match = urlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : urlOrId.trim()
  }

  const handleSave = () => {
    const cleanId = extractId(inputVal)
    if (!cleanId) {
      toast.error('Por favor, informe um ID ou URL válida do Google Sheets.')
      return
    }
    setSpreadsheetId(cleanId)
    toast.success('ID da planilha configurado com sucesso!')
    onReload()
    onClose()
  }

  const handleReset = () => {
    setInputVal(DEFAULT_SPREADSHEET_ID)
    setSpreadsheetId(DEFAULT_SPREADSHEET_ID)
    toast.info('Restaurado para a planilha padrão original.')
    onReload()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-500" />
            Configuração da Planilha Google Sheets
          </DialogTitle>
          <DialogDescription className="text-xs">
            Informe o Link ou ID da planilha do Google para leitura dos dados em tempo real.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Link ou ID da Planilha</Label>
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ex: 1Tl8GvNv9wemusqhNSLGr689EdYu1_u1WToLnPoEqTO0"
              className="text-xs h-9 font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              A planilha deve estar compartilhada como &quot;Qualquer pessoa com o link pode
              ver&quot;.
            </p>
          </div>

          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">📌 Abas e Colunas Reconhecidas:</p>
            <p>
              O sistema busca automaticamente abas por meses (ex: Janeiro, Fevereiro) e lê as
              colunas:&nbsp;
              <span className="font-bold">
                Cliente Unificado, Executivo, CPFCNPJ, Regional, Venda, Venda LY, Δ LY, % YoY
              </span>
              .
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground"
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Restaurar Padrão
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Salvar e Atualizar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
