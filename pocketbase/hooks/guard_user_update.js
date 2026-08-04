onRecordUpdateRequest((e) => {
  const body = e.requestInfo().body || {}
  if (!e.hasSuperuserAuth()) {
    const isAdmin = e.auth && e.auth.getString('role') === 'admin'
    if (!isAdmin) {
      if (body.role !== undefined) {
        return e.forbiddenError('Apenas administradores podem alterar o papel do usuário.')
      }
      if (body.executive_name !== undefined) {
        return e.forbiddenError('Apenas administradores podem alterar o nome do executivo.')
      }
    }
  }
  e.next()
}, 'users')
