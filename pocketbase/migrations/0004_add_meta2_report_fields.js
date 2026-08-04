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

    const meta2 = col.fields.getByName('meta_2')
    if (meta2) col.fields.remove(meta2)

    const intervalo = col.fields.getByName('intervalo_relatorio')
    if (intervalo) col.fields.remove(intervalo)

    const ultimoRel = col.fields.getByName('ultimo_relatorio')
    if (ultimoRel) col.fields.remove(ultimoRel)

    app.save(col)
  },
)
