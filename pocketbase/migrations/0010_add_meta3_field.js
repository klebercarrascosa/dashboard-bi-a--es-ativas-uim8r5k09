migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    if (!col.fields.getByName('meta_3')) {
      col.fields.add(new NumberField({ name: 'meta_3' }))
    }

    col.addIndex('idx_active_actions_data_inicio', false, 'data_inicio', '')
    col.addIndex('idx_active_actions_data_fim', false, 'data_fim', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    const meta3 = col.fields.getByName('meta_3')
    if (meta3) col.fields.remove(meta3)

    col.removeIndex('idx_active_actions_data_inicio')
    col.removeIndex('idx_active_actions_data_fim')

    app.save(col)
  },
)
