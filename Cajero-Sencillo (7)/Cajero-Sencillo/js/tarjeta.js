function resumenPlan(plan) {
  let total = 0;
  let intereses = 0;
  for (let i = 0; i < plan.length; i++) {
    total += plan[i].total;
    intereses += plan[i].interes;
  }
  return 'Primera cuota: ' + dinero(plan[0].total) + ' · tasa mensual: ' +
    redondear(plan[0].tasa * 100) + '% · intereses del plan: ' + dinero(redondear(intereses)) +
    ' · total del plan: ' + dinero(redondear(total));
}

function previsualizarCompra() {
  let monto = Number(document.getElementById('compra-monto').value);
  let cantidad = Number(document.getElementById('compra-cuotas').value);
  if (!Number.isFinite(monto) || !cantidadValida(cantidad, monto)) {
    mostrarTexto('vista-compra', 'Escribe un precio válido y de 1 a 36 cuotas.');
    return;
  }
  let plan = crearPlan(redondear(monto), cantidad, fechaPrimeraCuota(), 1);
  mostrarTexto('vista-compra', resumenPlan(plan));
}

function comprar(evento) {
  evento.preventDefault();
  let nombre = document.getElementById('compra-nombre').value.trim();
  let monto = Number(document.getElementById('compra-monto').value);
  let cantidad = Number(document.getElementById('compra-cuotas').value);
  if (nombre === '') return alert('Escribe el nombre del producto que compraste.');
  if (!montoValido(monto)) return;
  monto = redondear(monto);
  if (!cantidadValida(cantidad, monto)) return alert('Selecciona entre 1 y 36 cuotas válidas.');
  if (monto > redondear(usuarioActual.cupo - usuarioActual.deuda)) return alert('Cupo insuficiente.');
  let compra = {
    id: usuarioActual.siguienteCompra,
    nombre: nombre, montoOriginal: monto,
    cuotas: crearPlan(monto, cantidad, fechaPrimeraCuota(), 1)
  };
  usuarioActual.siguienteCompra++;
  usuarioActual.compras.push(compra);
  sincronizarDeuda();
  registrarMovimiento('Compra: ' + nombre + ' a ' + cantidad + ' cuotas', 'tarjeta', monto);
  guardarUsuarios();
  document.getElementById('compra-nombre').value = '';
  document.getElementById('compra-monto').value = '';
  actualizarTarjeta();
  document.getElementById('detalle-compra').value = String(compra.id);
  verPlan();
  mostrarMensaje('mensaje-tarjeta', nombre + ' agregado. Ya puedes revisar sus cuotas y pagarlo.');
}

function previsualizarAjuste() {
  let compra = buscarCompra(document.getElementById('ajuste-compra').value);
  if (compra === null || primeraPendiente(compra) === null) {
    mostrarTexto('vista-ajuste', 'No hay productos pendientes de pago.');
    document.getElementById('btn-ajustar').disabled = true;
    return;
  }
  let cantidad = Number(document.getElementById('ajuste-cuotas').value);
  let capital = capitalPendiente(compra);
  if (!cantidadValida(cantidad, capital)) {
    mostrarTexto('vista-ajuste', 'Elige entre 1 y 36 cuotas para el saldo pendiente.');
    document.getElementById('btn-ajustar').disabled = true;
    return;
  }
  let proxima = primeraPendiente(compra);
  let plan = crearPlan(capital, cantidad, proxima.fecha, proxima.numero);
  mostrarTexto('vista-ajuste', compra.nombre + ' · capital pendiente: ' + dinero(capital) +
    ' · nuevo plazo: ' + cantidad + ' cuotas. ' + resumenPlan(plan));
  document.getElementById('btn-ajustar').disabled = false;
}

