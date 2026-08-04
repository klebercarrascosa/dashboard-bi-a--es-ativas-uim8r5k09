migrate(
  (app) => {
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'kleber.carrascosa@gmail.com')
      return
    } catch (_) {}

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const record = new Record(users)
    record.setEmail('kleber.carrascosa@gmail.com')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Admin')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'kleber.carrascosa@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
