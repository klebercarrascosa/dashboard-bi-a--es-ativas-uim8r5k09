migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'kleber.carrascosa@gmail.com')
    } catch (_) {
      return
    }

    let exists = false
    try {
      const records = app.findRecordsByFilter(
        'active_actions',
        "client_name = 'Empresa Alfa Ltda'",
        '-created',
        100,
        0,
      )
      exists = records.some(function (r) {
        return r.getString('data_inicio').startsWith('2025-10-01')
      })
    } catch (_) {}

    if (exists) return

    const record = new Record(col)
    record.set('user_id', admin.id)
    record.set('client_name', 'Empresa Alfa Ltda')
    record.set('cpf_cnpj', '12.345.678/0001-90')
    record.set('executive', 'Carlos Silva')
    record.set('regional', 'Sul')
    record.set('status', 'Planejada')
    record.set('priority', 'Alta')
    record.set('tab_month', '2025-10')
    record.set('note', 'Plano para o quarto trimestre - meta de fim de ano')
    record.set('data_inicio', '2025-10-01')
    record.set('data_fim', '2025-12-31')
    record.set('valor_meta', 180000)
    record.set('meta_2', 150000)
    record.set('meta_3', 200000)
    record.set('intervalo_relatorio', '30 dias')
    app.save(record)
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter(
        'active_actions',
        "client_name = 'Empresa Alfa Ltda'",
        '-created',
        100,
        0,
      )
      for (const r of records) {
        if (r.getString('data_inicio').startsWith('2025-10-01')) {
          app.delete(r)
        }
      }
    } catch (_) {}
  },
)
