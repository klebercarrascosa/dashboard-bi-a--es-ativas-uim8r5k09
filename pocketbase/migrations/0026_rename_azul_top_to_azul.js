migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    if (col.fields.getByName('condicao')) {
      col.fields.removeByName('condicao')
    }

    col.fields.add(
      new SelectField({
        name: 'condicao',
        values: ['GOL', 'LATAM', 'AZUL', 'RC'],
        maxSelect: 4,
      }),
    )

    app.save(col)

    app
      .db()
      .newQuery(
        "UPDATE active_actions SET condicao = REPLACE(condicao, 'AZUL TOP', 'AZUL') WHERE condicao LIKE '%AZUL TOP%'",
      )
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    if (col.fields.getByName('condicao')) {
      col.fields.removeByName('condicao')
    }

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
        "UPDATE active_actions SET condicao = REPLACE(condicao, 'AZUL', 'AZUL TOP') WHERE condicao LIKE '%AZUL%' AND condicao NOT LIKE '%AZUL TOP%'",
      )
      .execute()
  },
)
