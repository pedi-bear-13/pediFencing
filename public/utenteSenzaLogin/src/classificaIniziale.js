//Import moduli
import { renderIniziale } from "./render.js";
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
 * Al caricamento della pagina viene fatto il render della classifica iniziale
 */
window.onload = () => {
  renderIniziale(idParam, dataParam);
};

/**
 * Gestione button cambio pagina da classifica iniziale a se stessa
 */
classificaIniziale.onclick = () => {
  window.location.href =
    "./classificaIniziale.html?nomeTorneo=" + idParam + "&data=" + dataParam + "&svolto="+svolto;
};

/**
 * Gestione button cambio pagina da classifica iniziale alla pagina dei gironi
 */
gironiMenu.onclick = () => {
  window.location.href =
    "./gironi.html?nomeTorneo=" + idParam + "&data=" + dataParam + "&svolto="+svolto;
};

/**
 * Gestione button cambio pagina da classifica iniziale alla pagina dell'eliminazione diretta
 */
eliminazioneDiretta.onclick = () => {
  console.log("Non implementata");
};

/**
 * Gestione button cambio pagina da classifica iniziale a pagina classifica gironi
 */
classificaGironi.onclick = () => {
  window.location.href =
    "./classificaGironi.html?nomeTorneo=" + idParam + "&data=" + dataParam + "&svolto="+svolto;
};

/**
 * Gestione button cambio pagina da classifica iniziale a classifica finale
 */
classificaFinale.onclick = () => {
  console.log("Non implementata");
};
