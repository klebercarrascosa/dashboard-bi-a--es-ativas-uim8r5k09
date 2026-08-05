migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    if (!col.fields.getByName('pagamento_mensal')) {
      col.fields.add(new BoolField({ name: 'pagamento_mensal' }))
    }

    if (!col.fields.getByName('pagamento_trimestral')) {
      col.fields.add(new BoolField({ name: 'pagamento_trimestral' }))
    }

    if (!col.fields.getByName('bonus_anual')) {
      col.fields.add(new BoolField({ name: 'bonus_anual' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    const pm = col.fields.getByName('pagamento_mensal')
    if (pm) col.fields.remove(pm)

    const pt = col.fields.getByName('pagamento_trimestral')
    if (pt) col.fields.remove(pt)

    const ba = col.fields.getByName('bonus_anual')
    if (ba) col.fields.remove(ba)

    app.save(col)
  },
)
