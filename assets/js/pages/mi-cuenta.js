/* Página 11 — Mi cuenta */
(function () {
  var A = App;
  var user = A.auth.current();
  if (!user) { location.replace("acceso.html?next=mi-cuenta.html"); return; }
  var main = A.$("#account-main");

  function nav(active) {
    A.$("#side-nav").innerHTML =
      '<div class="side-nav__user"><span class="avatar">' + A.esc(user.nombre.charAt(0).toUpperCase()) + "</span><div><strong>" +
      A.esc(user.nombre + " " + user.apellido) + "</strong><span>" + A.esc(user.email) + "</span></div></div>" +
      '<a href="#perfil"' + (active === "perfil" ? ' aria-current="page"' : "") + ">" + A.icon("user") + "Mi perfil</a>" +
      '<a href="mis-citas.html">' + A.icon("calendar") + "Mis citas</a>" +
      '<a href="#configuracion"' + (active === "configuracion" ? ' aria-current="page"' : "") + ">" + A.icon("settings") + "Configuración</a>" +
      '<button type="button" id="logout">' + A.icon("logout") + "Cerrar sesión</button>";
    A.$("#logout").addEventListener("click", function () { A.auth.logout(); location.href = "index.html"; });
  }

  function perfil(editing) {
    user = A.auth.current();
    nav("perfil");
    var n = A.citas.mine().filter(function (c) { var e = A.citas.estado(c); return e === "pendiente" || e === "confirmada"; }).length;
    if (!editing) {
      main.innerHTML =
        '<section class="panel fade-in"><h2 class="panel__title">Datos personales</h2>' +
        '<dl class="profile-grid">' +
        "<div><dt>Nombre</dt><dd>" + A.esc(user.nombre) + "</dd></div>" +
        "<div><dt>Apellido</dt><dd>" + A.esc(user.apellido) + "</dd></div>" +
        "<div><dt>Correo</dt><dd>" + A.esc(user.email) + "</dd></div>" +
        "<div><dt>Teléfono</dt><dd>" + A.esc(user.telefono) + "</dd></div>" +
        '</dl><div class="btn-row" style="margin-top:1.5rem"><button class="btn" type="button" id="edit">Editar información</button></div></section>' +
        '<section class="panel"><h2 class="panel__title">Tus próximas citas</h2>' +
        '<p class="muted">' + (n ? "Tienes " + n + (n === 1 ? " cita activa." : " citas activas.") : "No tienes citas activas.") + "</p>" +
        '<div class="btn-row"><a class="btn btn--outline btn--sm" href="mis-citas.html">Ver mis citas</a><a class="btn btn--sm" href="reservar.html">Reservar cita</a></div></section>';
      A.$("#edit").addEventListener("click", function () { perfil(true); });
      return;
    }
    main.innerHTML =
      '<form class="panel fade-in" id="profile-form" novalidate><h2 class="panel__title">Editar información</h2>' +
      '<div class="field-row"><div class="field"><label for="p-nombre">Nombre</label><input id="p-nombre" name="nombre" autocomplete="given-name"></div>' +
      '<div class="field"><label for="p-apellido">Apellido</label><input id="p-apellido" name="apellido" autocomplete="family-name"></div></div>' +
      '<div class="field-row"><div class="field"><label for="p-email">Correo</label><input id="p-email" name="email" type="email" autocomplete="email"></div>' +
      '<div class="field"><label for="p-tel">Teléfono</label><input id="p-tel" name="telefono" type="tel" autocomplete="tel"></div></div>' +
      '<div class="btn-row"><button class="btn" type="submit">Guardar cambios</button><button class="btn btn--outline" type="button" id="cancel">Cancelar</button></div></form>';
    var f = A.$("#profile-form");
    f.nombre.value = user.nombre; f.apellido.value = user.apellido; f.email.value = user.email; f.telefono.value = user.telefono;
    f.nombre.focus();
    A.$("#cancel").addEventListener("click", function () { perfil(false); });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var em = f.email.value.trim().toLowerCase();
      var ok = A.validar(f, {
        nombre: A.R.req("Ingresa tu nombre."), apellido: A.R.req("Ingresa tu apellido."), telefono: A.R.tel,
        email: function (v) {
          var m = A.R.email(false)(v); if (m) return m;
          return A.auth.users().some(function (u) { return u.email === em && u.id !== user.id; }) ? "Ese correo ya está en uso." : "";
        }
      });
      if (!ok) return;
      A.auth.update(user.id, { nombre: f.nombre.value.trim(), apellido: f.apellido.value.trim(), email: em, telefono: f.telefono.value.trim() });
      A.toast("Tus datos se actualizaron correctamente.");
      perfil(false);
    });
  }

  function config() {
    nav("configuracion");
    main.innerHTML =
      '<form class="panel fade-in" id="pw-form" novalidate><h2 class="panel__title">Cambiar contraseña</h2>' +
      '<div class="field"><label for="c-actual">Contraseña actual</label><input id="c-actual" name="actual" type="password" autocomplete="current-password"></div>' +
      '<div class="field-row"><div class="field"><label for="c-nueva">Nueva contraseña</label><input id="c-nueva" name="nueva" type="password" autocomplete="new-password"></div>' +
      '<div class="field"><label for="c-nueva2">Confirmar contraseña</label><input id="c-nueva2" name="nueva2" type="password" autocomplete="new-password"></div></div>' +
      '<button class="btn" type="submit">Actualizar contraseña</button></form>' +
      '<section class="panel"><h2 class="panel__title">Privacidad</h2>' +
      '<p class="muted">Tu cuenta y tus citas se guardan en este navegador. Puedes eliminar tu cuenta y todas sus citas en cualquier momento.</p>' +
      '<button class="btn btn--danger" type="button" id="del">Eliminar mi cuenta</button></section>';
    var f = A.$("#pw-form");
    f.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!A.validar(f, {
        actual: A.R.req("Ingresa tu contraseña actual."),
        nueva: function (v) { return v.length >= 8 ? "" : "Mínimo 8 caracteres."; },
        nueva2: function (v) { return v === f.nueva.value ? "" : "Las contraseñas no coinciden."; }
      })) return;
      if (await A.auth.hash(f.actual.value) !== A.auth.current().clave) { A.fieldError(f.actual, "La contraseña actual no es correcta."); f.actual.focus(); return; }
      A.auth.update(user.id, { clave: await A.auth.hash(f.nueva.value) });
      f.reset(); A.toast("Contraseña actualizada.");
    });
    A.$("#del").addEventListener("click", function () {
      if (!confirm("¿Seguro que deseas eliminar tu cuenta y tus citas guardadas? Esta acción no se puede deshacer.")) return;
      A.auth.remove(user.id);
      location.href = "index.html";
    });
  }

  function route() { (location.hash === "#configuracion" ? config : function () { perfil(false); })(); }
  window.addEventListener("hashchange", route);
  route();
})();