function ajustarCuotas(evento) {
  evento.preventDefault();
  let compra = buscarCompra(document.getElementById('ajuste-compra').value);
  if (compra === null || primeraPendiente(compra) === null) return;
  let cantidad = Number(document.getElementById('ajuste-cuotas').value);
  let capital = capitalPendiente(compra);
  if (!cantidadValida(cantidad, capital)) return alert('Plazo inválido.');
  let proxima = primeraPendiente(compra);
  let nuevas = crearPlan(capital, cantidad, proxima.fecha, proxima.numero);
  if (!confirm('Cambiar el plan de ' + compra.nombre + ' a ' + cantidad + ' cuotas pendientes.\n' + resumenPlan(nuevas))) return;
  let pagadas = [];
  for (let i = 0; i < compra.cuotas.length; i++) {
    if (compra.cuotas[i].pagada) pagadas.push(compra.cuotas[i]);
  }
  compra.cuotas = pagadas.concat(nuevas);
  guardarUsuarios();
  actualizarTarjeta();
  document.getElementById('detalle-compra').value = String(compra.id);
  verPlan();
  mostrarMensaje('mensaje-tarjeta', 'Plan actualizado. Se conservaron las cuotas pagadas y el capital pendiente.');
}

function verPlan() {
  let compra = buscarCompra(document.getElementById('detalle-compra').value);
  if (compra === null) {
    mostrarTexto('detalle-resumen', 'Primero agrega un producto.');
    document.getElementById('plan-cuotas').textContent = '';
    return;
  }
  let pagadas = 0;
  for (let i = 0; i < compra.cuotas.length; i++) if (compra.cuotas[i].pagada) pagadas++;
  mostrarTexto('detalle-resumen', compra.nombre + ' · ' + pagadas + ' cuotas pagadas de ' + compra.cuotas.length +
    ' · capital pendiente: ' + dinero(capitalPendiente(compra)));
  dibujarPlan('plan-cuotas', compra.cuotas);
}

function actualizarTarjeta() {
  mostrarResumenCredito();
  let detalle = document.getElementById('detalle-compra');
  let ajuste = document.getElementById('ajuste-compra');
  let anterior = detalle.value;
  let ajusteAnterior = ajuste.value;
  detalle.textContent = '';
  ajuste.textContent = '';
  let lista = document.getElementById('lista-compras');
  lista.textContent = '';
  if (usuarioActual.compras.length === 0) lista.textContent = 'Aún no tienes productos. Crea el primero en el formulario de arriba.';
  for (let i = 0; i < usuarioActual.compras.length; i++) {
    let compra = usuarioActual.compras[i];
    agregarOpcion(detalle, compra.id, '#' + compra.id + ' · ' + compra.nombre);
    let proxima = primeraPendiente(compra);
    if (proxima !== null) agregarOpcion(ajuste, compra.id, '#' + compra.id + ' · ' + compra.nombre);
    let caja = document.createElement('article');
    caja.className = 'producto-compra';
    let titulo = document.createElement('h3');
    titulo.textContent = '#' + compra.id + ' · ' + compra.nombre;
    caja.appendChild(titulo);
    let texto = document.createElement('p');
    if (proxima === null) {
      texto.textContent = 'Producto pagado completamente.';
      texto.className = 'estado-pagado';
    } else {
      texto.textContent = 'Capital pendiente: ' + dinero(capitalPendiente(compra)) +
        ' · próxima cuota: ' + proxima.numero + '/' + compra.cuotas.length +
        ' · fecha: ' + fechaLegible(proxima.fecha) + ' · total: ' + dinero(proxima.total) +
        ' (capital: ' + dinero(proxima.capital) + ' + interés: ' + dinero(proxima.interes) + ').';
    }
    caja.appendChild(texto);
    if (proxima !== null) {
      let enlace = document.createElement('a');
      enlace.href = 'pagos.html?compra=' + compra.id;
      enlace.className = 'btn btn-outline btn-sm';
      enlace.textContent = 'Pagar próxima cuota de este producto';
      caja.appendChild(enlace);
    }
    lista.appendChild(caja);
  }
  if (anterior !== '' && buscarCompra(anterior) !== null) detalle.value = anterior;
  if (ajusteAnterior !== '' && buscarCompra(ajusteAnterior) !== null && primeraPendiente(buscarCompra(ajusteAnterior)) !== null) ajuste.value = ajusteAnterior;
  previsualizarCompra();
  previsualizarAjuste();
  verPlan();
}

if (usuarioActual !== null) {
  actualizarTarjeta();
  let titulares = document.getElementsByClassName('txt-titular-tarjeta');
  for (let i = 0; i < titulares.length; i++) titulares[i].textContent = usuarioActual.nombre;
}
