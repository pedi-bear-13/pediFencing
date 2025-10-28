import {
  recuperaTornei,
  loginControllo,
  aggiornaAssalti,
  recuperaAtleta,
} from "./cache.js";
import { renderEliminazioneDiretta } from "./render.js";
//Lettura url
const url = new URL(window.location.href);
const idParam = url.searchParams.get("nomeTorneo");
const dataParam = url.searchParams.get("data");
const svolto = url.searchParams.get("svolto");
const idParamTorneo = url.searchParams.get("id");

//Dom - button
const eliminazioneDiretta = document.getElementById("eliminazioneDiretta");
const gironiMenu = document.getElementById("gironiMenu");
const classificaIniziale = document.getElementById("classificaIniziale");
const classificaGironi = document.getElementById("classificaGironi");
const classificaFinale = document.getElementById("classificaFinale");
const logout = document.getElementById("logout");
logout.onclick = () => {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("password");
  window.location.href = "../index.html";
};
/**
 * Al caricamento della pagina viene fatto il render della classifica gironi
 */
window.onload = () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );

  recuperaTornei().then((response) => {
    response.forEach((torneo) => {
      if (torneo.Id == idParamTorneo) {
        renderEliminazioneDiretta(
          idParam,
          dataParam,
          torneo.PercentualeEliminati,
          torneo.NumeroGironi,
          torneo.Id
        );
      }
    });
  });
};

const editButton = document.getElementById("apriModalRisultato");
const modal = new bootstrap.Modal(document.getElementById("modalRisultato"));
const matchSelect = document.getElementById("matchSelect");
const atleta1Input = document.getElementById("atleta1");
const atleta2Input = document.getElementById("atleta2");
const punteggio1 = document.getElementById("punteggio1");
const punteggio2 = document.getElementById("punteggio2");
const formRisultato = document.getElementById("formRisultato");

let matchList = [];

editButton?.addEventListener("click", () => {
  matchSelect.innerHTML = "";
  atleta1Input.value = "";
  atleta2Input.value = "";
  punteggio1.value = "";
  punteggio2.value = "";

  const bracketArea = document.getElementById("bracketArea");
  const matchBoxes = bracketArea.querySelectorAll(".match-box");

  matchList = [];

  matchBoxes.forEach((box) => {
    const atleta1 = box
      .querySelector(".athlete:nth-child(1) .name")
      ?.textContent.trim();
    const atleta2 = box
      .querySelector(".athlete:nth-child(2) .name")
      ?.textContent.trim();
    const fase = box
      .closest(".bracket-round")
      ?.querySelector(".round-title")
      ?.textContent.trim();

    if (atleta1 && atleta2 && atleta1 !== "Bye" && atleta2 !== "Bye") {
      matchList.push({ atleta1, atleta2, fase });
    }
  });

  matchList.forEach((match, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${match.atleta1} vs ${match.atleta2} (${match.fase})`;
    matchSelect.appendChild(option);
  });

  modal.show();
});

matchSelect.addEventListener("change", () => {
  const match = matchList[matchSelect.value];
  atleta1Input.value = match.atleta1;
  atleta2Input.value = match.atleta2;
});

formRisultato.addEventListener("submit", async (e) => {
  e.preventDefault();

  const index = matchSelect.value;
  const match = matchList[index];
  const atleta1 = atleta1Input.value;
  const atleta2 = atleta2Input.value;
  const p1 = parseInt(punteggio1.value);
  const p2 = parseInt(punteggio2.value);
  const faseToTabellone = {
    finale: "tab2",
    semifinali: "tab4",
    "quarti di finale": "tab8",
    "ottavi di finale": "tab16",
    "sedicesimi di finale": "tab32",
  };

  const faseNormalizzata = match.fase?.trim().toLowerCase();
  const tipoTabellone = faseToTabellone[faseNormalizzata] || "tab?";

  if (isNaN(p1) || isNaN(p2) || p1 < 0 || p1 > 15 || p2 < 0 || p2 > 15) {
    alert("Inserisci punteggi validi tra 0 e 15.");
    return;
  }

  if (p1 === p2) {
    alert("Il match deve avere un vincitore. Il pareggio non è ammesso.");
    return;
  }

  try {
    const atleti = await recuperaAtleta(idParam, dataParam);

    let codice1 = null;
    let codice2 = null;

    atleti.forEach((a) => {
      const nomeCompleto = `${a.Nome} ${a.Cognome}`.trim();
      if (nomeCompleto === atleta1) codice1 = a.CodiceFIS;
      if (nomeCompleto === atleta2) codice2 = a.CodiceFIS;
    });

    if (!codice1 || !codice2) {
      alert("Errore nel recupero dei codici FIS.");
      return;
    }

    const vincitore =
      p1 > p2 ? { codice: codice1, punti: p1 } : { codice: codice2, punti: p2 };
    const perdente =
      p1 > p2 ? { codice: codice2, punti: p2 } : { codice: codice1, punti: p1 };
    const risultato = `${vincitore.punti}-${perdente.punti}`;

    await aggiornaAssalti({
      fisUno: vincitore.codice,
      fisDue: perdente.codice,
      Risultato: risultato,
      tipo: tipoTabellone,
      idTorneo: idParamTorneo,
    });

    modal.hide();
    window.location.reload();
  } catch (error) {
    console.error("Errore durante l'invio:", error);
    alert("Errore durante l'inserimento del risultato.");
  }
});

/**
 * Gestione button cambio pagina da classifica gironi a classifica iniziale
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

/**
 * Gestione button cambio pagina da classifica iniziale alla pagina dei gironi
 */
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

/**
 * Gestione button cambio pagina da classifica iniziale a pagina classifica gironi
 */
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

/**
 * Gestione button cambio pagina da classifica iniziale alla pagina dell'eliminazione diretta
 */
eliminazioneDiretta.onclick = () => {
  console.log("Non implementata");
};

/**
 * Gestione button cambio pagina da classifica iniziale a classifica finale
 */
classificaFinale.onclick = () => {
  console.log("Non implementata");
};
