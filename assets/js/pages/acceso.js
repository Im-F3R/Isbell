/* Página 10 — Inicio de sesión y registro */
(function () {
  var A = App;
  var next = A.param("next") || "mis-citas.html";
  if (!/^[a-z-]+\.html$/.test(next)) next = "mis-citas.html"; // solo páginas internas
  if (A.auth.current()) { location.replace(next === "datos.html" ? next : "mi-cuenta.html"); return; }

  var tabs = { login: A.$("#tab-login"), reg: A.$("#tab-reg") };
  var panels = { login: A.$("#panel-login"), reg: A.$("#panel-reg") };
  var err = A.$("#auth-error");

  function show(which) {
    Object.keys(tabs).forEach(function (k) {
      var on = k === which;
      tabs[k].setAttribute("aria-selected", String(on));
      tabs[k].tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
    });
    err.hidden = true;
  }
  tabs.login.addEventListener("click", function () { show("login"); });
  tabs.reg.addEventListener("click", function () { show("reg"); });
  A.$(".auth__tabs").addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      var to = tabs.login.getAttribute("aria-selected") === "true" ? "reg" : "login";
      show(to); tabs[to].focus();
    }
  });
  if (A.param("tab") === "registro") show("reg");

  A.$$("[data-toggle-pw]").forEach(function (b) {
    b.addEventListener("click", function () {
      var i = b.previousElementSibling, vis = i.type === "text";
      i.type = vis ? "password" : "text"; b.textContent = vis ? "Mostrar" : "Ocultar";
    });
  });

  function fail(m) { err.textContent = m; err.hidden = false; err.focus && err.scrollIntoView({ block: "nearest" }); }

  panels.login.addEventListener("submit", async function (e) {
    e.preventDefault();
    var f = e.target;
    if (!A.validar(f, { email: A.R.email(false), clave: A.R.req("Ingresa tu contraseña.") })) return;
    try {
      await A.auth.login(f.email.value, f.clave.value);
      location.href = next;
    } catch (ex) { fail(ex.message); }
  });

  panels.reg.addEventListener("submit", async function (e) {
    e.preventDefault();
    var f = e.target;
    var ok = A.validar(f, {
      nombre: A.R.req("Ingresa tu nombre."),
      apellido: A.R.req("Ingresa tu apellido."),
      email: A.R.email(false),
      telefono: A.R.tel,
      clave: function (v) { return v.length >= 8 ? "" : "La contraseña debe tener al menos 8 caracteres."; },
      clave2: function (v) { return v && v === f.clave.value ? "" : "Las contraseñas no coinciden."; },
      condiciones: function (v) { return v ? "" : "Debes aceptar las condiciones para crear tu cuenta."; }
    });
    if (!ok) return;
    try {
      var u = await A.auth.register({ nombre: f.nombre.value, apellido: f.apellido.value, email: f.email.value, telefono: f.telefono.value, clave: f.clave.value });
      // Asocia a la cuenta las citas hechas como invitado en este dispositivo
      var list = A.citas.all().map(function (c) {
        return !c.usuario && (c.telefono === u.telefono || (c.email && c.email.toLowerCase() === u.email)) ? Object.assign({}, c, { usuario: u.id }) : c;
      });
      A.citas.save(list);
      location.href = next;
    } catch (ex) { fail(ex.message); }
  });

  // Recuperación: se verifica correo + teléfono registrados en este dispositivo
  A.$("#forgot").addEventListener("click", function (e) {
    e.preventDefault();
    if (A.$("#reset-form")) return;
    panels.login.insertAdjacentHTML("afterend",
      '<form id="reset-form" class="fade-in" novalidate style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--line)">' +
      '<h2 style="font-family:var(--sans);font-size:1.05rem;font-weight:700">Recuperar contraseña</h2>' +
      '<p class="small muted">Verifica tu correo y el teléfono con el que te registraste para crear una nueva contraseña.</p>' +
      '<div class="field"><label for="x-email">Correo electrónico</label><input id="x-email" name="email" type="email" autocomplete="email"></div>' +
      '<div class="field"><label for="x-tel">Teléfono registrado</label><input id="x-tel" name="telefono" type="tel" autocomplete="tel"></div>' +
      '<div class="field"><label for="x-clave">Nueva contraseña</label><input id="x-clave" name="clave" type="password" autocomplete="new-password"></div>' +
      '<button class="btn btn--outline btn--block" type="submit">Restablecer contraseña</button></form>');
    var rf = A.$("#reset-form");
    rf.email.value = panels.login.email.value;
    rf.email.focus();
    rf.addEventListener("submit", async function (ev) {
      ev.preventDefault();
      if (!A.validar(rf, {
        email: A.R.email(false), telefono: A.R.tel,
        clave: function (v) { return v.length >= 8 ? "" : "Mínimo 8 caracteres."; }
      })) return;
      var em = rf.email.value.trim().toLowerCase(), tel = rf.telefono.value.replace(/\D/g, "");
      var u = A.auth.users().filter(function (x) { return x.email === em && x.telefono.replace(/\D/g, "") === tel; })[0];
      if (!u) { fail("No encontramos una cuenta con esos datos en este dispositivo."); return; }
      A.auth.update(u.id, { clave: await A.auth.hash(rf.clave.value) });
      rf.outerHTML = '<p class="alert alert--ok" style="margin-top:1rem">' + A.icon("check") + "<span>Contraseña actualizada. Ya puedes iniciar sesión.</span></p>";
      panels.login.clave.value = ""; panels.login.clave.focus();
    });
  });
})();
