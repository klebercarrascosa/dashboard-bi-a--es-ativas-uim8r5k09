migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    const executives = [
      {
        username: 'PAULAPEXE',
        name: 'PAULA CAROLINA PEXE',
        executive_name: 'PAULA',
        email: 'paula.pexe@local.dev',
        oldEmail: 'paulapexe@executivo.com',
      },
      {
        username: 'ANDRENORONHA',
        name: 'ANDREA FERNANDA COQUEIRO NORONHA',
        executive_name: 'ANDREA',
        email: 'andrea.noronha@local.dev',
        oldEmail: 'andrenoronha@executivo.com',
      },
      {
        username: 'NATALIASANTOS',
        name: 'NATALIA RODRIGUES DOS SANTOS',
        executive_name: 'NATALIA',
        email: 'natalia.santos@local.dev',
        oldEmail: 'nataliasantos@executivo.com',
      },
      {
        username: 'ALESSANDRAKOTI',
        name: 'ALESSANDRA GRAZIELLA KOTI PARISE SOUZA',
        executive_name: 'ALESSANDRA',
        email: 'alessandra.koti@local.dev',
        oldEmail: 'alessandrakoti@executivo.com',
      },
      {
        username: 'DANIELIMEIRELES',
        name: 'DANIELI CHRISTINA PEREZ',
        executive_name: 'DANIELI',
        email: 'danieli.meireles@local.dev',
        oldEmail: 'danielimeireles@executivo.com',
      },
    ]

    for (const exec of executives) {
      var record = null

      try {
        record = app.findFirstRecordByData('_pb_users_auth_', 'username', exec.username)
      } catch (_) {}

      if (!record) {
        try {
          record = app.findAuthRecordByEmail('_pb_users_auth_', exec.oldEmail)
        } catch (_) {}
      }

      if (record) {
        record.setEmail(exec.email)
        record.setPassword('Skip@Pass')
        record.set('username', exec.username)
        record.set('name', exec.name)
        record.set('executive_name', exec.executive_name)
        record.set('role', 'executive')
        record.setVerified(true)
        app.save(record)
      } else {
        var newRecord = new Record(usersCol)
        newRecord.setEmail(exec.email)
        newRecord.setPassword('Skip@Pass')
        newRecord.setVerified(true)
        newRecord.set('username', exec.username)
        newRecord.set('name', exec.name)
        newRecord.set('executive_name', exec.executive_name)
        newRecord.set('role', 'executive')
        app.save(newRecord)
      }
    }
  },
  (app) => {
    var revert = [
      {
        username: 'PAULAPEXE',
        executive_name: 'PAULAPEXE',
        email: 'paulapexe@executivo.com',
      },
      {
        username: 'ANDRENORONHA',
        executive_name: 'ANDRENORONHA',
        email: 'andrenoronha@executivo.com',
      },
      {
        username: 'NATALIASANTOS',
        executive_name: 'NATALIASANTOS',
        email: 'nataliasantos@executivo.com',
      },
      {
        username: 'ALESSANDRAKOTI',
        executive_name: 'ALESSANDRAKOTI',
        email: 'alessandrakoti@executivo.com',
      },
      {
        username: 'DANIELIMEIRELES',
        executive_name: 'DANIELIMEIRELES',
        email: 'danielimeireles@executivo.com',
      },
    ]

    for (var i = 0; i < revert.length; i++) {
      var exec = revert[i]
      try {
        var record = app.findFirstRecordByData('_pb_users_auth_', 'username', exec.username)
        record.setEmail(exec.email)
        record.set('executive_name', exec.executive_name)
        app.save(record)
      } catch (_) {}
    }
  },
)
