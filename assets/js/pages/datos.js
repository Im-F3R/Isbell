/* Página 8 — Datos de reserva y pago */
(function () {
  var A = App, D = ISBELL;
  var st = A.draft.get();
  var s = st.servicio && A.servicio(st.servicio);
  if (!s || !st.fecha || !st.hora) { location.replace("reservar.html"); return; }

  var form = A.$("#data-form");
  var user = A.auth.current();
  if (user) {
    form.nombre.value = user.nombre; form.apellido.value = user.apellido;
    form.telefono.value = user.telefono; form.email.value = user.email;
    A.$("#login-hint").innerHTML = A.icon("user") + "<span>Reservando como <strong>" + A.esc(user.nombre + " " + user.apellido) + "</strong>. La cita aparecerá en Mis citas.</span>";
  } else {
    A.$("#login-hint").innerHTML = A.icon("info") + '<span>No necesitas una cuenta. Si <a class="link" href="acceso.html?next=datos.html">inicias sesión</a>, podrás administrar tus citas desde cualquier momento.</span>';
  }

  // Modalidades de pago (solo las aprobadas quedan activas)
  A.$("#pay").insertAdjacentHTML("beforeend", D.pagos.map(function (p, i) {
    return '<label class="pay__opt' + (p.activo ? "" : " is-off") + '"><input type="radio" name="pago" value="' + p.id + '"' +
      (p.activo ? "" : " disabled") + (i === 0 && p.activo ? " checked" : "") + "><div><strong>" + A.esc(p.nombre) +
      (p.activo ? "" : '<span class="pay__tag">Próximamente</span>') + "</strong><span>" + A.esc(p.detalle) + "</span></div></label>";
  }).join(""));

  A.$("#mini-svc").innerHTML = '<div class="svc-pick" style="grid-template-columns:72px 1fr"><div class="svc-pick__img">' + A.media(s) +
    "</div><div><h3 style=\"font-size:1.1rem\">" + A.esc(s.nombre) + "</h3><p>" + A.duracion(s) + "</p></div></div>";
  A.$("#summary").innerHTML =
    "<li><span>Servicio</span><span>" + A.esc(s.nombre) + "</span></li>" +
    "<li><span>Fecha</span><span>" + A.fechaLarga(st.fecha) + "</span></li>" +
    "<li><span>Hora</span><span>" + st.hora + "</span></li>" +
    "<li><span>Precio</span><span>" + A.precio(s) + "</span></li>" +
    '<li class="summary__total"><span>Total a cancelar</span><span>' + (s.precio == null ? "Según valoración" : A.precio(s)) + "</span></li>";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var err = A.$("#d-error"); err.hidden = true;
    var ok = A.validar(form, {
      nombre: A.R.req("Ingresa tu nombre."),
      apellido: A.R.req("Ingresa tu apellido."),
      telefono: A.R.tel,
      email: A.R.email(true),
      condiciones: function (v) { return v ? "" : "Debes aceptar las condiciones para continuar."; }
    });
    if (!ok) return;
    var pago = form.querySelector('input[name="pago"]:checked');
    if (!pago) { err.textContent = "Selecciona una modalidad de pago."; err.hidden = false; return; }
    var pagoObj = D.pagos.filter(function (p) { return p.id === pago.value; })[0];
    try {
      var cita = A.citas.crear({
        servicio: s.id, fecha: st.fecha, hora: st.hora,
        nombre: form.nombre.value.trim(), apellido: form.apellido.value.trim(),
        telefono: form.telefono.value.trim(), email: form.email.value.trim(),
        comentario: form.comentario.value.trim(),
        pago: pagoObj.id, pagoNombre: pagoObj.nombre,
        usuario: user ? user.id : null
      });
      A.draft.clear();
      location.href = "confirmacion.html?codigo=" + encodeURIComponent(cita.codigo);
    } catch (ex) {
      err.innerHTML = A.esc(ex.message) + ' <a class="link" href="reservar.html">Elegir otro horario</a>';
      err.hidden = false;
    }
  });
})();
