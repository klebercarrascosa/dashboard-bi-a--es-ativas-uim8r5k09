migrate(
  (app) => {
    try {
      const records = app.findRecordsByFilter(
        'active_actions',
        "condicao != ''",
        '-created',
        10000,
        0,
      )
      for (const r of records) {
        r.set('condicao', '')
        app.save(r)
      }
    } catch (_) {}
  },
  (app) => {},
)
