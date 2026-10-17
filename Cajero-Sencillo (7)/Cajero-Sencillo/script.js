// FUNCIONES COMPARTIDAS. Solo objetos, arreglos, funciones, if y for.
// Es un ejercicio local: no realiza transacciones con un banco real.

function crearUsuario(id, nombre, celular, usuario, clave, email) {
  return {
    id: id, nombre: nombre, celular: celular, usuario: usuario,
    clave: clave, email: email, direccion: '', intentos: 0,
    ahorros: 1500000, corriente: 800000, cupo: 3000000,
    deuda: 0, compras: [], siguienteCompra: 1, movimientos: []
  };
}

// localStorage permite conservar los datos al cambiar de página.
let usuarios = JSON.parse(localStorage.getItem('nova_sencillo_usuarios'));
if (usuarios === null) {
  usuarios = [];
  guardarUsuarios();
}

function guardarUsuarios() {
  localStorage.setItem('nova_sencillo_usuarios', JSON.stringify(usuarios));
}

function buscarUsuario(nombre) {
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].usuario === nombre) {
      return usuarios[i];
    }
  }
  return null;
}

let usuarioActual = buscarUsuario(localStorage.getItem('nova_sencillo_sesion'));
let pagina = window.location.pathname.split('/').pop();
let publica = pagina === '' || pagina === 'index.html' || pagina === 'auth.html' ||
  pagina === 'registro.html' || pagina === 'cerrar_sesion.html';

if (usuarioActual !== null) prepararCredito();

if (pagina === 'cerrar_sesion.html') {
  localStorage.removeItem('nova_sencillo_sesion');
  usuarioActual = null;
}
if (!publica && usuarioActual === null) {
  window.location.replace('auth.html');
}

function cerrarSesion() {
  localStorage.removeItem('nova_sencillo_sesion');
  window.location.href = 'cerrar_sesion.html';
}

function dinero(valor) {
  return '$' + valor.toLocaleString('es-CO', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }) + ' COP';
}

function mostrarTexto(id, texto) {
  let elemento = document.getElementById(id);
  if (elemento !== null) {
    elemento.textContent = texto;
  }
}

function montoValido(monto) {
  if (!Number.isFinite(monto) || monto <= 0) {
    alert('Ingresa un monto válido mayor que cero.');
    return false;
  }
  return true;
}

function redondear(valor) {
  return Math.round(valor * 100) / 100;
}

// Cada movimiento guarda el saldo que quedó al realizarlo.
function registrarMovimiento(tipo, producto, valor) {
  let saldo = usuarioActual[producto];
  if (producto === 'tarjeta') {
    saldo = usuarioActual.deuda;
  }
  usuarioActual.movimientos.unshift({
    fecha: new Date().toLocaleString('es-CO'),
    tipo: tipo, producto: producto, valor: valor, saldo: saldo
  });
}

// Transferencias y pagos usan el saldo disponible, sin intereses ni sobregiro.
function haySaldo(cuenta, monto) {
  if (monto > usuarioActual[cuenta]) {
    alert('Saldo insuficiente en la cuenta de origen.');
    return false;
  }
  return true;
}

function actualizarSaldos() {
  mostrarTexto('saldo-ahorros', dinero(usuarioActual.ahorros));
  mostrarTexto('saldo-corriente', dinero(usuarioActual.corriente));
  mostrarTexto('cupo-disponible', dinero(usuarioActual.cupo - usuarioActual.deuda));
  mostrarTexto('cupo-total', dinero(usuarioActual.cupo));
  mostrarTexto('deuda-tarjeta', dinero(usuarioActual.deuda));
}

// Crear filas con textContent evita interpretar los datos como etiquetas HTML.
function agregarCelda(fila, texto) {
  let celda = document.createElement('td');
  celda.textContent = texto;
  fila.appendChild(celda);
}
