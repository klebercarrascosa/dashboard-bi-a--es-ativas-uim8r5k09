import pb from '@/lib/pocketbase/client'

export interface ActiveAction {
  id?: string
  user_id: string
  client_name: string
  cpf_cnpj: string
  executive: string
  regional: string
  status: 'Planejada' | 'Em Negociação' | 'Concluído' | 'Em Risco' | 'Pendente'
  priority: 'Alta' | 'Média' | 'Baixa'
  note: string
  tab_month: string
  data_inicio?: string
  data_fim?: string
  valor_meta?: number
  meta_2?: number
  meta_3?: number
  premio_meta_1?: number
  premio_meta_2?: number
  premio_meta_3?: number
  valor_vendido?: number
  intervalo_relatorio?: '15 dias' | '30 dias'
  ultimo_relatorio?: string
  created?: string
  updated?: string
}

export const getActiveActions = () => pb.collection('active_actions').getFullList<ActiveAction>()

export const createActiveAction = (data: Omit<ActiveAction, 'id' | 'created' | 'updated'>) =>
  pb.collection('active_actions').create(data)

export const updateActiveAction = (id: string, data: Partial<ActiveAction>) =>
  pb.collection('active_actions').update(id, data)

export const deleteActiveAction = (id: string) => pb.collection('active_actions').delete(id)

export function findActivePlanForClient(
  actions: ActiveAction[],
  clientName: string,
): ActiveAction | undefined {
  const today = new Date().toISOString().slice(0, 10)
  const clientPlans = actions.filter((a) => a.client_name === clientName)
  const active = clientPlans.find(
    (a) => a.data_inicio && a.data_fim && today >= a.data_inicio && today <= a.data_fim,
  )
  if (active) return active
  return clientPlans.sort((a, b) => (b.data_inicio || '').localeCompare(a.data_inicio || ''))[0]
}
