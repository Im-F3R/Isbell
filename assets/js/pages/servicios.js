/* Página 2 — Catálogo de servicios */
(function () {
  var A = App, D = ISBELL;
  var form = A.$("#filters"), results = A.$("#results"), q = A.$("#q"), sort = A.$("#sort"), count = A.$("#count");

  A.$("#f-cat").insertAdjacentHTML("beforeend", D.categorias.map(function (c) {
    return '<label class="check"><input type="checkbox" name="cat" value="' + c.id + '"> ' + A.esc(c.nombre) + "</label>";
  }).join(""));

  // Estado inicial desde la URL (?cat=facial&q=...&orden=...)
  var p = new URLSearchParams(location.search);
  if (p.get("q")) q.value = p.get("q");
  (p.get("cat") || "").split(",").forEach(function (c) {
    var el = form.querySelector('input[name="cat"][value="' + c + '"]'); if (el) el.checked = true;
  });
  if (p.get("orden")) sort.value = p.get("orden");

  function checked(name) { return A.$$('input[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); }

  function matchPrecio(s, sel) {
    if (!sel.length) return true;
    return sel.some(function (r) {
      if (r === "consultar") return s.precio == null;
      if (s.precio == null) return false;
      var b = r.split("-"); return s.precio >= +b[0] && s.precio <= +b[1];
    });
  }
  function matchDur(s, sel) {
    if (!sel.length) return true;
    return sel.some(function (r) {
      if (r === "na") return s.duracion == null;
      return s.duracion != null && s.duracion <= +r;
    });
  }
  function matchText(s, t) {
    if (!t) return true;
    var c = A.categoria(s.categoria);
    var hay = A.norm([s.nombre, s.corto, s.descripcion, s.palabras, c && c.nombre].join(" "));
    return A.norm(t).split(/\s+/).every(function (w) { return hay.indexOf(w.length > 4 ? w.slice(0, -1) : w) !== -1; });
  }

  function render() {
    var cats = checked("cat"), pr = checked("precio"), du = checked("dur"), t = q.value.trim();
    var list = D.servicios.filter(function (s) {
      return (!cats.length || cats.indexOf(s.categoria) !== -1) && matchPrecio(s, pr) && matchDur(s, du) && matchText(s, t);
    });
    var o = sort.value;
    if (o === "nombre") list.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); });
    if (o === "precio-asc" || o === "precio-desc") {
      var dir = o === "precio-asc" ? 1 : -1;
      list.sort(function (a, b) {
        if (a.precio == null && b.precio == null) return 0;
        if (a.precio == null) return 1;
        if (b.precio == null) return -1;
        return (a.precio - b.precio) * dir;
      });
    }
    count.textContent = list.length + (list.length === 1 ? " servicio disponible" : " servicios disponibles");
    results.innerHTML = list.length ? list.map(A.card).join("") :
      '<div class="empty fade-in"><div class="empty__icon">' + A.icon("search") + "</div>" +
      "<h2>No encontramos servicios con esos filtros</h2><p>Prueba con otros criterios o revisa el catálogo completo.</p>" +
      '<button class="btn" type="button" id="reset-all">Ver todos los servicios</button></div>';
    var r = A.$("#reset-all"); if (r) r.addEventListener("click", resetAll);

    // Mantener la URL compartible
    var u = new URLSearchParams();
    if (t) u.set("q", t);
    if (cats.length) u.set("cat", cats.join(","));
    if (o !== "relevancia") u.set("orden", o);
    history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : ""));
  }
  function resetAll() { form.reset(); q.value = ""; sort.value = "relevancia"; setTimeout(render, 0); }

  form.addEventListener("change", render);
  form.addEventListener("reset", function () { setTimeout(render, 0); });
  q.addEventListener("input", render);
  sort.addEventListener("change", render);

  var tg = A.$(".filters-toggle");
  tg.addEventListener("click", function () {
    var open = tg.getAttribute("aria-expanded") !== "true";
    tg.setAttribute("aria-expanded", String(open));
    form.classList.toggle("is-open", open);
  });
  render();
})();
