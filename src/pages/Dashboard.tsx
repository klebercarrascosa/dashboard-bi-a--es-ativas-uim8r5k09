import { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/Navbar'
import { KPICards } from '@/components/KPICards'
import { ChartsSection } from '@/components/ChartsSection'
import { DataTable } from '@/components/DataTable'
import { ActionModal } from '@/components/ActionModal'
import { SettingsModal } from '@/components/SettingsModal'
import {
  SHEET_MONTHS,
  DEFAULT_SPREADSHEET_ID,
  SheetRow,
  fetchGoogleSheetData,
  aggregateSheetRowsByClient,
} from '@/services/sheets'
import { ActiveAction, getActiveActions } from '@/services/actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, Calendar, RefreshCw } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export default function Dashboard() {
  const [zoom, setZoom] = useState(100)
  const [spreadsheetId, setSpreadsheetId] = useState(DEFAULT_SPREADSHEET_ID)
  const [activeTab, setActiveTab] = useState('Visão Geral')
  const [sheetData, setSheetData] = useState<SheetRow[]>([])
  const [activeActions, setActiveActions] = useState<ActiveAction[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Filters
  const [selectedExecutive, setSelectedExecutive] = useState<string>('all')
  const [selectedRegional, setSelectedRegional] = useState<string>('all')

  // Modals
  const [selectedClientForAction, setSelectedClientForAction] = useState<SheetRow | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  // Load Sheet Data
  const loadSheetData = useCallback(async () => {
    setIsRefreshing(true)
    if (activeTab === 'Visão Geral') {
      const months = SHEET_MONTHS.filter((m) => m !== 'Visão Geral')
      const allRows = await Promise.all(months.map((m) => fetchGoogleSheetData(spreadsheetId, m)))
      setSheetData(allRows.flat())
    } else {
      const rows = await fetchGoogleSheetData(spreadsheetId, activeTab)
      setSheetData(rows)
    }
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }, [spreadsheetId, activeTab])

  // Load Active Actions from PocketBase
  const loadActiveActions = useCallback(async () => {
    try {
      const actions = await getActiveActions()
      setActiveActions(actions)
    } catch (err) {
      console.warn('Could not load active actions from backend', err)
    }
  }, [])

  useEffect(() => {
    loadSheetData()
  }, [loadSheetData])

  useEffect(() => {
    loadActiveActions()
  }, [loadActiveActions])

  // Realtime subscription for Active Actions
  useRealtime('active_actions', () => {
    loadActiveActions()
  })

  // Filtered Sheet Data for KPIs, Charts and Table
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

  const currentActionForModal = selectedClientForAction
    ? activeActions.find((a) => a.client_name === selectedClientForAction.clienteUnificado)
    : null

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

      {/* Main Content with Dynamic Zoom Scale */}
      <main
        className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6"
        style={{ zoom: `${zoom}%` }}
      >
        {/* Month Tabs & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border rounded-xl p-3 shadow-sm">
          {/* Month / Tab Selector */}
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

          {/* Secondary Filters */}
          <div className="flex items-center gap-2 border-t lg:border-t-0 pt-2 lg:pt-0">
            <Filter className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />

            {/* Executive Filter */}
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

            {/* Regional Filter */}
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

        {/* KPI Cards */}
        <KPICards data={displayData} activeTab={activeTab} />

        {/* BI Visual Charts */}
        <ChartsSection data={displayData} />

        {/* Interactive Data Table */}
        <DataTable
          data={displayData}
          activeActions={activeActions}
          onOpenActionModal={handleOpenActionModal}
        />
      </main>

      {/* Action Registration Modal */}
      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        client={selectedClientForAction}
        existingAction={currentActionForModal}
        activeTab={activeTab}
        onSaved={loadActiveActions}
      />

      {/* Google Sheets Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        spreadsheetId={spreadsheetId}
        setSpreadsheetId={setSpreadsheetId}
        onReload={loadSheetData}
      />
    </div>
  )
}
