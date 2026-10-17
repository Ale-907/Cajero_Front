if (usuarioActual !== null) {
  document.getElementById('perfil-nombre').value = usuarioActual.nombre;
  document.getElementById('perfil-email').value = usuarioActual.email;
  document.getElementById('perfil-celular').value = usuarioActual.celular;
  document.getElementById('perfil-direccion').value = usuarioActual.direccion;
}
function guardarPerfil(evento) {
  evento.preventDefault();
  let nombre = document.getElementById('perfil-nombre').value.trim();
  let direccion = document.getElementById('perfil-direccion').value.trim();
  if (nombre === '' || direccion === '') {
    alert('Completa tu nombre y dirección.');
    return;
  }
  usuarioActual.nombre = nombre;
  usuarioActual.email = document.getElementById('perfil-email').value.trim();
  usuarioActual.celular = document.getElementById('perfil-celular').value.trim();
  usuarioActual.direccion = direccion;
  guardarUsuarios();
  alert('Datos personales guardados.');
}
