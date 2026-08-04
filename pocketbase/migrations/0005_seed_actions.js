migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')
    const count = app.countRecords('active_actions')
    if (count > 0) return

    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'kleber.carrascosa@gmail.com')
    } catch (_) {
      return
    }

    const samples = [
      {
        client_name: 'Empresa Alfa Ltda',
        cpf_cnpj: '12.345.678/0001-90',
        executive: 'Carlos Silva',
        regional: 'Sul',
        status: 'Em Negociação',
        priority: 'Alta',
        tab_month: '2025-01',
        note: 'Proposta enviada, aguardando retorno',
        data_inicio: '2025-01-15',
        data_fim: '2025-03-15',
        valor_meta: 150000,
        meta_2: 120000,
        intervalo_relatorio: '30 dias',
        ultimo_relatorio: '2025-02-15',
      },
      {
        client_name: 'Construtora Beta S.A.',
        cpf_cnpj: '98.765.432/0001-10',
        executive: 'Ana Costa',
        regional: 'Sudeste',
        status: 'Planejada',
        priority: 'Média',
        tab_month: '2025-01',
        note: 'Reunião inicial agendada',
        data_inicio: '2025-01-20',
        data_fim: '2025-04-20',
        valor_meta: 200000,
        meta_2: 180000,
        intervalo_relatorio: '15 dias',
        ultimo_relatorio: '',
      },
      {
        client_name: 'Comércio Gamma ME',
        cpf_cnpj: '11.222.333/0001-44',
        executive: 'Pedro Santos',
        regional: 'Nordeste',
        status: 'Concluído',
        priority: 'Baixa',
        tab_month: '2025-02',
        note: 'Contrato assinado',
        data_inicio: '2025-02-01',
        data_fim: '2025-02-28',
        valor_meta: 50000,
        meta_2: 50000,
        intervalo_relatorio: '30 dias',
        ultimo_relatorio: '2025-02-28',
      },
      {
        client_name: 'Tech Delta LLC',
        cpf_cnpj: '44.555.666/0001-77',
        executive: 'Maria Oliveira',
        regional: 'Sudeste',
        status: 'Em Risco',
        priority: 'Alta',
        tab_month: '2025-02',
        note: 'Cliente insatisfeito com prazo',
        data_inicio: '2025-02-10',
        data_fim: '2025-05-10',
        valor_meta: 300000,
        meta_2: 250000,
        intervalo_relatorio: '15 dias',
        ultimo_relatorio: '2025-03-01',
      },
      {
        client_name: 'Indústria Epsilon',
        cpf_cnpj: '77.888.999/0001-22',
        executive: 'Carlos Silva',
        regional: 'Sul',
        status: 'Pendente',
        priority: 'Média',
        tab_month: '2025-03',
        note: 'Aguardando documentação',
        data_inicio: '2025-03-05',
        data_fim: '2025-06-05',
        valor_meta: 180000,
        meta_2: 150000,
        intervalo_relatorio: '30 dias',
        ultimo_relatorio: '',
      },
      {
        client_name: 'Serviços Zeta Ltda',
        cpf_cnpj: '33.444.555/0001-88',
        executive: 'Ana Costa',
        regional: 'Norte',
        status: 'Em Negociação',
        priority: 'Alta',
        tab_month: '2025-03',
        note: 'Negociação avançada',
        data_inicio: '2025-03-12',
        data_fim: '2025-06-12',
        valor_meta: 220000,
        meta_2: 200000,
        intervalo_relatorio: '15 dias',
        ultimo_relatorio: '2025-03-27',
      },
    ]

    for (const s of samples) {
      const record = new Record(col)
      record.set('user_id', admin.id)
      record.set('client_name', s.client_name)
      record.set('cpf_cnpj', s.cpf_cnpj)
      record.set('executive', s.executive)
      record.set('regional', s.regional)
      record.set('status', s.status)
      record.set('priority', s.priority)
      record.set('tab_month', s.tab_month)
      record.set('note', s.note)
      record.set('data_inicio', s.data_inicio)
      record.set('data_fim', s.data_fim)
      record.set('valor_meta', s.valor_meta)
      record.set('meta_2', s.meta_2)
      record.set('intervalo_relatorio', s.intervalo_relatorio)
      if (s.ultimo_relatorio) {
        record.set('ultimo_relatorio', s.ultimo_relatorio)
      }
      app.save(record)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('active_actions')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
