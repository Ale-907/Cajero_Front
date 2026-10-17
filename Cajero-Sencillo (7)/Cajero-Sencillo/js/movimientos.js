function mostrarMovimientos() {
  if (usuarioActual === null) return;
  let filtro = document.getElementById('filtro').value;
  let tabla = document.getElementById('lista-movimientos');
  tabla.textContent = '';
  let cantidad = 0;
  for (let i = 0; i < usuarioActual.movimientos.length; i++) {
    let movimiento = usuarioActual.movimientos[i];
    if (filtro === 'todos' || movimiento.producto === filtro) {
      let fila = document.createElement('tr');
      agregarCelda(fila, movimiento.fecha);
      agregarCelda(fila, movimiento.tipo);
      agregarCelda(fila, movimiento.producto);
      agregarCelda(fila, dinero(movimiento.valor));
      agregarCelda(fila, dinero(movimiento.saldo));
      tabla.appendChild(fila);
      cantidad++;
    }
  }
  if (cantidad === 0) {
    let fila = document.createElement('tr');
    let celda = document.createElement('td');
    celda.colSpan = 5;
    celda.textContent = 'No hay movimientos para este producto.';
    fila.appendChild(celda);
    tabla.appendChild(fila);
  }
}
mostrarMovimientos();
