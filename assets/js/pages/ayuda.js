/* Página 14 — Ayuda y contacto */
(function () {
  var A = App, N = ISBELL.negocio;

  // Buscador de preguntas frecuentes
  var q = A.$("#faq-q"), empty = A.$("#faq-empty");
  q.addEventListener("input", function () {
    var t = A.norm(q.value.trim()), any = false;
    A.$$("#faq-list .faq-group").forEach(function (g) {
      var vis = 0;
      A.$$(".acc", g).forEach(function (d) {
        var hit = !t || A.norm(d.textContent).indexOf(t) !== -1;
        d.hidden = !hit; if (hit) vis++;
        d.open = !!t && hit;
      });
      g.hidden = !vis; if (vis) any = true;
    });
    empty.hidden = any;
  });
  q.addEventListener("keydown", function (e) { if (e.key === "Enter") A.$("#faq").scrollIntoView({ behavior: "smooth" }); });

  // Abre la política indicada en la URL (#politicas)
  if (location.hash === "#politicas") A.$$("#politicas .acc").forEach(function (d) { d.open = true; });

  // Datos de contacto
  var redes = N.redes.length ? N.redes.map(function (r) { return '<a href="' + r.url + '" target="_blank" rel="noopener">' + A.esc(r.nombre) + "</a>"; }).join(" · ") : "Próximamente";
  A.$("#contact-list").innerHTML =
    '<li><span class="feature__icon">' + A.WA_SVG + '</span><div><small>WhatsApp</small><a href="' + A.wa() + '" target="_blank" rel="noopener">' + N.whatsappVisible + "</a></div></li>" +
    '<li><span class="feature__icon">' + A.icon("pin") + "</span><div><small>Dirección</small><strong>" + A.esc(N.direccion) + "</strong></div></li>" +
    '<li><span class="feature__icon">' + A.icon("clock") + "</span><div><small>Horario</small><strong>" + A.esc(N.horario) + "</strong></div></li>" +
    '<li><span class="feature__icon">' + A.icon("users") + "</span><div><small>Asesora</small><strong>" + A.esc(N.asesora) + "</strong></div></li>" +
    '<li><span class="feature__icon">' + A.icon("heart") + "</span><div><small>Redes sociales</small><strong>" + redes + "</strong></div></li>";

  // Mapa
  var mq = encodeURIComponent(N.mapaConsulta);
  A.$("#map").innerHTML = '<iframe title="Mapa de ubicación de Isbell Centro Estético" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' + mq + '&output=embed"></iframe>';
  A.$("#map-link").href = "https://www.google.com/maps/search/?api=1&query=" + mq;

  // Formulario de contacto → WhatsApp
  var f = A.$("#contact-form");
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!A.validar(f, {
      nombre: A.R.req("Ingresa tu nombre."),
      contacto: function (v) {
        if (!v) return "Ingresa tu correo o teléfono.";
        return /@/.test(v) ? A.R.email(false)(v) : A.R.tel(v);
      },
      asunto: A.R.req("Selecciona un asunto."),
      mensaje: A.R.req("Escribe tu mensaje.")
    })) return;
    var msg = "Hola Isbell Centro Estético.\n\n• Nombre: " + f.nombre.value.trim() + "\n• Contacto: " + f.contacto.value.trim() +
      "\n• Asunto: " + f.asunto.value + "\n\n" + f.mensaje.value.trim();
    window.open(A.wa(msg), "_blank", "noopener");
    f.reset();
    A.toast("Abrimos WhatsApp con tu consulta lista para enviar.");
  });
})();
