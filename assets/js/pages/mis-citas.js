/* Página 12 — Mis citas */
(function () {
  var A = App;
  var user = A.auth.current();
  var filtro = A.param("estado") || "todas";
  var TABS = [["todas", "Todas"], ["pendiente", "Pendientes"], ["confirmada", "Confirmadas"], ["completada", "Completadas"], ["cancelada", "Canceladas"]];

  A.$("#mc-sub").innerHTML = user
    ? "Hola, " + A.esc(user.nombre) + ". Consulta y administra tus reservas."
    : 'Citas reservadas desde este dispositivo. <a class="link" href="acceso.html?next=mis-citas.html">Inicia sesión</a> para administrarlas con tu cuenta.';

  function render() {
    var all = A.citas.mine().sort(function (a, b) { return (b.fecha + b.hora).localeCompare(a.fecha + a.hora); });
    // Próximas primero
    var hoy = A.toISO(new Date());
    all.sort(function (a, b) {
      var fa = a.fecha >= hoy, fb = b.fecha >= hoy;
      if (fa !== fb) return fa ? -1 : 1;
      return fa ? (a.fecha + a.hora).localeCompare(b.fecha + b.hora) : (b.fecha + b.hora).localeCompare(a.fecha + a.hora);
    });
    var counts = { todas: all.length };
    all.forEach(function (c) { var e = A.citas.estado(c); counts[e] = (counts[e] || 0) + 1; });

    A.$("#mc-tabs").innerHTML = TABS.map(function (t) {
      return '<button class="chip" role="tab" type="button" data-f="' + t[0] + '" aria-selected="' + (filtro === t[0]) + '">' + t[1] +
        ' <span class="count">' + (counts[t[0]] || 0) + "</span></button>";
    }).join("");

    var list = all.filter(function (c) { return filtro === "todas" || A.citas.estado(c) === filtro; });
    var box = A.$("#mc-list");
    if (!list.length) {
      box.innerHTML = '<div class="empty fade-in"><div class="empty__icon">' + A.icon("calendar") + "</div>" +
        "<h2>" + (all.length ? "No tienes citas en esta categoría" : "Todavía no tienes citas registradas") + "</h2>" +
        "<p>" + (all.length ? "Prueba con otro filtro." : "Explora nuestros tratamientos y agenda tu primera cita.") + "</p>" +
        '<a class="btn" href="servicios.html">Explorar servicios</a></div>';
      return;
    }
    box.innerHTML = list.map(function (c) {
      var s = A.servicio(c.servicio) || { nombre: c.servicio, icono: "spa", imagenes: [] };
      var e = A.citas.estado(c), activa = e === "pendiente" || e === "confirmada";
      return '<article class="appt fade-in">' +
        '<div class="appt__img">' + A.media(s) + "</div>" +
        "<div><h3>" + A.esc(s.nombre) + ' <span class="badge ' + A.ESTADOS[e].cls + '">' + A.ESTADOS[e].txt + "</span></h3>" +
        '<ul class="appt__meta">' +
        "<li>" + A.icon("calendar") + A.fechaLarga(c.fecha) + "</li>" +
        "<li>" + A.icon("clock") + "Hora: " + A.esc(c.hora || "Por confirmar") + "</li>" +
        (s.duracion !== undefined ? "<li>" + A.icon("spa") + "Duración: " + A.duracion(s) + "</li>" : "") +
        "<li>" + A.icon("tag") + "Precio: " + (s.precio !== undefined ? A.precio(s) : "—") + "</li>" +
        '</ul><p class="appt__code">Código: ' + A.esc(c.codigo) + "</p></div>" +
        '<div class="appt__actions">' +
        '<a class="btn btn--sm btn--outline" href="confirmacion.html?codigo=' + encodeURIComponent(c.codigo) + '">Ver detalle</a>' +
        (activa
          ? '<a class="btn btn--sm" href="reservar.html?reprogramar=' + encodeURIComponent(c.codigo) + '">Reprogramar</a>' +
            '<button class="btn btn--sm btn--danger" type="button" data-cancel="' + A.esc(c.codigo) + '">Cancelar</button>'
          : '<a class="btn btn--sm" href="reservar.html?servicio=' + encodeURIComponent(c.servicio) + '">Reservar de nuevo</a>') +
        "</div></article>";
    }).join("");
  }

  A.$("#mc-tabs").addEventListener("click", function (e) {
    var b = e.target.closest("[data-f]"); if (!b) return;
    filtro = b.dataset.f;
    history.replaceState(null, "", "mis-citas.html" + (filtro === "todas" ? "" : "?estado=" + filtro));
    render();
    A.$('[data-f="' + filtro + '"]').focus();
  });
  A.$("#mc-list").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cancel]"); if (!b) return;
    var code = b.dataset.cancel, c = A.citas.byCode(code);
    if (!confirm("¿Deseas cancelar la cita " + code + "? Se aplicarán las condiciones de cancelación del centro.")) return;
    A.citas.actualizar(code, { estado: "cancelada", cancelada: new Date().toISOString() });
    render();
    A.toast("Cita cancelada. Te recomendamos avisar también por WhatsApp.");
    var s = A.servicio(c.servicio);
    setTimeout(function () {
      if (confirm("¿Quieres avisar a Isbell por WhatsApp sobre la cancelación?")) {
        window.open(A.wa("Hola Isbell, quisiera cancelar mi cita " + code + " (" + (s ? s.nombre : "") + ", " + A.fechaLarga(c.fecha) + " a las " + c.hora + ")."), "_blank", "noopener");
      }
    }, 300);
  });
  render();
})();
