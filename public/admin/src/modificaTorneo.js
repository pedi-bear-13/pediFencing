import { modificaTorneo, recuperaTornei, loginControllo } from "./cache.js";

const data = document.getElementById("dataTorneo");
const nome = document.getElementById("nome");
const pel = document.getElementById("pel");
const ngir = document.getElementById("ngir");
const invia = document.getElementById("invia");
const logout = document.getElementById("logout");
const spinner = document.getElementById("spinner");
const datas = document.getElementById("data");
const messaggio = document.getElementById("messaggio");

//Lettura url
const url = new URL(window.location.href);
const idParam = url.searchParams.get("nomeTorneo");
const dataParam = url.searchParams.get("data");
const idParamTorneo = url.searchParams.get("id");

logout.onclick = () => {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("password");
  window.location.href = "../index.html";
};

invia.onclick = () => {
  spinner.classList.remove("d-none");
  datas.classList.add("d-none");
  modificaTorneo({
    id: idParamTorneo,
    data: data.value,
    nome: nome.value,
    pel: pel.value,
    ngir: ngir.value,
  }).then((response) => {
    messaggio.innerText = response;
    spinner.classList.add("d-none");
    datas.classList.remove("d-none");

    if (response === "Torneo modificato con successo") {
      // rimuovo eventuali errori grafici
      data.classList.remove("border-danger");
      nome.classList.remove("border-danger");
      pel.classList.remove("border-danger");
      ngir.classList.remove("border-danger");
    } else {
      // evidenzia campi in rosso
      data.classList.add("border-danger");
      nome.classList.add("border-danger");
      pel.classList.add("border-danger");
      ngir.classList.add("border-danger");
    }
  });
};

window.onload = async () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );
  recuperaTornei().then((tornei) => {
    spinner.classList.add("d-none");
    data.classList.remove("d-none");
    if (idParam && tornei && tornei.length > 0) {
      for (const torneo of tornei) {
        if (
          String(torneo.Nome) === String(idParam) &&
          String(torneo.Giorno) === String(dataParam)
        ) {
          // pre-popolo i campi con i dati del torneo trovato
          data.value = torneo.Giorno;
          nome.value = torneo.Nome;
          pel.value = torneo.PercentualeEliminati;
          ngir.value = torneo.NumeroGironi;
          break; // trovato, esco dal ciclo
        }
      }
    }
  });
};
