import { creaTorneo, loginControllo } from "./cache.js";
const data = document.getElementById("dataTorneo");
const nome = document.getElementById("nome");
const provincia = document.getElementById("provincia");
const luogo = document.getElementById("luogo");
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
  window.location.href = "../login.html";
};

invia.onclick = () => {
  spinner.classList.remove("d-none");
  datas.classList.add("d-none");
  console.log("data.value: " + data.value);
  creaTorneo({
    data: data.value,
    nome: nome.value,
    provincia: provincia.value,
    luogo: luogo.value,
    pel: pel.value,
    ngir: ngir.value,
  }).then((response) => {
    messaggio.innerText = response;
    console.log(response);
    spinner.classList.add("d-none");
    datas.classList.remove("d-none");
    if (response === "ok") {
      if (data.classList.contains("border-danger")) {
        data.classList.remove("border-danger");
        nome.classList.remove("border-danger");
        provincia.classList.remove("border-danger");
        luogo.classList.remove("border-danger");
        pel.classList.remove("border-danger");
        ngir.classList.remove("border-danger");
      }
      data.value =
        nome.value =
        provincia.value =
        luogo.value =
        pel.value =
        ngir.value =
          "";
    } else {
      data.classList.add("border-danger");
      nome.classList.add("border-danger");
      provincia.classList.add("border-danger");
      luogo.classList.add("border-danger");
      pel.classList.add("border-danger");
      ngir.classList.add("border-danger");
    }
  });
  document.getElementById("data").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("provincia").value = "";
  document.getElementById("luogo").value = "";
  document.getElementById("pel").value = "";
  document.getElementById("ngir").value = "";
  window.location.href = "./";
};

window.onload = () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );
};
