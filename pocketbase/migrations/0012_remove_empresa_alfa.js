migrate(
  (app) => {
    try {
      const records = app.findRecordsByFilter(
        'active_actions',
        "client_name = 'Empresa Alfa Ltda'",
        '-created',
        1000,
        0,
      )
      for (const r of records) {
        app.delete(r)
      }
    } catch (_) {}
  },
  (app) => {},
)
