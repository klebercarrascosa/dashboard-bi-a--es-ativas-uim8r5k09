migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'executive'],
          maxSelect: 1,
        }),
      )
    }

    if (!usersCol.fields.getByName('executive_name')) {
      usersCol.fields.add(
        new TextField({
          name: 'executive_name',
        }),
      )
    }

    app.save(usersCol)

    try {
      const adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'kleber.carrascosa@gmail.com')
      adminUser.set('role', 'admin')
      app.save(adminUser)
    } catch (_) {}

    const actionsCol = app.findCollectionByNameOrId('active_actions')
    const roleFilter =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || executive = @request.auth.executive_name)"
    actionsCol.listRule = roleFilter
    actionsCol.viewRule = roleFilter
    actionsCol.createRule = roleFilter
    actionsCol.updateRule = roleFilter
    actionsCol.deleteRule = roleFilter
    app.save(actionsCol)
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      usersCol.fields.removeByName('role')
    } catch (_) {}
    try {
      usersCol.fields.removeByName('executive_name')
    } catch (_) {}
    app.save(usersCol)

    const actionsCol = app.findCollectionByNameOrId('active_actions')
    const originalRule = "@request.auth.id != ''"
    actionsCol.listRule = originalRule
    actionsCol.viewRule = originalRule
    actionsCol.createRule = originalRule
    actionsCol.updateRule = originalRule
    actionsCol.deleteRule = originalRule
    app.save(actionsCol)
  },
)
