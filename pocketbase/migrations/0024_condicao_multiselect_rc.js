migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    try {
      col.fields.removeByName('condicao')
    } catch (_) {}

    col.fields.add(
      new SelectField({
        name: 'condicao',
        values: ['GOL', 'LATAM', 'AZUL TOP', 'RC'],
        maxSelect: 4,
      }),
    )

    app.save(col)

    app
      .db()
      .newQuery(
        "UPDATE active_actions SET condicao = '[\"' || condicao || '\"]' WHERE condicao IS NOT NULL AND condicao != '' AND condicao NOT LIKE '[%'",
      )
      .execute()
  },
  (app) => {
    app
      .db()
      .newQuery(
        "UPDATE active_actions SET condicao = json_extract(condicao, '$[0]') WHERE condicao LIKE '[%'",
      )
      .execute()

    const col = app.findCollectionByNameOrId('active_actions')

    try {
      col.fields.removeByName('condicao')
    } catch (_) {}

    col.fields.add(
      new SelectField({
        name: 'condicao',
        values: ['GOL', 'LATAM', 'AZUL TOP'],
        maxSelect: 1,
      }),
    )

    app.save(col)
  },
)
