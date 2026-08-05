migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    if (!col.fields.getByName('condicao')) {
      col.fields.add(
        new SelectField({
          name: 'condicao',
          values: ['GOL', 'LATAM', 'AZUL TOP'],
          maxSelect: 1,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    const field = col.fields.getByName('condicao')
    if (field) col.fields.remove(field)

    app.save(col)
  },
)
