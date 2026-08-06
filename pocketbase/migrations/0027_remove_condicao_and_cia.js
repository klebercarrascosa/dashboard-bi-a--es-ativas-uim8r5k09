migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    app.db().newQuery("UPDATE active_actions SET tipo_meta = 'Geral'").execute()

    try {
      col.fields.removeByName('condicao')
    } catch (_) {}

    try {
      col.fields.removeByName('tipo_meta')
    } catch (_) {}

    col.fields.add(
      new SelectField({
        name: 'tipo_meta',
        values: ['Geral'],
        maxSelect: 1,
      }),
    )

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    try {
      col.fields.removeByName('tipo_meta')
    } catch (_) {}

    col.fields.add(
      new SelectField({
        name: 'tipo_meta',
        values: ['Geral', 'Por Cia'],
        maxSelect: 2,
      }),
    )

    col.fields.add(
      new SelectField({
        name: 'condicao',
        values: ['GOL', 'LATAM', 'AZUL', 'RC'],
        maxSelect: 4,
      }),
    )

    app.save(col)
  },
)
