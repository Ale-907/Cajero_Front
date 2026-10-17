function registrarUsuario(evento) {
  evento.preventDefault();
  let id = document.getElementById('reg-id').value.trim();
  let nombre = document.getElementById('reg-nombre').value.trim();
  let celular = document.getElementById('reg-cel').value.trim();
  let email = document.getElementById('reg-email').value.trim();
  let usuario = document.getElementById('reg-user').value.trim().toLowerCase();
  let clave = document.getElementById('reg-pass').value;
  let confirmacion = document.getElementById('reg-pass2').value;
  if (id === '' || nombre === '' || usuario.length < 3) {
    alert('Completa los datos y usa un usuario de mínimo tres caracteres.');
    return;
  }
  if (clave.length < 6 || clave !== confirmacion) {
    alert('Las claves deben coincidir y tener mínimo seis caracteres.');
    return;
  }
  if (buscarUsuario(usuario) !== null) {
    alert('Ese usuario ya existe.');
    return;
  }
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].id === id) {
      alert('La identificación ya está registrada.');
      return;
    }
  }
  usuarios.push(crearUsuario(id, nombre, celular, usuario, clave, email));
  guardarUsuarios();
  alert('Registro exitoso. Ya puedes iniciar sesión.');
  window.location.href = 'auth.html';
}
