/* Página 5 — Detalle del servicio */
(function () {
  var A = App, D = ISBELL;
  var s = A.servicio(A.param("id"));
  if (!s) {
    A.$("#detail").outerHTML = '<div class="empty"><div class="empty__icon">' + A.icon("search") + "</div>" +
      "<h1 style=\"font-size:1.6rem\">No encontramos este servicio</h1><p>Es posible que el enlace haya cambiado.</p>" +
      '<a class="btn" href="servicios.html">Ver todos los servicios</a></div>';
    A.$("#detail-more").hidden = true;
    A.$("#d-related").closest(".section").hidden = true;
    return;
  }
  var c = A.categoria(s.categoria);
  document.title = s.nombre + " | Isbell Centro Estético";
  var meta = document.querySelector('meta[name="description"]'); if (meta) meta.content = s.descripcion;

  A.$("#crumbs").innerHTML = '<li><a href="index.html">Inicio</a></li><li><a href="servicios.html">Servicios</a></li>' +
    '<li><a href="categoria.html?c=' + c.id + '">' + A.esc(c.nombre) + '</a></li><li aria-current="page">' + A.esc(s.nombre) + "</li>";

  // Galería
  var items = (s.imagenes || []).map(function (src) { return { src: src, alt: s.nombre }; });
  if (!items.length) items.push({ ph: true });
  if ((s.imagenes || []).indexOf("img/hero-spa.jpg") === -1) items.push({ src: "img/hero-spa.jpg", alt: "Instalaciones de Isbell Centro Estético" });
  function itemHTML(it) {
    return it.ph ? A.media(s) : '<img class="media" src="' + it.src + '" alt="' + A.esc(it.alt) + '">';
  }
  var gallery = '<div class="gallery"><div class="gallery__main" id="g-main">' + itemHTML(items[0]) + "</div>" +
    (items.length > 1 ? '<div class="gallery__thumbs" role="group" aria-label="Imágenes del servicio">' + items.map(function (it, i) {
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="Ver imagen ' + (i + 1) + '">' + itemHTML(it) + "</button>";
    }).join("") + "</div>" : "") + "</div>";

  var cta = s.valoracion ? "Solicitar valoración" : (s.categoria === "nutricion" ? "Agendar consulta" : "Reservar cita");
  var info =
    '<div class="detail__info">' +
    '<span class="eyebrow">' + A.esc(c.nombre) + "</span>" +
    "<h1>" + A.esc(s.nombre) + "</h1>" +
    '<ul class="detail__facts">' +
    '<li class="fact">' + A.icon("tag") + "<div><small>Precio</small><strong>" + A.precio(s) + "</strong></div></li>" +
    '<li class="fact">' + A.icon("clock") + "<div><small>Duración</small><strong>" + A.duracion(s) + "</strong></div></li>" +
    "</ul>" +
    '<p class="muted">' + A.esc(s.descripcion) + "</p>" +
    (s.valoracion
      ? '<p class="avail avail--warn">Requiere valoración profesional previa</p>'
      : '<p class="avail">Disponible para reserva con cita previa</p>') +
    '<div class="detail__ctas">' +
    '<a class="btn" href="reservar.html?servicio=' + s.id + '">' + A.icon("calendar") + cta + "</a>" +
    '<a class="btn btn--wa" target="_blank" rel="noopener" href="' + A.wa("Hola Isbell, quisiera información sobre el servicio: " + s.nombre + ".") + '">' + A.WA_SVG + "Consultar por WhatsApp</a>" +
    "</div>" +
    (s.nota ? '<p class="alert alert--info detail__note">' + A.icon("info") + "<span>" + A.esc(s.nota) + "</span></p>" : "") +
    "</div>";
  A.$("#detail").innerHTML = gallery + info;

  A.$$(".gallery__thumbs button").forEach(function (b) {
    b.addEventListener("click", function () {
      A.$("#g-main").innerHTML = itemHTML(items[+b.dataset.i]);
      A.$$(".gallery__thumbs button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    });
  });

  // Contenido
  A.$("#d-consiste").textContent = s.consiste;
  if (s.incluye) {
    A.$("#d-incluye").innerHTML = '<h3 style="margin-top:1.25rem">' + (s.categoria === "nutricion" ? "Puede incluir" : "Incluye") + "</h3>" +
      '<ul class="checks">' + s.incluye.map(li).join("") + "</ul>";
  }
  A.$("#d-beneficios").innerHTML = s.beneficios.map(li).join("");
  function li(t) { return "<li>" + A.icon("check") + "<span>" + A.esc(t) + "</span></li>"; }

  var acc = [
    ["Preparación previa", s.preparacion],
    ["Duración de la sesión", s.duracion ? "La sesión dura aproximadamente " + s.duracion + " minutos. Te recomendamos llegar 10 minutos antes." :
      (s.valoracion ? "La duración se define durante la valoración profesional, según cada caso." : "La duración será confirmada por Isbell al coordinar tu cita.")],
    ["Recomendaciones posteriores", s.posterior],
    ["Contraindicaciones y valoración", s.valoracion
      ? "Este procedimiento requiere una valoración profesional previa para determinar si es adecuado para ti. Infórmanos sobre embarazo, alergias, medicamentos o condiciones de la piel."
      : "Si estás embarazada, tienes alguna lesión, condición de salud o alergia, coméntalo al reservar para adaptar el servicio o recomendarte una valoración."],
    ["Condiciones de cancelación", "Puedes reprogramar o cancelar desde Mis citas o por WhatsApp. Te pedimos avisar con la mayor anticipación posible. Se aplicarán las condiciones que establezca el centro."]
  ];
  A.$("#d-info").innerHTML = acc.map(function (a, i) {
    return '<details class="acc"' + (i === 0 ? " open" : "") + "><summary>" + a[0] + '</summary><div class="acc__body"><p>' + A.esc(a[1]) + "</p></div></details>";
  }).join("");

  // Relacionados: misma categoría primero
  var rel = D.servicios.filter(function (x) { return x.id !== s.id && x.categoria === s.categoria; })
    .concat(D.servicios.filter(function (x) { return x.id !== s.id && x.categoria !== s.categoria && x.destacado; }))
    .slice(0, 3);
  A.$("#d-related").innerHTML = rel.map(A.card).join("");
})();
