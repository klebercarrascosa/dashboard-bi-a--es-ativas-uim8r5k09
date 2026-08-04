import { useState, useEffect, useCallback, useMemo } from 'react'
import { Navbar } from '@/components/Navbar'
import { KPICards } from '@/components/KPICards'
import { ChartsSection } from '@/components/ChartsSection'
import { DataTable } from '@/components/DataTable'
import { ActionModal } from '@/components/ActionModal'
import { SettingsModal } from '@/components/SettingsModal'
import { ReportDialog } from '@/components/ReportDialog'
import { ClientDetailDialog } from '@/components/ClientDetailDialog'
import {
  SHEET_MONTHS,
  DEFAULT_SPREADSHEET_ID,
  SheetRow,
  fetchGoogleSheetData,
  aggregateSheetRowsByClient,
} from '@/services/sheets'
import {
  ActiveAction,
  getActiveActions,
  deleteActiveAction,
  updateActiveAction,
} from '@/services/actions'
import {
  fetchAllMonthData,
  calculateSomaVendida,
  calculatePlanMetrics,
  type PlanCalculation,
} from '@/services/plan-calculations'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, Calendar } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

export default function Dashboard() {
  const [zoom, setZoom] = useState(100)
  const [spreadsheetId, setSpreadsheetId] = useState(DEFAULT_SPREADSHEET_ID)
  const [activeTab, setActiveTab] = useState('Visão Geral')
  const [sheetData, setSheetData] = useState<SheetRow[]>([])
  const [activeActions, setActiveActions] = useState<ActiveAction[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [monthDataMap, setMonthDataMap] = useState<Map<string, SheetRow[]>>(new Map())

  const [selectedExecutive, setSelectedExecutive] = useState<string>('all')
  const [selectedRegional, setSelectedRegional] = useState<string>('all')

  const [selectedClientForAction, setSelectedClientForAction] = useState<SheetRow | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [reportAction, setReportAction] = useState<ActiveAction | null>(null)
  const [detailClient, setDetailClient] = useState<SheetRow | null>(null)

  const loadSheetData = useCallback(async () => {
    setIsRefreshing(true)
    setSheetData([])
    try {
      if (activeTab === 'Visão Geral') {
        const months = SHEET_MONTHS.filter((m) => m !== 'Visão Geral')
        const results = await Promise.all(months.map((m) => fetchGoogleSheetData(spreadsheetId, m)))
        const allRows: SheetRow[] = []
        for (const rows of results) {
          if (rows && rows.length > 0) {
            allRows.push(...rows)
          }
        }
        setSheetData(allRows)
      } else {
        const rows = await fetchGoogleSheetData(spreadsheetId, activeTab)
        setSheetData(rows || [])
      }
      setLastUpdated(new Date())
    } catch (err) {
      console.warn('Failed to load sheet data:', err)
      setSheetData([])
    } finally {
      setIsRefreshing(false)
    }
  }, [spreadsheetId, activeTab])

  const loadActiveActions = useCallback(async () => {
    try {
      const actions = await getActiveActions()
      setActiveActions(actions)
    } catch (err) {
      console.warn('Could not load active actions from backend', err)
    }
  }, [])

  const loadMonthDataMap = useCallback(async () => {
    try {
      const map = await fetchAllMonthData(spreadsheetId)
      setMonthDataMap(map)
    } catch (err) {
      console.warn('Could not load month data map', err)
    }
  }, [spreadsheetId])

  useEffect(() => {
    loadSheetData()
  }, [loadSheetData])

  useEffect(() => {
    loadActiveActions()
  }, [loadActiveActions])

  useEffect(() => {
    loadMonthDataMap()
  }, [loadMonthDataMap])

  useEffect(() => {
    setSelectedExecutive('all')
    setSelectedRegional('all')
  }, [activeTab])

  useRealtime('active_actions', () => {
    loadActiveActions()
  })

  const planCalculations = useMemo(() => {
    const map = new Map<string, PlanCalculation>()
    for (const action of activeActions) {
      const somaVendida = calculateSomaVendida(
        monthDataMap,
        action.client_name,
        action.cpf_cnpj,
        action.data_inicio,
        action.data_fim,
      )
      map.set(action.client_name, calculatePlanMetrics(action, somaVendida))
    }
    return map
  }, [activeActions, monthDataMap])

  const filteredData = sheetData.filter((row) => {
    if (selectedExecutive !== 'all' && row.executivo !== selectedExecutive) return false
    if (selectedRegional !== 'all' && row.regional !== selectedRegional) return false
    return true
  })

  const displayData =
    activeTab === 'Visão Geral' ? aggregateSheetRowsByClient(filteredData) : filteredData

  const uniqueExecutives = Array.from(new Set(sheetData.map((r) => r.executivo))).sort()
  const uniqueRegionals = Array.from(new Set(sheetData.map((r) => r.regional))).sort()

  const handleOpenActionModal = (client: SheetRow) => {
    setSelectedClientForAction(client)
    setIsActionModalOpen(true)
  }

  const handleDeleteAction = async (action: ActiveAction) => {
    if (!action.id) return
    try {
      await deleteActiveAction(action.id)
      await loadActiveActions()
      toast.success('Plano de Meta excluído com sucesso!')
    } catch {
      toast.error('Erro ao excluir Plano de Meta.')
    }
  }

  const handleGenerateReport = (action: ActiveAction) => {
    setReportAction(action)
  }

  const handleClientClick = (client: SheetRow) => {
    setDetailClient(client)
  }

  const handleMarkReportAsSent = async (actionId: string) => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      await updateActiveAction(actionId, { ultimo_relatorio: today })
      await loadActiveActions()
      toast.success('Relatório marcado como enviado!')
    } catch {
      toast.error('Erro ao atualizar relatório.')
    }
  }

  const currentActionForModal = selectedClientForAction
    ? activeActions.find((a) => a.client_name === selectedClientForAction.clienteUnificado)
    : null

  const reportCalc = reportAction ? (planCalculations.get(reportAction.client_name) ?? null) : null

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <Navbar
        zoom={zoom}
        setZoom={setZoom}
        onRefresh={loadSheetData}
        isRefreshing={isRefreshing}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        lastUpdated={lastUpdated}
      />

      <main
        className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6"
        style={{ zoom: `${zoom}%` }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <Calendar className="h-4 w-4 text-emerald-500 shrink-0 ml-1 mr-1" />
            {SHEET_MONTHS.map((month) => (
              <Button
                key={month}
                variant={activeTab === month ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(month)}
                className={`h-8 text-xs whitespace-nowrap rounded-lg px-3 ${
                  activeTab === month
                    ? 'bg-primary text-primary-foreground font-bold shadow'
                    : 'text-muted-foreground'
                }`}
              >
                {month}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t lg:border-t-0 pt-2 lg:pt-0">
            <Filter className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />

            <Select value={selectedExecutive} onValueChange={setSelectedExecutive}>
              <SelectTrigger className="h-8 text-xs w-[140px]">
                <SelectValue placeholder="Executivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Executivos</SelectItem>
                {uniqueExecutives.map((exec) => (
                  <SelectItem key={exec} value={exec}>
                    {exec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegional} onValueChange={setSelectedRegional}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue placeholder="Regional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Regionais</SelectItem>
                {uniqueRegionals.map((reg) => (
                  <SelectItem key={reg} value={reg}>
                    {reg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedExecutive !== 'all' || selectedRegional !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedExecutive('all')
                  setSelectedRegional('all')
                }}
                className="h-8 text-xs px-2 text-destructive hover:bg-destructive/10"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        <KPICards data={displayData} activeTab={activeTab} activeActions={activeActions} />

        <ChartsSection data={displayData} />

        <DataTable
          data={displayData}
          activeActions={activeActions}
          planCalculations={planCalculations}
          onOpenActionModal={handleOpenActionModal}
          onGenerateReport={handleGenerateReport}
          onDeleteAction={handleDeleteAction}
          onClientClick={handleClientClick}
        />
      </main>

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        client={selectedClientForAction}
        existingAction={currentActionForModal}
        activeTab={activeTab}
        onSaved={loadActiveActions}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        spreadsheetId={spreadsheetId}
        setSpreadsheetId={setSpreadsheetId}
        onReload={loadSheetData}
      />

      <ReportDialog
        isOpen={!!reportAction}
        onClose={() => setReportAction(null)}
        action={reportAction}
        calc={reportCalc}
        onMarkAsSent={handleMarkReportAsSent}
      />

      <ClientDetailDialog
        isOpen={!!detailClient}
        onClose={() => setDetailClient(null)}
        client={detailClient}
        activeTab={activeTab}
        monthDataMap={monthDataMap}
        activeActions={activeActions}
        planCalculations={planCalculations}
      />
    </div>
  )
}
