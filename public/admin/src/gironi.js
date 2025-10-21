//Import moduli
import { renderGironi } from "./render.js";
import { recuperaTornei, loginControllo, recuperaGironi } from "./cache.js";

// Lettura URL
const url = new URL(window.location.href);
const idParam = url.searchParams.get("nomeTorneo");
const dataParam = url.searchParams.get("data");
const svolto = url.searchParams.get("svolto");
const idParamTorneo = url.searchParams.get("id");

// DOM buttons
const classificaIniziale = document.getElementById("classificaIniziale");
const eliminazioneDiretta = document.getElementById("eliminazioneDiretta");
const gironiMenu = document.getElementById("gironiMenu");
const classificaGironi = document.getElementById("classificaGironi");
const classificaFinale = document.getElementById("classificaFinale");

// elementi di controllo visuale
const spinnerEl = document.getElementById("spinner");
const dataEl = document.getElementById("data");

// Modal scelta modalità (bootstrap)
const modalHtml = `
  <div class="modal fade" id="modalModalitaGironi" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-4 text-center">
        <h5>Seleziona modalità di creazione gironi</h5>
        <div class="mt-4 d-flex justify-content-around">
          <button class="btn btn-primary" id="modalAuto">Automatico</button>
          <button class="btn btn-secondary" id="modalManuale">Personalizzata</button>
        </div>
      </div>
    </div>
  </div>
`;

/**
 * Al caricamento della pagina viene fatto il render dei gironi
 */
window.onload = () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );

  recuperaTornei().then((response) => {
    response.forEach((torneo) => {
      if (torneo.Id == idParamTorneo) {
        recuperaGironi(idParamTorneo).then((response2) => {
          let controlloGironi = false;
          for (let i = 0; i < response2.length; i++) {
            if (response2[i].Girone == 0 || response2[i].Girone == null) {
              controlloGironi = true;
            }
          }

          if (controlloGironi) {
            document.body.insertAdjacentHTML("beforeend", modalHtml);
            const modalEl = document.getElementById("modalModalitaGironi");
            const bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();

            document.getElementById("modalAuto").onclick = () => {
              bsModal.hide();
              renderGironi(
                idParam,
                dataParam,
                Number(torneo.NumeroGironi),
                svolto,
                idParamTorneo,
                controlloGironi,
                []
              );
            };

            document.getElementById("modalManuale").onclick = () => {
              bsModal.hide();
              mostraManuale(torneo, response2);
            };
          } else {
            // Numero gironi
            const numeroGironi = Number(torneo.NumeroGironi) || 1;

            // Trasforma response2 (lista completa degli atleti) in array di array per gironi
            const gironiFinali = [];
            for (let i = 0; i < numeroGironi; i++) {
              gironiFinali[i] = response2
                .filter((a) => Number(a.Girone) === i + 1)
                .map((a) => ({
                  CodiceFIS: a.CodiceFIS ?? a.codiceFIS ?? a.Codice,
                  Nome: a.Nome ?? a.nome ?? "-",
                  Cognome: a.Cognome ?? a.cognome ?? "-",
                  Ranking: a.Ranking ?? a.rank ?? 0,
                  Girone: Number(a.Girone) || 0,
                }))
                // opzionale: ordina per ranking
                .sort((x, y) => x.Ranking - y.Ranking);
            }
            renderGironi(
              idParam,
              dataParam,
              numeroGironi,
              svolto,
              idParamTorneo,
              controlloGironi,
              gironiFinali
            );
          }
        });
      }
    });
  });
};

/**
 * 🧩 Modalità manuale con interfaccia per assegnazione gironi
 */
