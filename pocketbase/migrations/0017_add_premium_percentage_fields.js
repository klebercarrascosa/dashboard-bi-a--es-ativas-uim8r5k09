migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    if (!col.fields.getByName('premio_meta_1')) {
      col.fields.add(new NumberField({ name: 'premio_meta_1', min: 0, max: 100 }))
    }
    if (!col.fields.getByName('premio_meta_2')) {
      col.fields.add(new NumberField({ name: 'premio_meta_2', min: 0, max: 100 }))
    }
    if (!col.fields.getByName('premio_meta_3')) {
      col.fields.add(new NumberField({ name: 'premio_meta_3', min: 0, max: 100 }))
    }
    if (!col.fields.getByName('valor_vendido')) {
      col.fields.add(new NumberField({ name: 'valor_vendido', min: 0 }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    for (const fieldName of ['premio_meta_1', 'premio_meta_2', 'premio_meta_3', 'valor_vendido']) {
      const field = col.fields.getByName(fieldName)
      if (field) col.fields.remove(field)
    }

    app.save(col)
  },
)
