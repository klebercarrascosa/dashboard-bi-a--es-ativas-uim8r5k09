migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    const executives = [
      {
        name: 'PAULA CAROLINA PEXE',
        executive_name: 'PAULAPEXE',
        email: 'paulapexe@executivo.com',
      },
      {
        name: 'ANDREA FERNANDA COQUEIRO NORONHA',
        executive_name: 'ANDRENORONHA',
        email: 'andrenoronha@executivo.com',
      },
      {
        name: 'NATALIA RODRIGUES DOS SANTOS',
        executive_name: 'NATALIASANTOS',
        email: 'nataliasantos@executivo.com',
      },
      {
        name: 'ALESSANDRA GRAZIELLA KOTI PARISE SOUZA',
        executive_name: 'ALESSANDRAKOTI',
        email: 'alessandrakoti@executivo.com',
      },
      {
        name: 'DANIELI CHRISTINA PEREZ',
        executive_name: 'DANIELIMEIRELES',
        email: 'danielimeireles@executivo.com',
      },
    ]

    for (const exec of executives) {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', exec.email)
      } catch (_) {
        const record = new Record(usersCol)
        record.setEmail(exec.email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', exec.name)
        record.set('executive_name', exec.executive_name)
        record.set('role', 'executive')
        app.save(record)
      }
    }
  },
  (app) => {
    const emails = [
      'paulapexe@executivo.com',
      'andrenoronha@executivo.com',
      'nataliasantos@executivo.com',
      'alessandrakoti@executivo.com',
      'danielimeireles@executivo.com',
    ]
    for (const email of emails) {
      try {
        const record = app.findAuthRecordByEmail('_pb_users_auth_', email)
        app.delete(record)
      } catch (_) {}
    }
  },
)
