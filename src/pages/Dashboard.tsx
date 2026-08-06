import { useState, useEffect, useCallback, useMemo } from 'react'
import { Navbar } from '@/components/Navbar'
import { KPICards } from '@/components/KPICards'
import { ChartsSection } from '@/components/ChartsSection'
import { DataTable } from '@/components/DataTable'
import { ActionModal } from '@/components/ActionModal'
import { SettingsModal } from '@/components/SettingsModal'
import { ReportDialog } from '@/components/ReportDialog'
import { ClientDetailDialog } from '@/components/ClientDetailDialog'
import { ClientPlansDetailDialog } from '@/components/ClientPlansDetailDialog'
import { ActivePlansDashboard } from '@/components/ActivePlansDashboard'
import { ExecutivePlansView } from '@/components/ExecutivePlansView'
import { MyTeamDashboard } from '@/components/MyTeamDashboard'
import { ActivePlansRanking } from '@/components/ActivePlansRanking'
import { ActivePlansKpi } from '@/components/ActivePlansKpi'
import { ActiveAgenciesKpi } from '@/components/ActiveAgenciesKpi'
import { CondicaoPanel } from '@/components/CondicaoPanel'
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
  findActivePlanForClient,
} from '@/services/actions'
import {
  fetchAllMonthData,
  calculateSomaVendida,
  calculatePlanMetrics,
  getActionsCoveringMonth,
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
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const userExecutiveName = user?.executive_name || ''

  const safeSetIsSettingsModalOpen = useCallback(
    (open: boolean) => {
      if (isAdmin) setIsSettingsModalOpen(open)
    },
    [isAdmin],
  )

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
  const [planDetailClientName, setPlanDetailClientName] = useState<string | null>(null)
  const [forceNewPlan, setForceNewPlan] = useState(false)
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [planosExecInitialExec, setPlanosExecInitialExec] = useState<string | null>(null)

  const loadSheetData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      if (
        activeTab === 'Planos Ativos' ||
        activeTab === 'Planos por Executivo' ||
        activeTab === 'Meu time' ||
        activeTab === 'Ranking de Planos'
      ) {
        setSheetData([])
        setLastUpdated(new Date())
        setIsRefreshing(false)
        return
      }
      setSheetData([])
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

  const roleFilteredSheetData = useMemo(() => {
    if (!user) return []
    if (isAdmin) return sheetData
    if (!userExecutiveName) return []
    const execNameLower = userExecutiveName.toLowerCase().trim()
    return sheetData.filter((row) => (row.executivo || '').toLowerCase().trim() === execNameLower)
  }, [sheetData, isAdmin, userExecutiveName, user])

  const roleFilteredActions = useMemo(() => {
    if (!user) return []
    if (isAdmin) return activeActions
    if (!userExecutiveName) return []
    const execNameLower = userExecutiveName.toLowerCase().trim()
    return activeActions.filter((a) => (a.executive || '').toLowerCase().trim() === execNameLower)
  }, [activeActions, isAdmin, userExecutiveName, user])

  const planCalculations = useMemo(() => {
    const map = new Map<string, PlanCalculation>()
    for (const action of roleFilteredActions) {
      const somaVendida = calculateSomaVendida(
        monthDataMap,
        action.client_name,
        action.cpf_cnpj,
        action.data_inicio,
        action.data_fim,
      )
      map.set(action.id!, calculatePlanMetrics(action, somaVendida))
    }
    return map
  }, [roleFilteredActions, monthDataMap])

  const actionsCoveringMonth = useMemo(() => {
    if (activeTab === 'Visão Geral') return roleFilteredActions
    return getActionsCoveringMonth(roleFilteredActions, activeTab)
  }, [roleFilteredActions, activeTab])

  const filteredData = roleFilteredSheetData.filter((row) => {
    if (selectedExecutive !== 'all' && row.executivo !== selectedExecutive) return false
    if (selectedRegional !== 'all' && row.regional !== selectedRegional) return false
    return true
  })

  const displayData =
    activeTab === 'Visão Geral' ? aggregateSheetRowsByClient(filteredData) : filteredData

  const today = new Date().toISOString().slice(0, 10)
  const kpiActiveActions = roleFilteredActions.filter((a) => a.client_name !== 'Empresa Alfa Ltda')
  const uniqueExecutives = Array.from(
    new Set([
      ...roleFilteredSheetData.map((r) => r.executivo),
      ...kpiActiveActions.map((a) => a.executive),
    ]),
  )
    .filter(Boolean)
    .sort()
  const uniqueRegionals = Array.from(
    new Set([
      ...roleFilteredSheetData.map((r) => r.regional),
      ...kpiActiveActions.map((a) => a.regional),
    ]),
  )
    .filter(Boolean)
    .sort()

  const activeOnlyActions = useMemo(() => {
    return kpiActiveActions.filter((a) => {
      if (a.status === 'Concluído') return false
      if (!a.data_inicio || !a.data_fim) return false
      return today >= a.data_inicio && today <= a.data_fim
    })
  }, [kpiActiveActions, today])

  const handleOpenActionModal = (client: SheetRow) => {
    setSelectedClientForAction(client)
    setSelectedActionId(null)
    setForceNewPlan(false)
    setIsActionModalOpen(true)
  }

  const handleCreateNewPlan = (client: SheetRow) => {
    setSelectedClientForAction(client)
    setSelectedActionId(null)
    setForceNewPlan(true)
    setIsActionModalOpen(true)
  }

  const handleEditAction = (action: ActiveAction) => {
    const sheetRow: SheetRow = {
      id: action.id || '',
      clienteUnificado: action.client_name,
      executivo: action.executive || '',
      cpfCnpj: action.cpf_cnpj || '',
      regional: action.regional || '',
      venda: null,
      vendaLY: null,
      deltaLY: null,
      pctYoY: null,
    }
    setSelectedClientForAction(sheetRow)
    setSelectedActionId(action.id || null)
    setForceNewPlan(false)
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
    ? forceNewPlan
      ? null
      : selectedActionId
        ? (roleFilteredActions.find((a) => a.id === selectedActionId) ?? null)
        : (findActivePlanForClient(roleFilteredActions, selectedClientForAction.clienteUnificado) ??
          null)
    : null

  const reportCalc = reportAction ? (planCalculations.get(reportAction.id ?? '') ?? null) : null

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <Navbar
        zoom={zoom}
        setZoom={setZoom}
        onRefresh={loadSheetData}
        isRefreshing={isRefreshing}
        onOpenSettings={() => safeSetIsSettingsModalOpen(true)}
        lastUpdated={lastUpdated}
      />

      <main
        className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6"
        style={{ zoom: `${zoom}%` }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <Calendar className="h-4 w-4 text-emerald-500 shrink-0 ml-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap mr-2 font-medium">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
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
            <Button
              variant={activeTab === 'Planos Ativos' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('Planos Ativos')}
              className={`h-8 text-xs whitespace-nowrap rounded-lg px-3 ml-1 ${
                activeTab === 'Planos Ativos'
                  ? 'bg-primary text-primary-foreground font-bold shadow'
                  : 'text-muted-foreground'
              }`}
            >
              Planos Ativos
            </Button>
            <Button
              variant={activeTab === 'Planos por Executivo' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('Planos por Executivo')}
              className={`h-8 text-xs whitespace-nowrap rounded-lg px-3 ml-1 ${
                activeTab === 'Planos por Executivo'
                  ? 'bg-primary text-primary-foreground font-bold shadow'
                  : 'text-muted-foreground'
              }`}
            >
              Por Executivo
            </Button>
            <Button
              variant={activeTab === 'Ranking de Planos' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('Ranking de Planos')}
              className={`h-8 text-xs whitespace-nowrap rounded-lg px-3 ml-1 ${
                activeTab === 'Ranking de Planos'
                  ? 'bg-primary text-primary-foreground font-bold shadow'
                  : 'text-muted-foreground'
              }`}
            >
              Ranking de Planos
            </Button>
            {isAdmin && (
              <Button
                variant={activeTab === 'Meu time' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('Meu time')}
                className={`h-8 text-xs whitespace-nowrap rounded-lg px-3 ml-1 ${
                  activeTab === 'Meu time'
                    ? 'bg-primary text-primary-foreground font-bold shadow'
                    : 'text-muted-foreground'
                }`}
              >
                Meu time
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 border-t lg:border-t-0 pt-2 lg:pt-0">
            <Filter className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />

            {isAdmin && (
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
            )}

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

        {activeTab === 'Planos Ativos' ? (
          <ActivePlansDashboard
            activeActions={activeOnlyActions}
            planCalculations={planCalculations}
            onEditAction={handleEditAction}
            onGenerateReport={handleGenerateReport}
            onClientClick={setPlanDetailClientName}
          />
        ) : activeTab === 'Planos por Executivo' ? (
          <ExecutivePlansView
            key={planosExecInitialExec ?? 'none'}
            activeActions={activeOnlyActions}
            planCalculations={planCalculations}
            today={today}
            onClientClick={setPlanDetailClientName}
            onEditAction={handleEditAction}
            onGenerateReport={handleGenerateReport}
            initialExec={planosExecInitialExec}
          />
        ) : activeTab === 'Meu time' ? (
          <MyTeamDashboard
            activeActions={activeOnlyActions}
            planCalculations={planCalculations}
            today={today}
            onClientClick={setPlanDetailClientName}
            onEditAction={handleEditAction}
            onGenerateReport={handleGenerateReport}
          />
        ) : activeTab === 'Ranking de Planos' ? (
          <ActivePlansRanking activeActions={activeOnlyActions} today={today} isAdmin={isAdmin} />
        ) : (
          <>
            <KPICards data={displayData} activeTab={activeTab} />

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <ActivePlansKpi activeActions={activeOnlyActions} today={today} isAdmin={isAdmin} />
              <ActiveAgenciesKpi
                activeActions={activeOnlyActions}
                today={today}
                isAdmin={isAdmin}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ChartsSection data={displayData} />
              <CondicaoPanel
                activeActions={roleFilteredActions}
                isAdmin={isAdmin}
                onUpdate={loadActiveActions}
              />
            </div>

            <DataTable
              data={displayData}
              activeActions={actionsCoveringMonth}
              planCalculations={planCalculations}
              onOpenActionModal={handleOpenActionModal}
              onCreateNewPlan={handleCreateNewPlan}
              onGenerateReport={handleGenerateReport}
              onDeleteAction={handleDeleteAction}
              onClientClick={handleClientClick}
            />
          </>
        )}
      </main>

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false)
          setForceNewPlan(false)
          setSelectedActionId(null)
        }}
        client={selectedClientForAction}
        existingAction={currentActionForModal}
        activeTab={activeTab}
        onSaved={loadActiveActions}
      />

      {isAdmin && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          spreadsheetId={spreadsheetId}
          setSpreadsheetId={setSpreadsheetId}
          onReload={loadSheetData}
        />
      )}

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
        activeActions={roleFilteredActions}
        planCalculations={planCalculations}
      />

      <ClientPlansDetailDialog
        isOpen={!!planDetailClientName}
        onClose={() => setPlanDetailClientName(null)}
        clientName={planDetailClientName}
        allActions={roleFilteredActions}
        planCalculations={planCalculations}
        monthDataMap={monthDataMap}
        isAdmin={isAdmin}
        onUpdateCondition={loadActiveActions}
      />
    </div>
  )
}
