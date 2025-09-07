import {
  recuperaFasi,
  passaFase,
  chiudiTorneo,
  loginControllo,
} from "./cache.js";

const url = new URL(window.location.href);
const idParam = url.searchParams.get("nomeTorneo");
const dataParam = url.searchParams.get("data");
const svolto = url.searchParams.get("svolto");
document.getElementById("logout").onclick = () => {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("password");
  window.location.href = "../login.html";
};

window.onload = () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );
  recuperaFasi({ nomeTorneo: idParam, data: dataParam }).then((response) => {
    spinner.classList.add("d-none");
    data.classList.remove("d-none");
    let stampa = `
<div class="row mt-5">
  <div class="col">
    <div
      class="progress"
      role="progressbar"
      aria-label="Animated striped example"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="progress-bar progress-bar-striped progress-bar-animated"
        style="width:%GROSSO"
      ></div>
    </div>
  </div>
</div>
<div class="row justify-content-start mt-5">
  %BOTTONI
</div>
  `;
    const bottonefase = `
  <div class="col-auto">
  <button class="bottoni-rosa rounded-4 text-white" type="button" id="faseSuccessiva">
    Fase Successiva
</button></div>
  `;
    const bottonechiudi = `
<div class="col-auto">
<button class="bottoni-rosa rounded-4 text-white" type="button" id="chiudiTorneo">
Chiudi Torneo
</button>
</div>
  `;
    let check1,
      check2,
      check3 = false;
    response.forEach((fasi) => {
      if (fasi.tipologia === "Iniziale") {
        check1 = true;
      } else if (fasi.tipologia === "Girone") {
        check2 = true;
      } else if (fasi.tipologia === "ClassificaGirone") {
        check3 = true;
      }
    });
    console.log(check1 + " " + check2 + " " + check3);
    if (check1 && !check2 && !check3 && svolto !== "1") {
      stampa = stampa
        .replace("%GROSSO", "33%")
        .replace("%BOTTONI", bottonefase + bottonechiudi);
    } else if (check1 && check2 && !check3 && svolto !== "1") {
      stampa = stampa
        .replace("%GROSSO", "66%")
        .replace("%BOTTONI", bottonechiudi);
    } else if (check1 && check2 && check3) {
      stampa = stampa.replace("%GROSSO", "100%").replace("%BOTTONI", "");
    }
    document.getElementById("container").innerHTML = stampa;
    if (check1 && !check2 && !check3) {
      document
        .getElementById("faseSuccessiva")
        .addEventListener("click", () => {
          spinner.classList.remove("d-none");
          data.classList.add("d-none");
          passaFase({ nomeTorneo: idParam, data: dataParam }).then(
            (response) => {
              spinner.classList.add("d-none");
              data.classList.remove("d-none");
              console.log(response);
            }
          );
        });
    }
    if (svolto !== "1") {
      document.getElementById("chiudiTorneo").addEventListener("click", () => {
        spinner.classList.remove("d-none");
        data.classList.add("d-none");
        chiudiTorneo({ nomeTorneo: idParam, data: dataParam }).then(
          (response) => {
            window.location.href = "./";
          }
        );
      });
    }
  });
};
