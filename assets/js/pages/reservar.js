/* Página 7 — Agendamiento de citas */
(function () {
  var A = App, D = ISBELL;
  var reprogCode = A.param("reprogramar");
  var reprog = reprogCode ? A.citas.byCode(reprogCode) : null;
  var st = A.draft.get();

  if (reprog) {
    st = { servicio: reprog.servicio, fecha: null, hora: null };
    A.$("#r-title").textContent = "Reprogramar cita";
    A.$("#r-sub").textContent = "Elige una nueva fecha y horario para tu cita.";
    var al = A.$("#r-reprog");
    al.hidden = false;
    al.innerHTML = A.icon("info") + "<span>Estás reprogramando la cita <strong>" + A.esc(reprog.codigo) + "</strong>, agendada para el " +
      A.fechaLarga(reprog.fecha) + " a las " + A.esc(reprog.hora) + ".</span>";
    A.$("#r-continue").textContent = "Confirmar nuevo horario";
    A.$(".steps-bar").hidden = true;
  } else if (A.param("servicio") && A.servicio(A.param("servicio"))) {
    if (st.servicio !== A.param("servicio")) st = { servicio: A.param("servicio") };
  }
  if (!st.servicio || !A.servicio(st.servicio)) st.servicio = null;
  // Si el horario guardado ya no está libre, se descarta
  if (st.fecha && (!A.citas.diaHabil(st.fecha) || A.citas.libres(st.fecha).indexOf(st.hora) === -1)) { st.hora = null; }
  if (st.fecha && !A.citas.diaHabil(st.fecha)) st.fecha = null;

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + D.agenda.diasMaximosAnticipacion);
  var view = st.fecha ? A.parseISO(st.fecha) : new Date(today);
  view.setDate(1);

  /* ---- 1. Servicio ---- */
  var sel = A.$("#svc-select");
  sel.innerHTML = '<option value="">Selecciona un servicio</option>' + D.categorias.map(function (c) {
    return '<optgroup label="' + A.esc(c.nombre) + '">' + D.servicios.filter(function (s) { return s.categoria === c.id; }).map(function (s) {
      return '<option value="' + s.id + '">' + A.esc(s.nombre) + " — " + A.precio(s) + "</option>";
    }).join("") + "</optgroup>";
  }).join("");
  sel.disabled = !!reprog;
  sel.addEventListener("change", function () { st.servicio = sel.value || null; save(); renderService(); renderSummary(); });

  function renderService() {
    sel.value = st.servicio || "";
    var s = st.servicio && A.servicio(st.servicio);
    A.$("#svc-selected").innerHTML = s
      ? '<div class="svc-pick fade-in"><div class="svc-pick__img">' + A.media(s) + "</div><div>" +
        "<h3>" + A.esc(s.nombre) + "</h3>" +
        '<div class="svc-pick__meta"><p>' + A.icon("clock") + " " + A.duracion(s) + "</p><p><strong>" + A.precio(s) + "</strong></p></div>" +
        (s.valoracion ? '<p class="svc__flag">' + A.icon("info") + "Incluye valoración profesional previa</p>" : "") +
        '<p style="margin-top:.35rem"><a class="link" href="servicio.html?id=' + s.id + '">Ver detalles</a></p></div></div>'
      : '<p class="muted">Aún no has elegido un servicio. Selecciónalo en la lista o <a class="link" href="servicios.html">explora el catálogo</a>.</p>';
  }

  /* ---- 2. Calendario ---- */
  var DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  function renderCal() {
    var y = view.getFullYear(), m = view.getMonth();
    A.$("#cal-month").textContent = A.MESES[m] + " " + y;
    A.$("#cal-prev").disabled = y === today.getFullYear() && m === today.getMonth();
    A.$("#cal-next").disabled = new Date(y, m + 1, 1) > maxDate;
    var first = (new Date(y, m, 1).getDay() + 6) % 7; // lunes = 0
    var days = new Date(y, m + 1, 0).getDate();
    var html = DOW.map(function (d) { return '<div class="cal__dow" aria-hidden="true">' + d + "</div>"; }).join("");
    for (var i = 0; i < first; i++) html += '<div class="cal__empty"></div>';
    for (var d = 1; d <= days; d++) {
      var date = new Date(y, m, d), iso = A.toISO(date);
      var libres = A.citas.libres(iso, reprog && reprog.codigo);
      var off = !libres.length;
      var label = A.fechaLarga(iso) + (off ? ", sin disponibilidad" : ", " + libres.length + " horarios libres");
      html += '<button type="button" class="cal__day' + (date.getTime() === today.getTime() ? " is-today" : "") + '" data-date="' + iso + '"' +
        (off ? " disabled" : "") + ' aria-pressed="' + (st.fecha === iso) + '" aria-label="' + label + '">' + d + "</button>";
    }
    A.$("#cal-grid").innerHTML = html;
  }
  A.$("#cal-grid").addEventListener("click", function (e) {
    var b = e.target.closest(".cal__day"); if (!b || b.disabled) return;
    st.fecha = b.dataset.date; st.hora = null; save();
    renderCal(); renderSlots(); renderSummary();
    var first = A.$(".slot"); if (first && window.innerWidth < 960) A.$("#p3").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  A.$("#cal-prev").addEventListener("click", function () { view.setMonth(view.getMonth() - 1); renderCal(); });
  A.$("#cal-next").addEventListener("click", function () { view.setMonth(view.getMonth() + 1); renderCal(); });

  /* ---- 3. Horarios ---- */
  function renderSlots() {
    var box = A.$("#slots");
    if (!st.fecha) { box.innerHTML = '<p class="muted">Selecciona primero una fecha para ver los horarios libres.</p>'; return; }
    var libres = A.citas.libres(st.fecha, reprog && reprog.codigo);
    box.innerHTML = '<p class="small muted" style="margin-bottom:.75rem">Horarios libres para el <strong>' + A.fechaLarga(st.fecha) + "</strong>:</p>" +
      (libres.length ? '<div class="slots" role="group" aria-label="Horarios disponibles">' + libres.map(function (h) {
        return '<button type="button" class="slot" data-h="' + h + '" aria-pressed="' + (st.hora === h) + '">' + h + "</button>";
      }).join("") + "</div>" : '<p class="muted">No quedan horarios libres para este día. Elige otra fecha.</p>');
  }
  A.$("#slots").addEventListener("click", function (e) {
    var b = e.target.closest(".slot"); if (!b) return;
    st.hora = b.dataset.h; save();
    A.$$(".slot").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    renderSummary();
  });

  /* ---- 4. Resumen ---- */
  function renderSummary() {
    var s = st.servicio && A.servicio(st.servicio);
    A.$("#summary").innerHTML =
      "<li><span>Servicio</span><span>" + (s ? A.esc(s.nombre) : "—") + "</span></li>" +
      "<li><span>Fecha</span><span>" + (st.fecha ? A.fechaLarga(st.fecha) : "—") + "</span></li>" +
      "<li><span>Hora</span><span>" + (st.hora || "—") + "</span></li>" +
      "<li><span>Duración</span><span>" + (s ? A.duracion(s) : "—") + "</span></li>" +
      '<li class="summary__total"><span>Precio</span><span>' + (s ? A.precio(s) : "—") + "</span></li>";
    A.$("#r-error").hidden = true;
  }

  function save() { if (!reprog) A.draft.set(st); }

  A.$("#r-continue").addEventListener("click", function () {
    var err = A.$("#r-error");
    var msg = !st.servicio ? "Selecciona un servicio." : !st.fecha ? "Selecciona una fecha." : !st.hora ? "Selecciona un horario." : "";
    // Verificación de disponibilidad antes de continuar
    if (!msg && A.citas.ocupado(st.fecha, st.hora, reprog && reprog.codigo)) {
      msg = "Ese horario acaba de ocuparse. Por favor, elige otro.";
      st.hora = null; save(); renderCal(); renderSlots(); renderSummary();
    }
    if (msg) { err.textContent = msg; err.hidden = false; return; }

    if (reprog) {
      A.citas.actualizar(reprog.codigo, { fecha: st.fecha, hora: st.hora, estado: "pendiente", reprogramada: new Date().toISOString() });
      location.href = "confirmacion.html?codigo=" + encodeURIComponent(reprog.codigo) + "&reprogramada=1";
      return;
    }
    save();
    location.href = "datos.html";
  });

  renderService(); renderCal(); renderSlots(); renderSummary();
})();
