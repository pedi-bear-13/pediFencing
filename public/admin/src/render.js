//Import moduli
import { recuperaTornei, recuperaAtleta, eliminaTorneo } from "./cache.js";
const spinner = document.getElementById("spinner");
const data = document.getElementById("data");
//------------------------- INIZIO PAGINA PRINCIPALE TORNEI ---------------------------------------
//Dom
const torneiTable = document.getElementById("tornei-container");
// template tornei - template
const templateFirstTornei = `<div class="row mt-5"><div class="col-12">%value</div></div>`;
const templateTdTornei = `<div class="col-6 mt-2" >%value</div>`;
const templateDivTornei = `
  <div class="card designInput rounded-pill %DIM torneo" id="%ID">
    <div class="card-body">
      <div class="row justify-content-between fs-3 text-white">
        <div class="col-auto">
          <svg height="40" width="40">
            <circle cx="20" cy="20" r="20" fill="%STATUS" />
          </svg>
          <p class="badge text-wrap">%TITOLO</p>
        </div>
        <div class="col-auto"> 
        <button class="bottoni-barra modifica" id="%COUNT" type="button" %disabled>
          <img src="../edit.svg" class="pedi-icon" />
      </button>
        <button class="bottoni-barra elimina" id="%COUNT" type="button">
          <img src="../bin.svg" class="pedi-icon" />
      </button></div>
      </div>
    </div>
  </div>
`;
/**
 * Funzione per il rendering in finestra dei tornei
 */
export const renderTornei = () => {
  recuperaTornei().then((tornei) => {
    spinner.classList.add("d-none");
    data.classList.remove("d-none");
    if (tornei) {
      let row = "";
      if (tornei.length > 0) {
        const { nome, svolto } = tornei[0];
        // prendo il primo valore
        row = templateFirstTornei.replace(
          "%value",
          templateDivTornei
            .replace("%DIM", "w-100")
            .replace("%ID", nome + "_" + tornei[0].data + "_" + svolto)
            .replace("%TITOLO", nome)
            .replaceAll("%COUNT", nome + "_" + tornei[0].data + "_" + svolto)
            .replace("%STATUS", svolto ? "red" : "green")
            .replace("%disabled", svolto ? "disabled" : " ")

        );

        if (tornei.length > 1) {
          row += `<div class="row mt-2">`;
          for (let i = 1; i < tornei.length; i++) {
            const { nome, svolto } = tornei[i];
            row += templateTdTornei.replace(
              "%value",
              templateDivTornei
                .replace("%DIM", "w-100")
                .replace("%ID", nome + "_" + tornei[i].data + "_" + svolto)
                .replace("%TITOLO", nome)
                .replaceAll("%COUNT", nome + "_" + tornei[i].data + "_" + svolto)
                .replace("%STATUS", svolto ? "red" : "green")
                .replace("%disabled", svolto ? "disabled" : " ")
            );
            if (i % 2 === 0) {
              row += `</div><div class="row mt-2">`;
            }
          }
          row += `</div>`;
        }
        torneiTable.innerHTML = row;
        document.querySelectorAll(".torneo").forEach((div) => {
          div.addEventListener("click", (event) => {
            const id = event.currentTarget.id.split("_");
            window.location.href =
              "./classificaIniziale.html?nomeTorneo=" +
              id[0] +
              "&data=" +
              id[1] +
              "&svolto=" +
              id[2];
          });
        });
        document.querySelectorAll(".elimina").forEach((div) => {
          div.addEventListener("click", (event) => {
            event.stopPropagation(); //evita di considerare ulteriori click, come quello sulla card
            const id = event.currentTarget.id.split("_");
            spinner.classList.remove("d-none");
            data.classList.add("d-none");
            console.log({ nome: id[0], data: id[1] });
            eliminaTorneo({ nome: id[0], data: id[1] }).then((response) => {
              window.location.reload();
            });
          });
        });
        document.querySelectorAll(".modifica").forEach((div) => {
          div.addEventListener("click", (event) => {
            event.stopPropagation(); //evita di considerare ulteriori click, come quello sulla card
            const id = event.currentTarget.id.split("_");
            window.location.href =
              "./statoTorneo.html?nomeTorneo=" +
              id[0] +
              "&data=" +
              id[1] +
              "&svolto=" +
              id[2];
          });
        });
      }
    }
  });
};

//------------------------- FINE PAGINA PRINCIPALE TORNEI ---------------------------------------
//------------------------- INIZIO PAGINA CLASSIFICA INIZIALE ---------------------------------------

//table - DOM
const classificaIniziale = document.getElementById("classificaInizialeTabella");
//template
const templateIniziale = `<tr><th>INDICE</th><th>COGNOME NOME</th><th>RANK</th><th>SOCIETA</th></tr>`;

/**
 * Funzione per il rendering in finestra della pagina iniziale - la pagina della classifica iniziale
 * @param {*} nometorneo
 * @param {*} data
 */
export const renderIniziale = (nometorneo, dataT) => {
  recuperaAtleta(nometorneo, dataT).then((response) => {
    spinner.classList.add("d-none");
    data.classList.remove("d-none");
    //sorting dell'array per ranking dal minore al maggiore
    if (response) {
      response = response.sort((a, b) => a.ranking - b.ranking);
      let html = "";
      html = templateIniziale;
      response.forEach((element, index) => {
        const { societa, ranking, nome, cognome } = element;
        html += templateIniziale
          .replaceAll("th>", "td>")
          .replace("INDICE", index + 1)
          .replace("COGNOME NOME", nome + " " + cognome)
          .replace("RANK", ranking)
          .replace("SOCIETA", societa);
      });
      classificaIniziale.innerHTML = html;
    }
  });
};

//------------------------- FINE PAGINA CLASSIFICA INIZIALE  ---------------------------------------
