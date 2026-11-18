/* ==========================================================
   Isbell Centro Estético — núcleo compartido
   Encabezado, pie, tarjetas, iconos, almacenamiento local,
   cuentas y citas.
   ========================================================== */
(function () {
  "use strict";
  var D = window.ISBELL;
  var N = D.negocio;

  /* ---------------- utilidades ---------------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function norm(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  function precio(s) { return s.precio == null ? "Consultar precio" : "$" + s.precio.toFixed(2).replace(".", ","); }
  function duracion(s) { return s.duracion == null ? (s.valoracion ? "Según valoración" : "Por confirmar") : s.duracion + " minutos"; }
  function servicio(id) { return D.servicios.filter(function (s) { return s.id === id; })[0] || null; }
  function categoria(id) { return D.categorias.filter(function (c) { return c.id === id; })[0] || null; }

  function wa(text) { return "https://wa.me/" + N.whatsapp + (text ? "?text=" + encodeURIComponent(text) : ""); }

  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  function parseISO(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function toISO(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function fechaLarga(iso) {
    if (!iso) return "Por confirmar";
    var d = parseISO(iso);
    return DIAS[d.getDay()] + " " + d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear();
  }

  /* ---------------- almacenamiento ---------------- */
  var store = {
    get: function (k, def) {
      try { var v = localStorage.getItem("isbell:" + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; }
    },
    set: function (k, v) { try { localStorage.setItem("isbell:" + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem("isbell:" + k); } catch (e) {} }
  };
  var draft = {
    get: function () { try { return JSON.parse(sessionStorage.getItem("isbell:draft")) || {}; } catch (e) { return {}; } },
    set: function (v) { try { sessionStorage.setItem("isbell:draft", JSON.stringify(v)); } catch (e) {} },
    clear: function () { try { sessionStorage.removeItem("isbell:draft"); } catch (e) {} }
  };

  /* ---------------- cuentas (locales a este dispositivo) ---------------- */
  async function hash(text) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("isbell::" + text));
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    }
    var h = 0; for (var i = 0; i < text.length; i++) { h = (h * 31 + text.charCodeAt(i)) | 0; } return "f" + h;
  }
  var auth = {
    users: function () { return store.get("users", []); },
    current: function () {
      var id = store.get("session", null);
      return id ? auth.users().filter(function (u) { return u.id === id; })[0] || null : null;
    },
    register: async function (data) {
      var users = auth.users();
      var email = data.email.trim().toLowerCase();
      if (users.some(function (u) { return u.email === email; })) throw new Error("Ya existe una cuenta con ese correo.");
      var user = {
        id: "u" + Date.now().toString(36), nombre: data.nombre.trim(), apellido: data.apellido.trim(),
        email: email, telefono: data.telefono.trim(), clave: await hash(data.clave), creado: new Date().toISOString()
      };
      users.push(user); store.set("users", users); store.set("session", user.id);
      return user;
    },
    login: async function (email, clave) {
      email = email.trim().toLowerCase();
      var u = auth.users().filter(function (x) { return x.email === email; })[0];
      if (!u || u.clave !== await hash(clave)) throw new Error("Correo o contraseña incorrectos.");
      store.set("session", u.id); return u;
    },
    update: function (id, changes) {
      var users = auth.users().map(function (u) { return u.id === id ? Object.assign({}, u, changes) : u; });
      store.set("users", users);
    },
    remove: function (id) {
      store.set("users", auth.users().filter(function (u) { return u.id !== id; }));
      store.set("citas", citas.all().filter(function (c) { return c.usuario !== id; }));
      store.del("session");
    },
    logout: function () { store.del("session"); },
    hash: hash
  };

  /* ---------------- citas ---------------- */
  var citas = {
    all: function () { return store.get("citas", []); },
    save: function (list) { store.set("citas", list); },
    byCode: function (code) { return citas.all().filter(function (c) { return c.codigo === code; })[0] || null; },
    mine: function () {
      var u = auth.current();
      return citas.all().filter(function (c) { return u ? c.usuario === u.id : !c.usuario; });
    },
    ocupado: function (fecha, hora, excepto) {
      return citas.all().some(function (c) {
        return c.fecha === fecha && c.hora === hora && c.estado !== "cancelada" && c.codigo !== excepto;
      });
    },
    libres: function (fecha, excepto) {
      if (!citas.diaHabil(fecha)) return [];
      var hoy = new Date(), esHoy = fecha === toISO(hoy);
      return D.agenda.horarios.filter(function (h) {
        if (esHoy) {
          var p = h.split(":"); var t = new Date(); t.setHours(+p[0], +p[1], 0, 0);
          if (t <= hoy) return false;
        }
        return !citas.ocupado(fecha, h, excepto);
      });
    },
    diaHabil: function (fecha) {
      var d = parseISO(fecha), hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      var max = new Date(hoy); max.setDate(max.getDate() + D.agenda.diasMaximosAnticipacion);
      return d >= hoy && d <= max && D.agenda.diasLaborables.indexOf(d.getDay()) !== -1;
    },
    codigo: function () {
      var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", c;
      do {
        c = "ISB-";
        for (var i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
      } while (citas.byCode(c));
      return c;
    },
    crear: function (data) {
      // Verificación final de disponibilidad para evitar reservas duplicadas
      if (citas.ocupado(data.fecha, data.hora)) throw new Error("Ese horario acaba de ocuparse. Por favor, elige otro.");
      var list = citas.all();
      var c = Object.assign({ codigo: citas.codigo(), estado: "pendiente", creada: new Date().toISOString() }, data);
      list.push(c); citas.save(list); return c;
    },
    actualizar: function (code, changes) {
      var list = citas.all().map(function (c) { return c.codigo === code ? Object.assign({}, c, changes) : c; });
      citas.save(list); return citas.byCode(code);
    },
    estado: function (c) {
      if (c.estado === "cancelada") return "cancelada";
      if (c.fecha && parseISO(c.fecha) < new Date(new Date().setHours(0, 0, 0, 0))) return "completada";
      return c.estado;
    },
    mensajeWA: function (c) {
      var s = servicio(c.servicio);
      return [
        "Hola Isbell Centro Estético, quisiera confirmar mi solicitud de cita.",
        "",
        "• Código: " + c.codigo,
        "• Servicio: " + (s ? s.nombre : c.servicio),
        "• Fecha: " + fechaLarga(c.fecha),
        "• Hora: " + (c.hora || "Por confirmar"),
        "• Nombre: " + c.nombre + " " + c.apellido,
        "• Teléfono: " + c.telefono,
        "• Pago: " + c.pagoNombre
      ].concat(c.comentario ? ["• Comentarios: " + c.comentario] : []).join("\n");
    }
  };
  var ESTADOS = {
    pendiente: { txt: "Pendiente", cls: "badge--pend" },
    confirmada: { txt: "Confirmada", cls: "badge--ok" },
    completada: { txt: "Completada", cls: "badge--done" },
    cancelada: { txt: "Cancelada", cls: "badge--cancel" }
  };

  /* ---------------- iconos (familia lineal) ---------------- */
  var ICONS = {
    face: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8M9 9.5h.01M15 9.5h.01"/>',
    spa: '<path d="M12 20c-3.5 0-7-2.5-8-6 3 0 6 1.5 8 6Zm0 0c3.5 0 7-2.5 8-6-3 0-6 1.5-8 6Zm0 0c-2-2-3-4.5-3-7.5 0-2.5 1.2-4.8 3-6.5 1.8 1.7 3 4 3 6.5 0 3-1 5.5-3 7.5Z"/>',
    chair: '<path d="M7 4h7a3 3 0 0 1 3 3v6H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM5 13h14l-1 4H6l-1-4ZM8 17l-1 3M16 17l1 3"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7L19 16Z"/>',
    leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    star: '<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7L12 3Z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>',
    shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z"/>',
    pending: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .5 3.2 2 3.5 5"/>',
    home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z"/>',
    quote: '<path d="M9 7H5v6h4v4H7M19 7h-4v6h4v4h-2"/>'
  };
  function icon(name, cls) {
    return '<svg class="icon ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || ICONS.sparkle) + "</svg>";
  }
  var WA_SVG = '<svg class="icon icon--fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c0-.1-.2-.2-.4-.3Z"/></svg>';

  /* ---------------- imágenes de servicio ---------------- */
  function media(s, idx, cls) {
    var imgs = s.imagenes || [];
    var src = imgs[idx || 0];
    if (src) return '<img class="media ' + (cls || "") + '" src="' + src + '" alt="' + esc(s.nombre) + '" loading="lazy">';
    return '<div class="media media--ph ' + (cls || "") + '" role="img" aria-label="' + esc(s.nombre) + '">' +
      icon(s.icono) + '<span>' + esc(s.nombre) + "</span></div>";
  }
  function catMedia(c) {
    if (c.imagen) return '<img class="media" src="' + c.imagen + '" alt="' + esc(c.nombre) + '" loading="lazy">';
    return '<div class="media media--ph" role="img" aria-label="' + esc(c.nombre) + '">' + icon(c.icono) + "</div>";
  }

  /* ---------------- tarjeta estándar de servicio ---------------- */
  function card(s) {
    var c = categoria(s.categoria);
    return '<article class="svc">' +
      '<a class="svc__media" href="servicio.html?id=' + s.id + '" tabindex="-1" aria-hidden="true">' + media(s) +
      '<span class="svc__cat">' + esc(c ? c.nombre : "") + "</span></a>" +
      '<div class="svc__body">' +
      '<h3 class="svc__title"><a href="servicio.html?id=' + s.id + '">' + esc(s.nombre) + "</a></h3>" +
      '<p class="svc__desc">' + esc(s.corto) + "</p>" +
      '<ul class="svc__meta">' +
      "<li>" + icon("clock") + "<span>" + duracion(s) + "</span></li>" +
      '<li class="svc__price' + (s.precio == null ? " is-soft" : "") + '">' + icon("tag") + "<span>" + precio(s) + "</span></li>" +
      "</ul>" +
      (s.valoracion ? '<p class="svc__flag">' + icon("info") + "Requiere valoración previa</p>" : "") +
      "</div>" +
      '<div class="svc__actions">' +
      '<a class="btn btn--sm" href="reservar.html?servicio=' + s.id + '">Reservar cita</a>' +
      '<a class="btn btn--sm btn--outline" href="servicio.html?id=' + s.id + '">Ver detalles</a>' +
      "</div></article>";
  }

  /* ---------------- encabezado ---------------- */
  function header() {
    var page = document.body.getAttribute("data-page") || "";
    var user = auth.current();
    var nav = [
      ["inicio", "index.html", "Inicio"], ["servicios", "servicios.html", "Servicios"],
      ["experiencias", "experiencias.html", "Experiencias"], ["nosotros", "nosotros.html", "Nosotros"],
      ["ayuda", "ayuda.html", "Ayuda"]
    ];
    var simple = document.body.hasAttribute("data-simple-header");
    var el = $("#site-header");
    if (!el) return;
    if (simple) {
      el.outerHTML = '<header class="header header--simple"><div class="container header__inner">' +
        '<a class="brand" href="index.html" aria-label="Isbell Centro Estético, inicio"><img src="img/logo.png" alt="Isbell Centro Estético" class="brand__logo"></a>' +
        '<a class="link-back" href="reservar.html">' + icon("back") + "Volver a la agenda</a></div></header>";
      return;
    }
    el.outerHTML =
      '<a class="skip" href="#main">Saltar al contenido</a>' +
      '<header class="header"><div class="container header__inner">' +
      '<a class="brand" href="index.html" aria-label="Isbell Centro Estético, inicio"><img src="img/logo.png" alt="Isbell Centro Estético" class="brand__logo"></a>' +
      '<nav class="nav" id="nav" aria-label="Principal"><ul>' +
      nav.map(function (n) {
        return '<li><a href="' + n[1] + '"' + (page === n[0] ? ' aria-current="page"' : "") + ">" + n[2] + "</a></li>";
      }).join("") +
      "</ul>" +
      '<div class="nav__extra">' +
      '<a href="buscar.html">' + icon("search") + "Buscar</a>" +
      '<a href="mis-citas.html">' + icon("calendar") + "Mis citas</a>" +
      '<a href="' + (user ? "mi-cuenta.html" : "acceso.html") + '">' + icon("user") + (user ? "Mi cuenta" : "Iniciar sesión") + "</a>" +
      "</div></nav>" +
      '<div class="actions">' +
      '<a class="actions__icon" href="buscar.html" aria-label="Buscar"' + (page === "buscar" ? ' aria-current="page"' : "") + ">" + icon("search") + '<span>Buscar</span></a>' +
      '<a class="actions__icon" href="mis-citas.html"' + (page === "mis-citas" ? ' aria-current="page"' : "") + ">" + icon("calendar") + '<span>Mis citas</span></a>' +
      '<a class="actions__icon actions__user" href="' + (user ? "mi-cuenta.html" : "acceso.html") + '" aria-label="' + (user ? "Mi cuenta" : "Iniciar sesión") + '">' +
      (user ? '<span class="avatar">' + esc(user.nombre.charAt(0).toUpperCase()) + "</span>" : icon("user")) + "</a>" +
      '<a class="btn btn--sm actions__book" href="reservar.html">Reservar cita</a>' +
      '<button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav">' + icon("menu") + "</button>" +
      "</div></div></header>";

    var toggle = $(".nav-toggle"), navEl = $("#nav");
    function set(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      toggle.innerHTML = icon(open ? "close" : "menu");
      navEl.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    }
    toggle.addEventListener("click", function () { set(toggle.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
    var h = $(".header");
    function sc() { h.classList.toggle("is-scrolled", window.scrollY > 8); }
    window.addEventListener("scroll", sc, { passive: true }); sc();
  }

  /* ---------------- pie de página ---------------- */
  function footer() {
    var el = $("#site-footer");
    if (!el) return;
    var redes = N.redes.length
      ? N.redes.map(function (r) { return '<li><a href="' + r.url + '" target="_blank" rel="noopener">' + esc(r.nombre) + "</a></li>"; }).join("")
      : '<li class="muted">Redes sociales: próximamente</li>';
    el.outerHTML =
      '<footer class="footer"><div class="container footer__grid">' +
      '<div class="footer__brand"><img src="img/logo-blanco.png" alt="Isbell Centro Estético" class="footer__logo">' +
      "<p>Centro estético dedicado al cuidado facial y corporal, la relajación y el bienestar personal.</p>" +
      '<p class="footer__lema">' + esc(N.lema) + "</p></div>" +
      '<nav aria-label="Navegación del pie"><h2>Navegación</h2><ul>' +
      '<li><a href="index.html">Inicio</a></li><li><a href="servicios.html">Servicios</a></li>' +
      '<li><a href="experiencias.html">Experiencias</a></li><li><a href="nosotros.html">Nosotros</a></li></ul></nav>' +
      '<nav aria-label="Atención al cliente"><h2>Atención al cliente</h2><ul>' +
      '<li><a href="ayuda.html#faq">Preguntas frecuentes</a></li><li><a href="reservar.html">Reservas</a></li>' +
      '<li><a href="mis-citas.html">Cambios de citas</a></li><li><a href="ayuda.html#politicas">Políticas del servicio</a></li></ul></nav>' +
      '<div><h2>Contacto</h2><ul class="footer__contact">' +
      '<li>' + WA_SVG + '<a href="' + wa() + '" target="_blank" rel="noopener">WhatsApp: ' + N.whatsappVisible + "</a></li>" +
      "<li>" + icon("pin") + "<span>" + esc(N.direccion) + "</span></li>" +
      "<li>" + icon("clock") + "<span>Horario: " + esc(N.horario) + "</span></li>" +
      redes + "</ul></div>" +
      '</div><div class="container footer__bottom"><p>© ' + new Date().getFullYear() + " " + esc(N.nombre) + ". Todos los derechos reservados.</p>" +
      '<p><a href="ayuda.html#politicas">Privacidad y condiciones</a></p></div></footer>' +
      '<a class="wa-float" href="' + wa("Hola, quisiera recibir información sobre los servicios de Isbell Centro Estético.") +
      '" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">' + WA_SVG + "</a>" +
      '<div class="toast" role="status" aria-live="polite"></div>';
  }

  function toast(msg) {
    var t = $(".toast"); if (!t) return;
    t.textContent = msg; t.classList.add("is-show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("is-show"); }, 3200);
  }

  /* ---------------- formularios ---------------- */
  function fieldError(input, msg) {
    var f = input.closest(".field"); if (!f) return;
    var e = f.querySelector(".field__error");
    if (!e) { e = document.createElement("p"); e.className = "field__error"; e.id = (input.id || input.name) + "-err"; f.appendChild(e); }
    e.textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) input.setAttribute("aria-describedby", e.id); else input.removeAttribute("aria-describedby");
  }
  function validar(form, reglas) {
    var ok = true, first = null;
    Object.keys(reglas).forEach(function (name) {
      var input = form.elements[name]; if (!input) return;
      var msg = reglas[name](input.type === "checkbox" ? input.checked : input.value.trim(), input);
      fieldError(input, msg);
      if (msg) { ok = false; if (!first) first = input; }
    });
    if (first) first.focus();
    return ok;
  }
  var R = {
    req: function (m) { return function (v) { return v ? "" : m; }; },
    email: function (opt) {
      return function (v) {
        if (!v) return opt ? "" : "Ingresa tu correo electrónico.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Ingresa un correo válido.";
      };
    },
    tel: function (v) {
      if (!v) return "Ingresa tu número de teléfono.";
      return /^\+?[\d\s-]{7,15}$/.test(v) ? "" : "Ingresa un teléfono válido (solo números).";
    }
  };

  /* ---------------- animación de aparición ---------------- */
  function reveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* Completa iconos y enlaces de WhatsApp declarados en el HTML */
  function hydrate(root) {
    $$("[data-icon]", root).forEach(function (el) {
      el.insertAdjacentHTML("afterbegin", icon(el.getAttribute("data-icon")));
      el.removeAttribute("data-icon");
    });
    $$("[data-wa]", root).forEach(function (el) {
      el.href = wa(el.getAttribute("data-wa"));
      el.target = "_blank"; el.rel = "noopener";
      el.removeAttribute("data-wa");
    });
    $$("[data-wa-icon]", root).forEach(function (el) { el.outerHTML = WA_SVG; });
  }

  window.App = {
    hydrate: hydrate,
    $: $, $$: $$, esc: esc, param: param, norm: norm, precio: precio, duracion: duracion,
    servicio: servicio, categoria: categoria, wa: wa, WA_SVG: WA_SVG, icon: icon, media: media, catMedia: catMedia,
    card: card, store: store, draft: draft, auth: auth, citas: citas, ESTADOS: ESTADOS,
    fechaLarga: fechaLarga, toISO: toISO, parseISO: parseISO, MESES: MESES, DIAS: DIAS,
    toast: toast, validar: validar, fieldError: fieldError, R: R, reveal: reveal
  };

  document.documentElement.classList.add("js");
  header();
  footer();
  hydrate(document);
  document.addEventListener("DOMContentLoaded", reveal);
  if (document.readyState !== "loading") setTimeout(reveal, 0);
})();
