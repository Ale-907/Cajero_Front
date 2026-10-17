// MODELO DE LA TARJETA. Cada producto es una compra con su propio plan.
// Las tasas son las del ejercicio; no se consultan tasas bancarias reales.
function tasaPorCuotas(cantidad) {
  if (cantidad <= 2) return 0;
  if (cantidad <= 6) return 0.019;
  return 0.023;
}

function fechaPrimeraCuota() {
  let hoy = new Date();
  return fechaDelMes(hoy.getFullYear(), hoy.getMonth() + 1);
}

function fechaDelMes(anio, mes) {
  let fecha = new Date(anio, mes, 15);
  let numeroMes = String(fecha.getMonth() + 1).padStart(2, '0');
  return fecha.getFullYear() + '-' + numeroMes + '-15';
}

function fechaLegible(fecha) {
  let partes = fecha.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

// Cuota fija: capital * tasa / (1 - (1 + tasa) elevado a -cantidad).
// El último abono recoge la diferencia de centavos para cerrar el saldo en cero.
function crearPlan(capital, cantidad, primeraFecha, numeroInicial) {
  let tasa = tasaPorCuotas(cantidad);
  let saldo = redondear(capital);
  let pago = capital / cantidad;
  if (tasa > 0) pago = capital * tasa / (1 - Math.pow(1 + tasa, -cantidad));
  pago = redondear(pago);
  let partes = primeraFecha.split('-');
  let plan = [];
  for (let i = 0; i < cantidad; i++) {
    let interes = redondear(saldo * tasa);
    let abono = Math.min(saldo, redondear(pago - interes));
    if (i === cantidad - 1) abono = saldo;
    saldo = redondear(saldo - abono);
    plan.push({
      numero: numeroInicial + i,
      fecha: fechaDelMes(Number(partes[0]), Number(partes[1]) - 1 + i),
      capital: abono, interes: interes, total: redondear(abono + interes),
      saldo: saldo, tasa: tasa, pagada: false, fechaPago: ''
    });
  }
  return plan;
}

function primeraPendiente(compra) {
  for (let i = 0; i < compra.cuotas.length; i++) {
    if (!compra.cuotas[i].pagada) return compra.cuotas[i];
  }
  return null;
}

function capitalPendiente(compra) {
  let capital = 0;
  for (let i = 0; i < compra.cuotas.length; i++) {
    if (!compra.cuotas[i].pagada) capital += compra.cuotas[i].capital;
  }
  return redondear(capital);
}

function buscarCompra(id) {
  for (let i = 0; i < usuarioActual.compras.length; i++) {
    if (usuarioActual.compras[i].id === Number(id)) return usuarioActual.compras[i];
  }
  return null;
}

// Conservar la deuda de versiones anteriores como un producto identificable.
// No se inventan intereses ni se borran movimientos anteriores.
function prepararCredito() {
  if (!usuarioActual.compras) {
    usuarioActual.compras = [];
    usuarioActual.siguienteCompra = 1;
    if (usuarioActual.deuda > 0) {
      usuarioActual.compras.push({
        id: 1, nombre: 'Saldo anterior de tarjeta', montoOriginal: usuarioActual.deuda,
        cuotas: crearPlan(usuarioActual.deuda, 1, fechaPrimeraCuota(), 1)
      });
      usuarioActual.siguienteCompra = 2;
    }
    guardarUsuarios();
  }
  sincronizarDeuda();
}

function sincronizarDeuda() {
  let deuda = 0;
  for (let i = 0; i < usuarioActual.compras.length; i++) {
    deuda += capitalPendiente(usuarioActual.compras[i]);
  }
  usuarioActual.deuda = redondear(deuda);
}

// El mínimo corresponde al primer mes que todavía tiene cuotas pendientes.
// Al pagar una compra, no se vuelve a incluir su cuota del siguiente mes.
function resumenCredito() {
  let resumen = { capital: 0, intereses: 0, total: 0, minimo: 0, periodo: '', fecha: '' };
  for (let i = 0; i < usuarioActual.compras.length; i++) {
    let compra = usuarioActual.compras[i];
    for (let j = 0; j < compra.cuotas.length; j++) {
      let cuota = compra.cuotas[j];
      if (!cuota.pagada) {
        resumen.capital += cuota.capital;
        resumen.intereses += cuota.interes;
        if (resumen.fecha === '' || cuota.fecha < resumen.fecha) resumen.fecha = cuota.fecha;
      }
    }
  }
  resumen.periodo = resumen.fecha.slice(0, 7);
  let seleccion = cuotasDelPeriodo(resumen.periodo);
  for (let i = 0; i < seleccion.length; i++) resumen.minimo += seleccion[i].cuota.total;
  resumen.capital = redondear(resumen.capital);
  resumen.intereses = redondear(resumen.intereses);
  resumen.total = redondear(resumen.capital + resumen.intereses);
  resumen.minimo = redondear(resumen.minimo);
  return resumen;
}

function cuotasDelPeriodo(periodo) {
  let lista = [];
  if (periodo === '') return lista;
  for (let i = 0; i < usuarioActual.compras.length; i++) {
    let compra = usuarioActual.compras[i];
    for (let j = 0; j < compra.cuotas.length; j++) {
      let cuota = compra.cuotas[j];
      if (!cuota.pagada && cuota.fecha.slice(0, 7) === periodo) {
        lista.push({ compra: compra, cuota: cuota });
      }
    }
  }
  return lista;
}

// Recibe cuotas completas. Se descuenta capital + interés de la cuenta,
// pero únicamente el capital pagado libera cupo en la tarjeta.
function aplicarPagoCuotas(cuenta, lista) {
  let total = 0;
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].cuota.pagada) return false;
    total += lista[i].cuota.total;
  }
  total = redondear(total);
  if (total <= 0 || !haySaldo(cuenta, total)) return false;
  usuarioActual[cuenta] = redondear(usuarioActual[cuenta] - total);
  registrarMovimiento('Pago de cuotas de tarjeta', cuenta, -total);
  for (let i = 0; i < lista.length; i++) {
    let cuota = lista[i].cuota;
    cuota.pagada = true;
    cuota.fechaPago = new Date().toLocaleString('es-CO');
    sincronizarDeuda();
    registrarMovimiento('Cuota ' + cuota.numero + ' de ' + lista[i].compra.nombre +
      ' | Capital: ' + dinero(cuota.capital) + ' | Interés: ' + dinero(cuota.interes),
      'tarjeta', -cuota.total);
  }
  guardarUsuarios();
  return true;
}
