/* Página 3 — Categoría de servicio */
(function () {
  var A = App, D = ISBELL;
  var c = A.categoria(A.param("c")) || D.categorias[0];
  document.title = c.nombre + " | Isbell Centro Estético";
  A.$("#cat-name").textContent = c.nombre;
  A.$("#cat-crumb").textContent = c.nombre;
  A.$("#cat-intro").textContent = c.intro;
  A.$("#cat-guia").textContent = c.guia;
  var img = A.$("#cat-img");
  if (c.imagen) img.src = c.imagen; else img.hidden = true;

  A.$("#cat-tabs").innerHTML = D.categorias.map(function (x) {
    var on = x.id === c.id;
    return '<a class="chip' + (on ? " is-active" : "") + '" href="categoria.html?c=' + x.id + '"' +
      (on ? ' aria-current="page"' : "") + ">" + A.icon(x.icono) + A.esc(x.nombre) + "</a>";
  }).join("");

  var list = D.servicios.filter(function (s) { return s.categoria === c.id; });
  A.$("#cat-count").textContent = list.length + (list.length === 1 ? " servicio disponible" : " servicios disponibles");
  A.$("#cat-list").innerHTML = list.map(A.card).join("");
})();
