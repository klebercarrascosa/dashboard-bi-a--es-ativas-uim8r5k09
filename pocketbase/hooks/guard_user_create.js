onRecordCreateRequest((e) => {
  const body = e.requestInfo().body || {}
  if (body.role === 'admin') {
    if (e.hasSuperuserAuth()) {
      e.next()
      return
    }
    const isAdmin = e.auth && e.auth.getString('role') === 'admin'
    if (!isAdmin) {
      return e.forbiddenError('Apenas administradores podem criar contas administrador.')
    }
  }
  e.next()
}, 'users')
