import { creaTorneo, loginControllo } from "./cache.js";

const data = document.getElementById("dataTorneo");
const nome = document.getElementById("nome");
const pel = document.getElementById("pel");
const ngir = document.getElementById("ngir");
const invia = document.getElementById("invia");
const logout = document.getElementById("logout");
const spinner = document.getElementById("spinner");
const datas = document.getElementById("data");
const messaggio = document.getElementById("messaggio");

logout.onclick = () => {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("password");
  window.location.href = "../index.html";
};

invia.onclick = () => {
  let valid = true;

  [data, nome, pel, ngir].forEach((field) => {
    if (!field.value || field.value.trim() === "") {
      field.classList.add("border-danger");
      valid = false;
    } else {
      field.classList.remove("border-danger");
    }
  });

  if (!valid) {
    messaggio.innerText = "Compila tutti i campi obbligatori.";
    return; // interrompe se non validi
  }

  spinner.classList.remove("d-none");
  datas.classList.add("d-none");

  creaTorneo({
    data: data.value,
    nome: nome.value,
    pel: pel.value,
    ngir: ngir.value,
  }).then((response) => {
    messaggio.innerText = response;
    spinner.classList.add("d-none");
    datas.classList.remove("d-none");
    // reset campi
    data.value = "";
    nome.value = "";
    pel.value = "";
    ngir.value = "";
    window.location.href = "./"; // redirect solo se ok
  });
};

window.onload = () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );
};
