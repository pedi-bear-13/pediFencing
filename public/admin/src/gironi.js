//Import moduli
import { renderGironi } from "./render.js";
import { recuperaTornei, loginControllo } from "./cache.js";

//Lettura url
const url = new URL(window.location.href);
const idParam = url.searchParams.get("nomeTorneo");
const dataParam = url.searchParams.get("data");
const svolto = url.searchParams.get("svolto");
const idParamTorneo = url.searchParams.get("id");

//Dom - button
const classificaIniziale = document.getElementById("classificaIniziale");
const eliminazioneDiretta = document.getElementById("eliminazioneDiretta");
const gironiMenu = document.getElementById("gironiMenu");
const classificaGironi = document.getElementById("classificaGironi");
const classificaFinale = document.getElementById("classificaFinale");

// mostra modal di scelta modalità (bootstrap)
const modalHtml = `
  <div class="modal fade" id="modalModalitaGironi" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-4 text-center">
        <h5>Seleziona modalità di creazione gironi</h5>
        <div class="mt-4 d-flex justify-content-around">
          <button class="btn btn-primary" id="modalAuto">Automatico</button>
          <button class="btn btn-secondary" id="modalManuale">Personalizzata</button>
        </div>
      </div>
    </div>
  </div>
  `;
/**
 * Al caricamento della pagina viene fatto il render dei gironi
 */
window.onload = () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );
  recuperaTornei().then((response) => {
    response.forEach((torneo) => {
      if (torneo.Id == idParamTorneo) {
        document.body.insertAdjacentHTML("beforeend", modalHtml);
        const modalEl = document.getElementById("modalModalitaGironi");
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();

        document.getElementById("modalAuto").onclick = () => {
          bsModal.hide();
          renderGironi(
            idParam,
            dataParam,
            torneo.NumeroGironi,
            svolto,
            idParamTorneo
          );
        };

        document.getElementById("modalManuale").onclick = () => {
          bsModal.hide();
          //mostraManuale(numeroGir);
        };
      }
    });
  });
};

/**
 * Gestione button cambio pagina dai gironi a classifica iniziale
 */
classificaIniziale.onclick = () => {
  window.location.href =
    "./classificaIniziale.html?id=" +
    idParamTorneo +
    "&nomeTorneo=" +
    idParam +
    "&data=" +
    dataParam +
    "&svolto=" +
    svolto;
};

/**
 * Gestione button cambio pagina dai gironi a se stessa
 */
gironiMenu.onclick = () => {
  window.location.href =
    "./gironi.html?id=" +
    idParamTorneo +
    "&nomeTorneo=" +
    idParam +
    "&data=" +
    dataParam +
    "&svolto=" +
    svolto;
};

/**
 * Gestione button cambio pagina da gironi a pagina classifica gironi
 */
classificaGironi.onclick = () => {
  window.location.href =
    "./classificaGironi.html?id=" +
    idParamTorneo +
    "&nomeTorneo=" +
    idParam +
    "&data=" +
    dataParam +
    "&svolto=" +
    svolto;
};

/**
 * Gestione button cambio pagina dai gironi a eliminazione diretta
 */
eliminazioneDiretta.onclick = () => {
  console.log("Non implementata");
};

/**
 * Gestione button cambio pagina da gironi a classifica finale
 */
classificaFinale.onclick = () => {
  console.log("Non implementata");
};
