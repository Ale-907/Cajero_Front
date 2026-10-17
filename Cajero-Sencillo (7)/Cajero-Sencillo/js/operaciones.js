let operacion = 'consignar';
function cambiarOperacion(tipo) {
  operacion = tipo;
  if (tipo === 'consignar') {
    mostrarTexto('titulo-operacion', 'Consignar dinero');
    mostrarTexto('aviso-operacion', 'El monto se suma a la cuenta seleccionada.');
  } else {
    mostrarTexto('titulo-operacion', 'Retirar dinero');
    mostrarTexto('aviso-operacion', 'Ahorros: abona 1,5% del retiro. Corriente: sobregiro del 20%.');
  }
}
function realizarOperacion(evento) {
  evento.preventDefault();
  let cuenta = document.getElementById('op-cuenta').value;
  let monto = Number(document.getElementById('op-monto').value);
  if (!montoValido(monto)) return;
  monto = redondear(monto);
  if (operacion === 'consignar') {
    usuarioActual[cuenta] = redondear(usuarioActual[cuenta] + monto);
    registrarMovimiento('Consignación', cuenta, monto);
  } else {
    let limite = usuarioActual[cuenta];
    if (cuenta === 'corriente') {
      limite = Math.max(0, limite) * 1.20;
    }
    if (monto > redondear(limite)) {
      alert('El retiro supera el límite de ' + dinero(limite));
      return;
    }
    usuarioActual[cuenta] = redondear(usuarioActual[cuenta] - monto);
    registrarMovimiento('Retiro', cuenta, -monto);
    if (cuenta === 'ahorros') {
      let rendimiento = redondear(monto * 0.015);
      usuarioActual.ahorros = redondear(usuarioActual.ahorros + rendimiento);
      registrarMovimiento('Rendimiento del retiro (1,5%)', cuenta, rendimiento);
    }
  }
  guardarUsuarios();
  alert('Operación realizada. Saldo: ' + dinero(usuarioActual[cuenta]));
  document.getElementById('op-monto').value = '';
}
cambiarOperacion('consignar');
