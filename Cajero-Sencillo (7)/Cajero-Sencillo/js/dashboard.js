let saldoVisible = true;
function mostrarOcultarSaldo() {
  if (saldoVisible) {
    mostrarTexto('saldo-ahorros', '••••••');
    saldoVisible = false;
  } else {
    mostrarTexto('saldo-ahorros', dinero(usuarioActual.ahorros));
    saldoVisible = true;
  }
}
if (usuarioActual !== null) {
  mostrarTexto('txt-nombre-usuario', usuarioActual.nombre);
  actualizarSaldos();
  mostrarTexto('tarjeta-minimo-dashboard', 'Pago mínimo simulado: ' + dinero(resumenCredito().minimo));
  let caja = document.getElementById('ultimos-movimientos');
  if (usuarioActual.movimientos.length === 0) {
    caja.textContent = 'Todavía no has realizado movimientos.';
  }
  for (let i = 0; i < usuarioActual.movimientos.length && i < 3; i++) {
    let movimiento = usuarioActual.movimientos[i];
    let fila = document.createElement('p');
    fila.className = 'mini-movement-row';
    fila.textContent = movimiento.tipo + ': ' + dinero(movimiento.valor);
    caja.appendChild(fila);
  }
}
