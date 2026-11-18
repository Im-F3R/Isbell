/* Página 9 — Confirmación de cita */
(function () {
  var A = App, D = ISBELL, N = D.negocio;
  var box = A.$("#confirm");
  var c = A.citas.byCode(A.param("codigo") || "");
  if (!c) {
    box.innerHTML = '<div class="empty"><div class="empty__icon">' + A.icon("search") + "</div>" +
      "<h1 style=\"font-size:1.6rem\">No encontramos esta reserva</h1><p>Revisa tus reservas en Mis citas o vuelve a agendar.</p>" +
      '<div class="btn-row" style="justify-content:center"><a class="btn" href="mis-citas.html">Ver mis citas</a><a class="btn btn--outline" href="reservar.html">Reservar cita</a></div></div>';
    return;
  }
  var s = A.servicio(c.servicio);
  var est = A.citas.estado(c);
  var confirmed = est === "confirmada";
  var reprog = A.param("reprogramada");

  box.innerHTML =
    '<div class="confirm__icon ' + (confirmed ? "confirm__icon--ok" : "confirm__icon--pend") + '">' + A.icon(confirmed ? "check" : "pending") + "</div>" +
    '<span class="eyebrow">' + (reprog ? "Cita reprogramada" : "Reserva registrada") + "</span>" +
    "<h1>" + (confirmed ? "Tu cita ha sido confirmada" : "Tu solicitud fue registrada y está pendiente de confirmación") + "</h1>" +
    '<p class="muted">' + (confirmed
      ? "Te esperamos en Isbell Centro Estético. Llega unos minutos antes de tu hora."
      : "Para agilizar la confirmación, envíanos tu solicitud por WhatsApp. El personal verificará la disponibilidad y te responderá.") + "</p>" +
    (confirmed ? "" : '<a class="btn btn--wa" target="_blank" rel="noopener" href="' + A.wa(A.citas.mensajeWA(c)) + '">' + A.WA_SVG + "Enviar solicitud por WhatsApp</a>") +
    '<div class="ticket"><div class="ticket__head"><div><small class="muted">Código de reserva</small><div class="ticket__code">' + A.esc(c.codigo) + "</div></div>" +
    '<span class="badge ' + A.ESTADOS[est].cls + '">' + A.ESTADOS[est].txt + "</span></div>" +
    '<ul class="summary">' +
    "<li><span>Servicio</span><span>" + A.esc(s ? s.nombre : c.servicio) + "</span></li>" +
    "<li><span>Fecha</span><span>" + A.fechaLarga(c.fecha) + "</span></li>" +
    "<li><span>Hora</span><span>" + A.esc(c.hora) + "</span></li>" +
    "<li><span>Duración</span><span>" + (s ? A.duracion(s) : "—") + "</span></li>" +
    "<li><span>Precio</span><span>" + (s ? A.precio(s) : "—") + "</span></li>" +
    "<li><span>Pago</span><span>" + A.esc(c.pagoNombre) + "</span></li>" +
    "<li><span>A nombre de</span><span>" + A.esc(c.nombre + " " + c.apellido) + "</span></li>" +
    "<li><span>Contacto Isbell</span><span>" + N.whatsappVisible + " · " + A.esc(N.direccion) + "</span></li>" +
    "</ul></div>" +
    '<div class="btn-row" style="justify-content:center">' +
    '<a class="btn" href="mis-citas.html">Ver mis citas</a>' +
    '<a class="btn btn--outline" href="index.html">Volver al inicio</a>' +
    '<a class="btn btn--outline" target="_blank" rel="noopener" href="' + A.wa("Hola Isbell, tengo una consulta sobre mi cita " + c.codigo + ".") + '">Contactar a Isbell</a>' +
    "</div>" +
    '<p class="small muted" style="margin-top:1.5rem">Guarda tu código de reserva. Lo necesitarás si deseas cambiar o cancelar tu cita.</p>';
  document.title = (confirmed ? "Cita confirmada" : "Solicitud registrada") + " | Isbell Centro Estético";
})();
