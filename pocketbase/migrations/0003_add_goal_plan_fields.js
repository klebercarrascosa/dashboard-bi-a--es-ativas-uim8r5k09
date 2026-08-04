migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    if (!col.fields.getByName('data_inicio')) {
      col.fields.add(new DateField({ name: 'data_inicio' }))
    }
    if (!col.fields.getByName('data_fim')) {
      col.fields.add(new DateField({ name: 'data_fim' }))
    }
    if (!col.fields.getByName('valor_meta')) {
      col.fields.add(new NumberField({ name: 'valor_meta' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    try {
      const f1 = col.fields.getByName('data_inicio')
      if (f1) col.fields.remove(f1)
    } catch (_) {}
    try {
      const f2 = col.fields.getByName('data_fim')
      if (f2) col.fields.remove(f2)
    } catch (_) {}
    try {
      const f3 = col.fields.getByName('valor_meta')
      if (f3) col.fields.remove(f3)
    } catch (_) {}

    app.save(col)
  },
)
