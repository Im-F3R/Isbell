/* Página 1 — Inicio */
(function () {
  var A = App, D = ISBELL;

  function catCard(c) {
    var n = D.servicios.filter(function (s) { return s.categoria === c.id; }).length;
    return '<a class="cat reveal" href="categoria.html?c=' + c.id + '">' +
      '<div class="cat__media">' + A.catMedia(c) + "</div>" +
      '<div class="cat__body"><h3>' + A.esc(c.nombre) + "</h3><p>" + A.esc(c.corto) + "</p>" +
      '<span class="cat__go">' + n + (n === 1 ? " servicio" : " servicios") + " " + A.icon("arrow") + "</span></div></a>";
  }

  A.$("#home-cats").innerHTML = D.categorias.map(catCard).join("");
  A.$("#home-featured").innerHTML = D.servicios.filter(function (s) { return s.destacado; }).slice(0, 4).map(A.card).join("");

  var ao = A.servicio("after-office");
  A.$("#ao-incluye").innerHTML = ao.incluye.map(function (i) {
    return "<li>" + A.icon("check") + "<span>" + A.esc(i) + "</span></li>";
  }).join("");
  A.$("#ao-precio").innerHTML = A.precio(ao) + "<small>precio publicado</small>";
})();
