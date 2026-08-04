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

    const dataInicio = col.fields.getByName('data_inicio')
    if (dataInicio) col.fields.remove(dataInicio)

    const dataFim = col.fields.getByName('data_fim')
    if (dataFim) col.fields.remove(dataFim)

    const valorMeta = col.fields.getByName('valor_meta')
    if (valorMeta) col.fields.remove(valorMeta)

    app.save(col)
  },
)
