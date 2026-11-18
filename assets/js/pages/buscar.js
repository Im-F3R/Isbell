/* Página 4 — Resultados de búsqueda */
(function () {
  var A = App, D = ISBELL;
  var term = (A.param("q") || "").trim();
  var input = A.$("#search-q"), out = A.$("#search-results"), sum = A.$("#search-summary");
  input.value = term;

  A.$("#search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    location.href = "buscar.html" + (v ? "?q=" + encodeURIComponent(v) : "");
  });

  if (!term) {
    sum.textContent = "Escribe un término para buscar entre nuestros " + D.servicios.length + " servicios. Mientras tanto, estos son los destacados:";
    out.innerHTML = D.servicios.filter(function (s) { return s.destacado; }).map(A.card).join("");
    input.focus();
    return;
  }

  var words = A.norm(term).split(/\s+/).filter(Boolean);
  var scored = D.servicios.map(function (s) {
    var c = A.categoria(s.categoria);
    var name = A.norm(s.nombre);
    var rest = A.norm([s.corto, s.descripcion, s.palabras, c && c.nombre, (s.beneficios || []).join(" ")].join(" "));
    var score = 0;
    words.forEach(function (w) {
      var stem = w.length > 4 ? w.slice(0, -1) : w; // "masajes" → "masaje"
      if (name.indexOf(stem) !== -1) score += 3;
      else if (rest.indexOf(stem) !== -1) score += 1;
    });
    return { s: s, score: score };
  }).filter(function (x) { return x.score > 0; })
    .sort(function (a, b) { return b.score - a.score; });

  document.title = "«" + term + "» | Buscar | Isbell Centro Estético";
  if (!scored.length) {
    sum.textContent = "";
    out.innerHTML = '<div class="empty"><div class="empty__icon">' + A.icon("search") + "</div>" +
      "<h2>No encontramos tratamientos relacionados con tu búsqueda</h2>" +
      "<p>No hay resultados para «" + A.esc(term) + "». Revisa la ortografía o explora el catálogo completo.</p>" +
      '<div class="btn-row" style="justify-content:center"><a class="btn" href="servicios.html">Explorar servicios</a>' +
      '<a class="btn btn--wa" target="_blank" rel="noopener" href="' + A.wa("Hola Isbell, quisiera información sobre: " + term) + '">' +
      A.WA_SVG + "Consultar por WhatsApp</a></div></div>";
    return;
  }
  sum.innerHTML = scored.length + (scored.length === 1 ? " resultado" : " resultados") +
    " para «<strong>" + A.esc(term) + "</strong>»";
  out.innerHTML = scored.map(function (x) { return A.card(x.s); }).join("");
})();
