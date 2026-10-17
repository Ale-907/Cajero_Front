function cargarOpcionesPago() {
  let select = document.getElementById('pago-compra');
  let anterior = select.value;
  select.textContent = '';
  let resumen = resumenCredito();
  agregarOpcion(select, 'minimo', 'Pago mínimo del periodo ' + (resumen.periodo || '—') + ' — ' + dinero(resumen.minimo));
  for (let i = 0; i < usuarioActual.compras.length; i++) {
    let compra = usuarioActual.compras[i];
    let cuota = primeraPendiente(compra);
    if (cuota !== null) agregarOpcion(select, compra.id, '#' + compra.id + ' · ' + compra.nombre + ' · cuota ' + cuota.numero + ' — ' + dinero(cuota.total));
  }
  if (anterior !== 'minimo' && anterior !== '' && buscarCompra(anterior) !== null && primeraPendiente(buscarCompra(anterior)) !== null) select.value = anterior;
}

function seleccionPago() {
  let elegido = document.getElementById('pago-compra').value;
  if (elegido === 'minimo') return cuotasDelPeriodo(resumenCredito().periodo);
  let compra = buscarCompra(elegido);
  if (compra === null || primeraPendiente(compra) === null) return [];
  return [{ compra: compra, cuota: primeraPendiente(compra) }];
}

function cambiarCategoriaPago() {
  let tarjeta = document.getElementById('categoria').value === 'tarjeta';
  document.getElementById('pago-tarjeta').hidden = !tarjeta;
  document.getElementById('pago-externo').hidden = tarjeta;
  document.getElementById('entidad').disabled = tarjeta;
  document.getElementById('referencia').disabled = tarjeta;
  document.getElementById('monto').readOnly = tarjeta;
  document.getElementById('monto').value = '';
  actualizarPago();
}

function actualizarPago() {
  let cuenta = document.getElementById('origen').value;
  let tarjeta = document.getElementById('categoria').value === 'tarjeta';
  let total = 0;
  let lineas = [];
  if (tarjeta) {
    let lista = seleccionPago();
    for (let i = 0; i < lista.length; i++) {
      let cuota = lista[i].cuota;
      total += cuota.total;
      lineas.push(lista[i].compra.nombre + ' · cuota ' + cuota.numero + ' · ' + fechaLegible(cuota.fecha) +
        ': capital ' + dinero(cuota.capital) + ' + interés ' + dinero(cuota.interes) + ' = ' + dinero(cuota.total));
    }
    if (lista.length === 0) lineas.push('No hay cuotas pendientes.');
    escribirResumen('lista-cuotas-pago', lineas);
    document.getElementById('monto').value = redondear(total).toFixed(2);
    mostrarTexto('ayuda-monto', 'Valor calculado con las cuotas elegidas. Para cambiarlo, selecciona otro producto o ajusta el plan en Tarjetas.');
  } else {
    total = Number(document.getElementById('monto').value);
    lineas.push('Pago simulado a una entidad externa.');
    lineas.push('Entidad: ' + (document.getElementById('entidad').value.trim() || 'por completar'));
    lineas.push('Referencia: ' + (document.getElementById('referencia').value.trim() || 'por completar'));
    mostrarTexto('ayuda-monto', 'Escribe el valor que aparece en la factura o el saldo que quieres recargar.');
  }
  total = redondear(total);
  lineas.push('Sale de: ' + nombreCuenta(cuenta) + ' · saldo actual: ' + dinero(usuarioActual[cuenta]));
  lineas.push('Total a pagar: ' + dinero(total));
  lineas.push('Saldo después del pago: ' + dinero(usuarioActual[cuenta] - total));
  if (total > usuarioActual[cuenta]) lineas.push('Saldo insuficiente. Elige otra cuenta o consigna dinero.');
  escribirResumen('resumen-pago', lineas);
  document.getElementById('btn-pagar').disabled = !Number.isFinite(total) || total <= 0 || total > usuarioActual[cuenta];
}

function pagar(evento) {
  evento.preventDefault();
  let cuenta = document.getElementById('origen').value;
  let categoria = document.getElementById('categoria').value;
  let total = 0;
  let descripcion = '';
  let lista = [];
  if (categoria === 'tarjeta') {
    lista = seleccionPago();
    if (lista.length === 0) return alert('No hay cuotas pendientes para esa selección.');
    for (let i = 0; i < lista.length; i++) {
      total += lista[i].cuota.total;
      descripcion += lista[i].compra.nombre + ' · cuota ' + lista[i].cuota.numero + ': ' + dinero(lista[i].cuota.total) + '\n';
    }
  } else {
    total = Number(document.getElementById('monto').value);
    let entidad = document.getElementById('entidad').value.trim();
    let referencia = document.getElementById('referencia').value.trim();
    if (entidad === '' || referencia === '') return alert('Completa la entidad y la referencia.');
    if (categoria === 'recarga' && !/^\d{10}$/.test(referencia)) return alert('Para una recarga escribe un celular de 10 números en la referencia.');
    descripcion = entidad + ' · referencia: ' + referencia;
  }
  if (!montoValido(total)) return;
  total = redondear(total);
  if (!haySaldo(cuenta, total)) return;
  if (!confirm('Pagar desde ' + nombreCuenta(cuenta) + ':\n' + descripcion + '\nTotal: ' + dinero(total))) return;
  if (categoria === 'tarjeta') {
    if (!aplicarPagoCuotas(cuenta, lista)) return;
  } else {
    usuarioActual[cuenta] = redondear(usuarioActual[cuenta] - total);
    registrarMovimiento('Pago de ' + categoria + ': ' + descripcion, cuenta, -total);
    guardarUsuarios();
    document.getElementById('monto').value = '';
  }
  mostrarMensaje('mensaje-pago', 'Pago registrado: ' + descripcion + ' · total: ' + dinero(total) + '. Puedes verlo en Movimientos.');
  llenarCuentas('origen');
  cargarOpcionesPago();
  mostrarResumenCredito();
  actualizarPago();
}

if (usuarioActual !== null) {
  llenarCuentas('origen');
  cargarOpcionesPago();
  let parametros = new URLSearchParams(window.location.search);
  let id = parametros.get('compra');
  if (id !== null && buscarCompra(id) !== null && primeraPendiente(buscarCompra(id)) !== null) document.getElementById('pago-compra').value = id;
  mostrarResumenCredito();
  cambiarCategoriaPago();
}
