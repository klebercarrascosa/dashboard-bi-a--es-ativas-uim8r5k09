migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'kleber.carrascosa@gmail.com')
    } catch (_) {
      return
    }

    try {
      const existing = app.findRecordsByFilter('active_actions', "condicao != ''", '', 1, 0)
      if (existing.length > 0) return
    } catch (_) {}

    var samples = [
      {
        client_name: 'Aero GOL Viagens Ltda',
        cpf_cnpj: '12.111.222/0001-33',
        executive: 'Carlos Silva',
        regional: 'Sudeste',
        status: 'Em Negociação',
        priority: 'Alta',
        tab_month: '2025-01',
        note: 'Cliente GOL - meta de vendas trimestral',
        data_inicio: '2025-01-01',
        data_fim: '2025-06-30',
        valor_meta: 250000,
        meta_2: 220000,
        intervalo_relatorio: '30 dias',
        condicao: 'GOL',
      },
      {
        client_name: 'GOL Cargo Transportes ME',
        cpf_cnpj: '22.333.444/0001-55',
        executive: 'Ana Costa',
        regional: 'Sul',
        status: 'Em Negociação',
        priority: 'Média',
        tab_month: '2025-02',
        note: 'Cliente GOL - fretamento de cargas',
        data_inicio: '2025-02-01',
        data_fim: '2025-07-31',
        valor_meta: 180000,
        meta_2: 150000,
        intervalo_relatorio: '15 dias',
        condicao: 'GOL',
      },
      {
        client_name: 'LATAM Travel Solutions S.A.',
        cpf_cnpj: '33.444.555/0001-66',
        executive: 'Pedro Santos',
        regional: 'Sudeste',
        status: 'Em Negociação',
        priority: 'Alta',
        tab_month: '2025-01',
        note: 'Cliente LATAM - pacotes de viagens corporativas',
        data_inicio: '2025-01-15',
        data_fim: '2025-07-15',
        valor_meta: 320000,
        meta_2: 280000,
        intervalo_relatorio: '30 dias',
        condicao: 'LATAM',
      },
      {
        client_name: 'LATAM Cargo Logística Ltda',
        cpf_cnpj: '44.555.666/0001-77',
        executive: 'Maria Oliveira',
        regional: 'Norte',
        status: 'Planejada',
        priority: 'Média',
        tab_month: '2025-03',
        note: 'Cliente LATAM - transporte de cargas regionais',
        data_inicio: '2025-03-01',
        data_fim: '2025-09-30',
        valor_meta: 200000,
        meta_2: 170000,
        intervalo_relatorio: '30 dias',
        condicao: 'LATAM',
      },
      {
        client_name: 'AZUL Top Turismo Eireli',
        cpf_cnpj: '55.666.777/0001-88',
        executive: 'Carlos Silva',
        regional: 'Nordeste',
        status: 'Em Negociação',
        priority: 'Alta',
        tab_month: '2025-02',
        note: 'Cliente AZUL TOP - excursões e fretamento',
        data_inicio: '2025-02-10',
        data_fim: '2025-08-10',
        valor_meta: 150000,
        meta_2: 130000,
        intervalo_relatorio: '15 dias',
        condicao: 'AZUL TOP',
      },
      {
        client_name: 'Azul Top Conect Aviation ME',
        cpf_cnpj: '66.777.888/0001-99',
        executive: 'Ana Costa',
        regional: 'Centro-Oeste',
        status: 'Em Negociação',
        priority: 'Baixa',
        tab_month: '2025-03',
        note: 'Cliente AZUL TOP - voos regionais',
        data_inicio: '2025-03-05',
        data_fim: '2025-09-05',
        valor_meta: 120000,
        meta_2: 100000,
        intervalo_relatorio: '30 dias',
        condicao: 'AZUL TOP',
      },
    ]

    for (var i = 0; i < samples.length; i++) {
      var s = samples[i]

      try {
        app.findFirstRecordByData('active_actions', 'client_name', s.client_name)
        continue
      } catch (_) {}

      var record = new Record(col)
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
      record.set('condicao', s.condicao)
      app.save(record)
    }
  },
  (app) => {
    var names = [
      'Aero GOL Viagens Ltda',
      'GOL Cargo Transportes ME',
      'LATAM Travel Solutions S.A.',
      'LATAM Cargo Logística Ltda',
      'AZUL Top Turismo Eireli',
      'Azul Top Conect Aviation ME',
    ]

    for (var i = 0; i < names.length; i++) {
      try {
        var record = app.findFirstRecordByData('active_actions', 'client_name', names[i])
        app.delete(record)
      } catch (_) {}
    }
  },
)
