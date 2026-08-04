migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    if (!col.fields.getByName('meta_2')) {
      col.fields.add(new NumberField({ name: 'meta_2' }))
    }

    if (!col.fields.getByName('intervalo_relatorio')) {
      col.fields.add(
        new SelectField({
          name: 'intervalo_relatorio',
          values: ['15 dias', '30 dias'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('ultimo_relatorio')) {
      col.fields.add(new DateField({ name: 'ultimo_relatorio' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    try {
      const f1 = col.fields.getByName('meta_2')
      if (f1) col.fields.remove(f1)
    } catch (_) {}
    try {
      const f2 = col.fields.getByName('intervalo_relatorio')
      if (f2) col.fields.remove(f2)
    } catch (_) {}
    try {
      const f3 = col.fields.getByName('ultimo_relatorio')
      if (f3) col.fields.remove(f3)
    } catch (_) {}

    app.save(col)
  },
)
