migrate(
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

    app.save(col)

    app
      .db()
      .newQuery(
        "UPDATE active_actions SET tipo_meta = '[\"' || tipo_meta || '\"]' WHERE tipo_meta IS NOT NULL AND tipo_meta != '' AND tipo_meta NOT LIKE '[%'",
      )
      .execute()
  },
  (app) => {
    app
      .db()
      .newQuery(
        "UPDATE active_actions SET tipo_meta = json_extract(tipo_meta, '$[0]') WHERE tipo_meta LIKE '[%'",
      )
      .execute()

    const col = app.findCollectionByNameOrId('active_actions')

    try {
      col.fields.removeByName('tipo_meta')
    } catch (_) {}

    col.fields.add(
      new SelectField({
        name: 'tipo_meta',
        values: ['Geral', 'Por Cia'],
        maxSelect: 1,
      }),
    )

    app.save(col)
  },
)
