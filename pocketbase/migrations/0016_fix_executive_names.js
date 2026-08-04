migrate(
  (app) => {
    const executives = [
      {
        email: 'paula.pexe@local.dev',
        executive_name: 'PAULA CAROLINA PEXE',
      },
      {
        email: 'andrea.noronha@local.dev',
        executive_name: 'ANDREA FERNANDA COQUEIRO NORONHA',
      },
      {
        email: 'natalia.santos@local.dev',
        executive_name: 'NATALIA RODRIGUES DOS SANTOS',
      },
      {
        email: 'alessandra.koti@local.dev',
        executive_name: 'ALESSANDRA GRAZIELLA KOTI PARISE SOUZA',
      },
      {
        email: 'danieli.meireles@local.dev',
        executive_name: 'DANIELI CHRISTINA PEREZ',
      },
    ]

    for (const exec of executives) {
      try {
        const record = app.findAuthRecordByEmail('_pb_users_auth_', exec.email)
        record.set('executive_name', exec.executive_name)
        app.save(record)
      } catch (_) {}
    }
  },
  (app) => {
    const revert = [
      {
        email: 'paula.pexe@local.dev',
        executive_name: 'PAULA',
      },
      {
        email: 'andrea.noronha@local.dev',
        executive_name: 'ANDREA',
      },
      {
        email: 'natalia.santos@local.dev',
        executive_name: 'NATALIA',
      },
      {
        email: 'alessandra.koti@local.dev',
        executive_name: 'ALESSANDRA',
      },
      {
        email: 'danieli.meireles@local.dev',
        executive_name: 'DANIELI',
      },
    ]

    for (const exec of revert) {
      try {
        const record = app.findAuthRecordByEmail('_pb_users_auth_', exec.email)
        record.set('executive_name', exec.executive_name)
        app.save(record)
      } catch (_) {}
    }
  },
)
