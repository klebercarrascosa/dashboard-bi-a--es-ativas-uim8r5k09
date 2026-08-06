migrate(
  (app) => {
    var fakeNames = [
      'Aero GOL Viagens Ltda',
      'GOL Cargo Transportes ME',
      'LATAM Travel Solutions S.A.',
      'LATAM Cargo Logística Ltda',
      'AZUL Top Turismo Eireli',
      'Azul Top Conect Aviation ME',
      'Empresa Alfa Ltda',
      'Construtora Beta S.A.',
      'Comércio Gamma ME',
      'Tech Delta LLC',
      'Indústria Epsilon',
      'Serviços Zeta Ltda',
    ]

    for (var i = 0; i < fakeNames.length; i++) {
      try {
        var record = app.findFirstRecordByData('active_actions', 'client_name', fakeNames[i])
        app.delete(record)
      } catch (_) {}
    }
  },
  (app) => {},
)
