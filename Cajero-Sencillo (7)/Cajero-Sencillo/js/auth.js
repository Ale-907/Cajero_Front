function iniciarSesion(evento) {
  evento.preventDefault();
  let nombre = document.getElementById('log-user').value.trim().toLowerCase();
  let clave = document.getElementById('log-pass').value;
  let usuario = buscarUsuario(nombre);
  if (usuario === null) {
    alert('El usuario no existe.');
    return;
  }
  if (usuario.intentos >= 3) {
    mostrarTexto('intentos-txt', 'Cuenta bloqueada: 0 intentos disponibles.');
    alert('Cuenta bloqueada por tres intentos fallidos.');
    return;
  }
  if (usuario.clave !== clave) {
    usuario.intentos++;
    guardarUsuarios();
    mostrarTexto('intentos-txt', 'Intentos disponibles: ' + (3 - usuario.intentos));
    alert('Contraseña incorrecta.');
    return;
  }
  usuario.intentos = 0;
  guardarUsuarios();
  localStorage.setItem('nova_sencillo_sesion', usuario.usuario);
  window.location.href = 'dashboard.html';
}
