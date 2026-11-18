/* Página 13 — Nosotros */
(function () {
  var A = App, D = ISBELL;
  A.$("#about-cats").innerHTML = D.categorias.map(function (c) {
    return '<a class="cat" href="categoria.html?c=' + c.id + '"><div class="cat__media">' + A.catMedia(c) + "</div>" +
      '<div class="cat__body"><h3>' + A.esc(c.nombre) + "</h3><p>" + A.esc(c.corto) + '</p><span class="cat__go">Ver servicios ' + A.icon("arrow") + "</span></div></a>";
  }).join("");
  var n = D.negocio.asesora;
  A.$("#asesora-nombre").textContent = n;
  A.$("#asesora-ini").textContent = n.split(" ").map(function (p) { return p.charAt(0); }).join("").slice(0, 2);
})();