const mostraManuale = (torneo, listaGironi) => {
  if (spinnerEl) spinnerEl.classList.add("d-none");
  if (dataEl) dataEl.classList.remove("d-none");

  const container = document.getElementById("tableGironi");
  if (!container) return;
  container.innerHTML = "";

  const numeroGironi = Number(torneo.NumeroGironi) || 1;

  const wrapper = document.createElement("div");
  wrapper.classList.add("col-10", "mt-5");

  let html = `
    <div class="card p-4 pedi-card">
      <h3 class="text-center mb-4 text-white fw-bold">Assegna manualmente i gironi</h3>
      <table class="table pedi-tabella text-center align-middle">
        <thead style="background-color: var(--accent-rosa); color: var(--text-light);">
          <tr>
            <th>#</th>
            <th>Nome Atleta</th>
            <th>Ranking</th>
            <th>Girone</th>
          </tr>
        </thead>
        <tbody>
  `;

  listaGironi.forEach((atleta, index) => {
    const nome = atleta.Nome ?? atleta.nome ?? "-";
    const cognome = atleta.Cognome ?? atleta.cognome ?? "-";
    const codice =
      atleta.CodiceFIS ?? atleta.codiceFIS ?? atleta.Codice ?? index;
    const gironeVal = atleta.Girone != null ? Number(atleta.Girone) : 0;
    const ranking = atleta.Ranking ?? atleta.rank ?? "-";

    let options = `<option value="0"${
      gironeVal === 0 ? " selected" : ""
    }>Non assegnato</option>`;
    for (let i = 1; i <= numeroGironi; i++) {
      options += `<option value="${i}"${
        gironeVal === i ? " selected" : ""
      }>Girone ${i}</option>`;
    }

    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${cognome} ${nome}</td>
        <td>${ranking}</td>
        <td>
          <select class="form-select girone-select"
                  data-codice="${codice}"
                  data-nome="${nome}"
                  data-cognome="${cognome}"
                  data-ranking="${ranking}"
                  style="background-color: var(--bg-panel); color: var(--text-light); border: 1px solid var(--border-light);">
            ${options}
          </select>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
      <div class="text-center mt-4">
        <button id="confermaGironiManuale" class="btn btn-rosa btn-lg px-5">
          Conferma Assegnazioni
        </button>
      </div>
    </div>
  `;

  wrapper.innerHTML = html;
  container.appendChild(wrapper);

  // Gestione click conferma
  const confermaBtn = document.getElementById("confermaGironiManuale");
  if (!confermaBtn) return;

  confermaBtn.onclick = () => {
    const selezioni = document.querySelectorAll(".girone-select");
    const assegnazioniPiatte = [];

    selezioni.forEach((sel) => {
      const codiceFIS = sel.getAttribute("data-codice");
      const nome = sel.getAttribute("data-nome");
      const cognome = sel.getAttribute("data-cognome");
      const ranking = parseInt(sel.getAttribute("data-ranking"), 10) || 0;
      const gironeNum = parseInt(sel.value, 10) || 0;

      assegnazioniPiatte.push({
        CodiceFIS: codiceFIS,
        Nome: nome,
        Cognome: cognome,
        Ranking: ranking,
        Girone: gironeNum,
      });
    });

    // Trasforma in array di array per gironi ordinati
    const gironiFinali = [];
    for (let i = 0; i < numeroGironi; i++) {
      gironiFinali[i] = assegnazioniPiatte.filter((a) => a.Girone === i + 1);
    }
    renderGironi(
      idParam,
      dataParam,
      numeroGironi,
      svolto,
      idParamTorneo,
      true,
      gironiFinali
    );
    window.location.reload();
  };
};

/**
 * Gestione bottoni di navigazione
 */
classificaIniziale.onclick = () => {
  window.location.href =
    "./classificaIniziale.html?id=" +
    idParamTorneo +
    "&nomeTorneo=" +
    idParam +
    "&data=" +
    dataParam +
    "&svolto=" +
    svolto;
};

gironiMenu.onclick = () => {
  window.location.href =
    "./gironi.html?id=" +
    idParamTorneo +
    "&nomeTorneo=" +
    idParam +
    "&data=" +
    dataParam +
    "&svolto=" +
    svolto;
};

classificaGironi.onclick = () => {
  window.location.href =
    "./classificaGironi.html?id=" +
    idParamTorneo +
    "&nomeTorneo=" +
    idParam +
    "&data=" +
    dataParam +
    "&svolto=" +
    svolto;
};

eliminazioneDiretta.onclick = () => console.log("Non implementata");
classificaFinale.onclick = () => console.log("Non implementata");
