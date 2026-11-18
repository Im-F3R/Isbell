/* Página 6 — Experiencias de bienestar */
(function () {
  var A = App;
  var ao = A.servicio("after-office");
  A.$("#ao-incluye").innerHTML = ao.incluye.map(function (i) {
    return "<li>" + A.icon("check") + "<span>" + A.esc(i) + "</span></li>";
  }).join("");
  A.$("#ao-precio").innerHTML = A.precio(ao) + "<small>precio publicado</small>";
  A.$("#ao-duracion").textContent = ao.duracion ? ao.duracion + " minutos" : "por confirmar con Isbell";
})();
