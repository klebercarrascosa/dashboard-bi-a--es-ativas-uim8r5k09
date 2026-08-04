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
  created?: string
  updated?: string
}

export const getActiveActions = () => pb.collection('active_actions').getFullList<ActiveAction>()

export const createActiveAction = (data: Omit<ActiveAction, 'id' | 'created' | 'updated'>) =>
  pb.collection('active_actions').create(data)

export const updateActiveAction = (id: string, data: Partial<ActiveAction>) =>
  pb.collection('active_actions').update(id, data)

export const deleteActiveAction = (id: string) => pb.collection('active_actions').delete(id)
