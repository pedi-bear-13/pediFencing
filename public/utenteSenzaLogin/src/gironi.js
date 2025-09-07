//Import moduli
import { renderGironi } from "./render.js";
//Lettura url
const url = new URL(window.location.href);
const idParam = url.searchParams.get("nomeTorneo");
const dataParam = url.searchParams.get("data");
const svolto = url.searchParams.get("svolto");
//Dom - button
const classificaIniziale = document.getElementById("classificaIniziale");
const eliminazioneDiretta = document.getElementById("eliminazioneDiretta");
const gironiMenu = document.getElementById("gironiMenu");
const classificaGironi = document.getElementById("classificaGironi");
const classificaFinale = document.getElementById("classificaFinale");

/**
 * Al caricamento della pagina viene fatto il render dei gironi
 */
window.onload = () => {
  renderGironi(idParam, dataParam, 2);
};

/**
 * Gestione button cambio pagina dai gironi a classifica iniziale
 */
classificaIniziale.onclick = () => {
  window.location.href =
    "./classificaIniziale.html?nomeTorneo=" + idParam + "&data=" + dataParam + "&svolto="+svolto;
};

/**
 * Gestione button cambio pagina dai gironi a se stessa
 */
gironiMenu.onclick = () => {
  window.location.href =
    "./gironi.html?nomeTorneo=" + idParam + "&data=" + dataParam + "&svolto="+svolto;
};

/**
 * Gestione button cambio pagina dai gironi a eliminazione diretta
 */
eliminazioneDiretta.onclick = () => {
  console.log("Non implementata");
};

/**
 * Gestione button cambio pagina da gironi a pagina classifica gironi
 */
classificaGironi.onclick = () => {
  window.location.href =
    "./classificaGironi.html?nomeTorneo=" + idParam + "&data=" + dataParam + "&svolto="+svolto;
};

/**
 * Gestione button cambio pagina da gironi a classifica finale
 */
classificaFinale.onclick = () => {
  console.log("Non implementata");
};