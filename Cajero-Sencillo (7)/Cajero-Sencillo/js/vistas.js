// Ayudas de presentación para los formularios de tarjeta, pagos y transferencias.
function agregarOpcion(select, valor, texto) {
  let opcion = document.createElement('option');
  opcion.value = valor;
  opcion.textContent = texto;
  select.appendChild(opcion);
}

function nombreCuenta(cuenta) {
  if (cuenta === 'ahorros') return 'Ahorros • 1234';
  return 'Corriente • 5678';
}

function llenarCuentas(id) {
  let select = document.getElementById(id);
  let anterior = select.value;
  select.textContent = '';
  agregarOpcion(select, 'ahorros', nombreCuenta('ahorros') + ' — saldo: ' + dinero(usuarioActual.ahorros));
  agregarOpcion(select, 'corriente', nombreCuenta('corriente') + ' — saldo: ' + dinero(usuarioActual.corriente));
  if (anterior !== '') select.value = anterior;
}

function mostrarMensaje(id, texto) {
  let elemento = document.getElementById(id);
  elemento.hidden = false;
  elemento.textContent = texto;
}

function mostrarResumenCredito() {
  let resumen = resumenCredito();
  mostrarTexto('credito-capital', dinero(resumen.capital));
  mostrarTexto('credito-minimo', dinero(resumen.minimo));
  mostrarTexto('credito-total', dinero(resumen.total));
  mostrarTexto('credito-intereses', 'Intereses de las cuotas pendientes: ' + dinero(resumen.intereses));
  mostrarTexto('credito-cupo', 'Cupo libre: ' + dinero(usuarioActual.cupo - resumen.capital));
  let texto = 'No tienes cuotas pendientes.';
  if (resumen.fecha !== '') texto = 'Periodo: ' + resumen.periodo + ' · fecha programada: ' + fechaLegible(resumen.fecha);
  mostrarTexto('credito-periodo', texto);
}

function dibujarPlan(id, cuotas) {
  let tabla = document.getElementById(id);
  tabla.textContent = '';
  for (let i = 0; i < cuotas.length; i++) {
    let cuota = cuotas[i];
    let fila = document.createElement('tr');
    agregarCelda(fila, cuota.numero);
    agregarCelda(fila, fechaLegible(cuota.fecha));
    agregarCelda(fila, dinero(cuota.capital));
    agregarCelda(fila, dinero(cuota.interes) + ' (' + redondear(cuota.tasa * 100) + '%)');
    agregarCelda(fila, dinero(cuota.total));
    agregarCelda(fila, dinero(cuota.saldo));
    let estado = document.createElement('td');
    let etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta-estado pendiente';
    etiqueta.textContent = 'Pendiente';
    if (cuota.pagada) {
      etiqueta.className = 'etiqueta-estado pagada';
      etiqueta.textContent = 'Pagada';
      etiqueta.title = cuota.fechaPago;
    }
    estado.appendChild(etiqueta);
    if (cuota.pagada) {
      let fechaPago = document.createElement('small');
      fechaPago.className = 'estado-fecha';
      fechaPago.textContent = cuota.fechaPago;
      estado.appendChild(fechaPago);
    }
    fila.appendChild(estado);
    tabla.appendChild(fila);
  }
}

function cantidadValida(cantidad, capital) {
  return Number.isInteger(cantidad) && cantidad >= 1 && cantidad <= 36 && capital >= cantidad * 0.01;
}

function escribirResumen(id, lineas) {
  let caja = document.getElementById(id);
  caja.textContent = '';
  for (let i = 0; i < lineas.length; i++) {
    let parrafo = document.createElement('p');
    parrafo.textContent = lineas[i];
    caja.appendChild(parrafo);
  }
}
