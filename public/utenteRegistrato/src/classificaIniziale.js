//Import moduli
import { renderIniziale } from "./render.js";
import { loginControllo } from "./cache.js";
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
const logout = document.getElementById("logout");
logout.onclick = () =>{
    sessionStorage.removeItem("username")
    sessionStorage.removeItem("password");
    window.location.href="../login.html"
}
/**
 * Al caricamento della pagina viene fatto il render della classifica iniziale
 */
window.onload = () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );
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
