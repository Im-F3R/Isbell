/* Isbell Centro Estético — interacciones */
(function () {
  "use strict";

  var WHATSAPP = "593999202820"; // 0999202820 en formato internacional (Ecuador)

  function waLink(text) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text);
  }

  // Año actual en el pie
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Sombra del header al hacer scroll
  var header = document.querySelector(".header");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menú móvil
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    nav.classList.toggle("is-open", open);
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  // Botones de reserva por servicio → WhatsApp con mensaje prellenado
  document.querySelectorAll(".card__cta[data-service]").forEach(function (a) {
    var service = a.getAttribute("data-service");
    a.href = waLink("Hola Isbell Centro Estético, me gustaría información y agendar una cita para: " + service + ".");
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Filtros de servicios
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".card");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", String(active));
      });
      cards.forEach(function (card) {
        var cats = (card.getAttribute("data-cat") || "").split(" ");
        var show = filter === "todos" || cats.indexOf(filter) !== -1;
        card.classList.toggle("is-hidden", !show);
        if (show) card.classList.add("is-visible");
      });
    });
  });

  // Formulario de reserva → WhatsApp
  var form = document.getElementById("booking-form");
  var dateInput = document.getElementById("f-date");
  if (dateInput) {
    var t = new Date();
    t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
    dateInput.min = t.toISOString().slice(0, 10);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var errorBox = form.querySelector(".form__error");
    var name = form.elements.name;
    var service = form.elements.service;
    var invalid = [];

    [name, service].forEach(function (el) {
      var bad = !el.value.trim();
      el.classList.toggle("is-invalid", bad);
      if (bad) invalid.push(el);
    });

    if (invalid.length) {
      errorBox.textContent = "Por favor, indícanos tu nombre y el servicio que deseas.";
      errorBox.hidden = false;
      invalid[0].focus();
      return;
    }
    errorBox.hidden = true;

    var lines = [
      "Hola Isbell Centro Estético, quisiera solicitar una cita.",
      "",
      "• Nombre: " + name.value.trim(),
      "• Servicio: " + service.value
    ];
    var date = form.elements.date.value;
    if (date) {
      var parts = date.split("-");
      lines.push("• Fecha preferida: " + parts[2] + "/" + parts[1] + "/" + parts[0]);
    }
    if (form.elements.time.value) lines.push("• Horario preferido: " + form.elements.time.value);
    var msg = form.elements.message.value.trim();
    if (msg) lines.push("• Comentarios: " + msg);
    lines.push("", "Quedo atento/a a la confirmación. ¡Gracias!");

    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // Animaciones de aparición
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
