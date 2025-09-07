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
const assegnaPartecipante = document.getElementById("assegnaPartecipante");
const logout = document.getElementById("logout");
logout.onclick = () => {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("password");
  window.location.href = "../login.html";
};
/**
 * Al caricamento della pagina viene fatto il render della classifica iniziale
 */
window.onload = () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );
  renderIniziale(idParam, dataParam, assegnaPartecipante);
};

assegnaPartecipante.onclick = () => {
  if (svolto == 1) {
    assegnaPartecipante.classList.add("disabled");
  } else {
    window.location.href =
      "./assegnaTorneo.html?nomeTorneo=" +
      idParam +
      "&data=" +
      dataParam +
      "&svolto=" +
      svolto;
  }
};
