//Import moduli
import { creaClassificaGironi } from "./render.js";
import { recuperaTornei } from "./cache.js";
//Lettura url
const url = new URL(window.location.href);
const idParam = url.searchParams.get("nomeTorneo");
const dataParam = url.searchParams.get("data");
const svolto = url.searchParams.get("svolto");

//Dom - button
const eliminazioneDiretta = document.getElementById("eliminazioneDiretta");
const gironiMenu = document.getElementById("gironiMenu");
const classificaIniziale = document.getElementById("classificaIniziale");
const classificaGironi = document.getElementById("classificaGironi");
const classificaFinale = document.getElementById("classificaFinale");

/**
 * Al caricamento della pagina viene fatto il render della classifica gironi
 */
window.onload = () => {
  recuperaTornei().then((response) => {
    response.forEach((torneo) => {
      if (torneo.nome === idParam && torneo.data === dataParam) {
        const { percentualeEliminazione, nGironi } = torneo;
        creaClassificaGironi(
          idParam,
          dataParam,
          percentualeEliminazione,
          nGironi
        );
      }
    });
  });
};

/**
 * Gestione button cambio pagina da classifica gironi a classifica iniziale
 */
classificaIniziale.onclick = () => {
  window.location.href =
    "./classificaIniziale.html?nomeTorneo=" +
    idParam +
    "&data=" +
    dataParam +
    "&svolto=" +
    svolto;
};

/**
 * Gestione button cambio pagina da classifica gironi a pagina dei gironi
 */
gironiMenu.onclick = () => {
  window.location.href =
    "./gironi.html?nomeTorneo=" +
    idParam +
    "&data=" +
    dataParam +
    "&svolto=" +
    svolto;
};

/**
 * Gestione button cambio pagina da classifica gironi a pagina eliminazione diretta
 */
eliminazioneDiretta.onclick = () => {
  console.log("Non implementata");
};

/**
 * Gestione button cambio pagina da classifica gironi a se stessa
 */
classificaGironi.onclick = () => {
  window.location.href =
    "./classificaGironi.html?nomeTorneo=" +
    idParam +
    "&data=" +
    dataParam +
    "&svolto=" +
    svolto;
};

/**
 * Gestione button cambio pagina da classifica gironi a classifica finale
 */
classificaFinale.onclick = () => {
  console.log("Non implementata");
};
