import { registraPartecipante, loginControllo } from "./cache.js";
//Lettura url
const url = new URL(window.location.href);
const idParam = url.searchParams.get("nomeTorneo");
const dataParam = url.searchParams.get("data");
const svolto = url.searchParams.get("svolto");
const spinner = document.getElementById("spinner");
const data = document.getElementById("data");
//DOM
const nome = document.getElementById("nome");
const cognome = document.getElementById("cognome");
const club = document.getElementById("club");
const ranking = document.getElementById("ranking");
const codiceFis = document.getElementById("codiceFis");
const mail = document.getElementById("mail");
const invia = document.getElementById("invia");
const backIn = document.getElementById("backIn");
const logout = document.getElementById("logout");
const messaggio = document.getElementById("messaggio");

logout.onclick = () => {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("password");
  window.location.href = "../login.html";
};
invia.onclick = async () => {
  if (
    nome.value != "" &&
    cognome.value != "" &&
    club.value != "" &&
    ranking.value != "" &&
    codiceFis.value != ""
  ) {
    const dizionarioTemp = {
      nome: nome.value,
      cognome: cognome.value,
      club: club.value,
      ranking: ranking.value,
      codiceFis: codiceFis.value,
      mail: mail.value,
      nomeTorneo: idParam,
      dataTorneo: dataParam,
    };
    spinner.classList.remove("d-none");
    data.classList.add("d-none");
    const rsp = await registraPartecipante(dizionarioTemp);
    console.log(rsp);
    spinner.classList.add("d-none");
    data.classList.remove("d-none");
    messaggio.innerText = rsp.result;
    cognome.value =
      club.value =
      ranking.value =
      codiceFis.value =
      mail.value =
        "";
    document.getElementById("nome").value = "";
    document.getElementById("cognome").value = "";
    document.getElementById("club").value = "";
    document.getElementById("ranking").value = "";
    document.getElementById("codiceFis").value = "";
    document.getElementById("mail").value = "";
  } else {
    nome.classList.add("border-danger");
    cognome.classList.add("border-danger");
    club.classList.add("border-danger");
    ranking.classList.add("border-danger");
    codiceFis.classList.add("border-danger");
  }
};

backIn.onclick = () => {
  window.location.href =
    "./classificaIniziale.html?nomeTorneo=" +
    idParam +
    "&data=" +
    dataParam +
    "&svolto=" +
    svolto;
};

window.onload = () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );
};
