function cambiarDestino() {
  let tipo = document.getElementById('tipo-transferencia').value;
  let propia = tipo === 'propia';
  let cuenta = document.getElementById('origen').value;
  document.getElementById('destino-propio').hidden = !propia;
  document.getElementById('destino-externo').hidden = propia;
  document.getElementById('datos-banco').hidden = tipo !== 'banco';
  document.getElementById('destinatario').disabled = propia;
  document.getElementById('numero-destino').disabled = propia;
  document.getElementById('numero-destino').placeholder = tipo === 'celular' ? 'Celular de 10 números' : 'Número de cuenta, entre 6 y 20 números';
  let destino = document.getElementById('destino');
  destino.textContent = '';
  let otra = 'corriente';
  if (cuenta === 'corriente') otra = 'ahorros';
  agregarOpcion(destino, otra, nombreCuenta(otra) + ' — saldo: ' + dinero(usuarioActual[otra]));
  resumirTransferencia();
}

function resumirTransferencia() {
  let cuenta = document.getElementById('origen').value;
  let tipo = document.getElementById('tipo-transferencia').value;
  let monto = Number(document.getElementById('monto').value);
  let lineas = ['Sale de: ' + nombreCuenta(cuenta) + ' · saldo: ' + dinero(usuarioActual[cuenta])];
  if (tipo === 'propia') {
    let destino = document.getElementById('destino').value;
    lineas.push('Llega a: ' + nombreCuenta(destino));
    lineas.push('Saldo del destino después: ' + dinero(usuarioActual[destino] + monto));
  } else {
    lineas.push('Destinatario: ' + (document.getElementById('destinatario').value.trim() || 'por completar'));
    lineas.push('Cuenta o celular: ' + (document.getElementById('numero-destino').value.trim() || 'por completar'));
    if (tipo === 'banco') lineas.push('Banco: ' + document.getElementById('banco').value);
  }
  lineas.push('Valor a enviar: ' + dinero(monto));
  lineas.push('Saldo de origen después: ' + dinero(usuarioActual[cuenta] - monto));
  if (monto > usuarioActual[cuenta]) lineas.push('Saldo insuficiente.');
  escribirResumen('resumen-transferencia', lineas);
  document.getElementById('btn-transferir').disabled = !Number.isFinite(monto) || monto <= 0 || monto > usuarioActual[cuenta];
}

function transferir(evento) {
  evento.preventDefault();
  let origen = document.getElementById('origen').value;
  let destino = document.getElementById('destino').value;
  let tipo = document.getElementById('tipo-transferencia').value;
  let monto = Number(document.getElementById('monto').value);
  if (!montoValido(monto)) return;
  monto = redondear(monto);
  if (!haySaldo(origen, monto)) return;
  let nombreDestino = nombreCuenta(destino);
  if (tipo !== 'propia') {
    let nombre = document.getElementById('destinatario').value.trim();
    let numero = document.getElementById('numero-destino').value.trim();
    if (nombre === '') return alert('Escribe el nombre del destinatario.');
    if (tipo === 'celular' && !/^\d{10}$/.test(numero)) return alert('El celular debe tener 10 números.');
    if (tipo === 'banco' && !/^\d{6,20}$/.test(numero)) return alert('La cuenta debe tener entre 6 y 20 números.');
    nombreDestino = nombre + ' · ' + numero;
    if (tipo === 'banco') nombreDestino += ' · ' + document.getElementById('banco').value;
  } else if (origen === destino) return alert('Selecciona una cuenta de destino distinta.');
  if (!confirm('Enviar ' + dinero(monto) + '\nDesde: ' + nombreCuenta(origen) + '\nA: ' + nombreDestino + '\nComisión: $0 COP')) return;
  usuarioActual[origen] = redondear(usuarioActual[origen] - monto);
  registrarMovimiento('Transferencia a ' + nombreDestino, origen, -monto);
  if (tipo === 'propia') {
    usuarioActual[destino] = redondear(usuarioActual[destino] + monto);
    registrarMovimiento('Transferencia recibida desde ' + nombreCuenta(origen), destino, monto);
  }
  guardarUsuarios();
  mostrarMensaje('mensaje-transferencia', 'Transferencia registrada: ' + dinero(monto) + ' de ' + nombreCuenta(origen) + ' a ' + nombreDestino + '.');
  document.getElementById('monto').value = '';
  llenarCuentas('origen');
  cambiarDestino();
}

if (usuarioActual !== null) {
  llenarCuentas('origen');
  cambiarDestino();
}
