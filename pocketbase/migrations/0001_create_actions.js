migrate(
  (app) => {
    const collection = new Collection({
      name: 'active_actions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'client_name', type: 'text', required: true },
        { name: 'cpf_cnpj', type: 'text' },
        { name: 'executive', type: 'text' },
        { name: 'regional', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Planejada', 'Em Negociação', 'Concluído', 'Em Risco', 'Pendente'],
          maxSelect: 1,
        },
        {
          name: 'priority',
          type: 'select',
          required: true,
          values: ['Alta', 'Média', 'Baixa'],
          maxSelect: 1,
        },
        { name: 'note', type: 'text' },
        { name: 'tab_month', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('active_actions')
    app.delete(collection)
  },
)
