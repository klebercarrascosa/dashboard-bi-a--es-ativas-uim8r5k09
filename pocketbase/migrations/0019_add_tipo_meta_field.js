migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    if (!col.fields.getByName('tipo_meta')) {
      col.fields.add(
        new SelectField({
          name: 'tipo_meta',
          values: ['Geral', 'Por Cia'],
          maxSelect: 1,
        }),
      )
    }

    col.addIndex('idx_active_actions_executive', false, 'executive', '')

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('active_actions')

    const tipoMeta = col.fields.getByName('tipo_meta')
    if (tipoMeta) col.fields.remove(tipoMeta)

    col.removeIndex('idx_active_actions_executive')

    app.save(col)
  },
)
