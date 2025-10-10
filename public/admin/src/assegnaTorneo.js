import {
  registraPartecipante,
  loginControllo,
  recuperaAtleta,
  recuperaTuttiAtleti,
} from "./cache.js";

// Lettura url
const url = new URL(window.location.href);
const idParamTorneo = url.searchParams.get("id");
const idParam = url.searchParams.get("nomeTorneo");
const dataParam = url.searchParams.get("data");
const svolto = url.searchParams.get("svolto");
const spinner = document.getElementById("spinner");
const data = document.getElementById("data");

// DOM
const searchAtleta = document.getElementById("searchAtleta");
const btnAddNew = document.getElementById("btnAddNew");
const searchResults = document.getElementById("searchResults");

const nome = document.getElementById("nome");
const cognome = document.getElementById("cognome");
const ranking = document.getElementById("ranking");
const codiceFis = document.getElementById("codiceFis");
const invia = document.getElementById("invia");
const backIn = document.getElementById("backIn");
const logout = document.getElementById("logout");
const messaggio = document.getElementById("messaggio");

// Modal
const modalEl = document.getElementById("modalNewAtleta");
const modalMessage = document.getElementById("modalMessage");
const nomeNew = document.getElementById("nomeNew");
const cognomeNew = document.getElementById("cognomeNew");
const rankingNew = document.getElementById("rankingNew");
const codiceFisNew = document.getElementById("codiceFisNew");
const saveNewAtleta = document.getElementById("saveNewAtleta");
let bsModal = null;
if (modalEl) {
  bsModal = new bootstrap.Modal(modalEl, {});
}

// Variabili locali
let atletiDB = [];
let selectedExisting = false;
let selectedCodiceFis = null;

// Carico lista atleti esistenti al caricamento
async function caricaAtleti() {
  try {
    const rsp = await recuperaTuttiAtleti();
    if (Array.isArray(rsp)) {
      atletiDB = rsp;
      console.log(atletiDB);
    } else {
      console.warn("Formato imprevisto recuperaTuttiAtleti:", rsp);
      atletiDB = [];
    }
  } catch (err) {
    console.error("Errore caricamento atleti:", err);
    atletiDB = [];
  }
}

function hideResults() {
  searchResults.classList.add("d-none");
  searchResults.innerHTML = "";
}

function renderResults(items) {
  searchResults.innerHTML = "";
  if (!items || items.length === 0) {
    const li = document.createElement("div");
    li.className = "list-group-item";
    li.textContent = "Nessun atleta trovato. Premi + per aggiungerne uno.";
    searchResults.appendChild(li);
    searchResults.classList.remove("d-none");
    return;
  }

  items.forEach((it) => {
    const li = document.createElement("button");
    li.type = "button";
    li.className = "list-group-item list-group-item-action";
    li.innerHTML = `<strong>${it.Nome} ${it.Cognome}</strong> — <small>Codice: ${it.CodiceFIS}</small>`;
    li.addEventListener("click", () => {
      searchAtleta.value = `${it.Nome} ${it.Cognome}`;
      nome.value = it.Nome;
      cognome.value = it.Cognome;
      ranking.value = it.Ranking ?? "";
      codiceFis.value = it.CodiceFIS;
      codiceFis.readOnly = true;
      selectedExisting = true;
      selectedCodiceFis = it.CodiceFIS;
      hideResults();
      messaggio.innerText =
        "Atleta selezionato: premi Invio per aggiungerlo al torneo.";
    });
    searchResults.appendChild(li);
  });
  searchResults.classList.remove("d-none");
}

function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Ricerca locale tra atletiDB
searchAtleta.addEventListener(
  "input",
  debounce((e) => {
    const q = e.target.value.trim().toLowerCase();
    selectedExisting = false;
    selectedCodiceFis = null;
    codiceFis.readOnly = false;

    if (q.length < 2) {
      hideResults();
      return;
    }

    const filtered = atletiDB.filter((a) =>
      `${a.Nome} ${a.Cognome}`.toLowerCase().includes(q)
    );

    renderResults(filtered);
  }, 300)
);

// Chiudi dropdown cliccando fuori
document.addEventListener("click", (ev) => {
  if (
    !ev.target.closest("#searchAtleta") &&
    !ev.target.closest("#searchResults")
  ) {
    hideResults();
  }
});

// Rimozione selezione se modifico campi manualmente
[nome, cognome, ranking, codiceFis].forEach((input) => {
  input.addEventListener("input", () => {
    if (codiceFis.readOnly && input !== codiceFis) {
      codiceFis.readOnly = false;
    }
    selectedExisting = false;
    selectedCodiceFis = null;
  });
});

// Apertura modal nuovo atleta
btnAddNew.addEventListener("click", () => {
  modalMessage.innerText = "";
  nomeNew.value = "";
  cognomeNew.value = "";
  rankingNew.value = "";
  codiceFisNew.value = "";
  if (bsModal) bsModal.show();
});

// Creazione atleta
saveNewAtleta.addEventListener("click", async () => {
  const n = nomeNew.value.trim();
  const c = cognomeNew.value.trim();
  const r = rankingNew.value.trim();
  const cod = codiceFisNew.value.trim();

  if (!n || !c || !r || !cod) {
    modalMessage.innerText = "Compila tutti i campi.";
    modalMessage.className = "text-danger small";
    return;
  }

  try {
    modalMessage.innerText = "Creo atleta...";
    modalMessage.className = "text-muted small";

    const rsp = await registraPartecipante({
      CodiceFIS: cod,
      Nome: n,
      Cognome: c,
      Ranking: r,
    });

    if (rsp && (rsp.success || rsp.result === "ok" || rsp.CodiceFIS)) {
      modalMessage.innerText = "Atleta creato con successo.";
      modalMessage.className = "text-success small";
      // aggiorno lista locale
      atletiDB.push({ CodiceFIS: cod, Nome: n, Cognome: c, Ranking: r });

      setTimeout(() => {
        if (bsModal) bsModal.hide();
        searchAtleta.value = `${n} ${c}`;
        nome.value = n;
        cognome.value = c;
        ranking.value = r;
        codiceFis.value = cod;
        codiceFis.readOnly = true;
        selectedExisting = true;
        selectedCodiceFis = cod;
        messaggio.innerText = "Atleta creato e selezionato.";
      }, 500);
    } else {
      const msg =
        rsp && (rsp.message || rsp.result)
          ? rsp.message || rsp.result
          : "Errore durante la creazione.";
      modalMessage.innerText = msg;
      modalMessage.className = "text-danger small";
    }
  } catch (err) {
    console.error("Errore creaAtleta:", err);
    modalMessage.innerText = "Errore di rete o server.";
    modalMessage.className = "text-danger small";
  }
});

// Invio partecipante
invia.onclick = async () => {
  if (
    nome.value != "" &&
    cognome.value != "" &&
    ranking.value != "" &&
    codiceFis.value != ""
  ) {
    const dizionarioTemp = {
      nome: nome.value,
      cognome: cognome.value,
      ranking: ranking.value,
      codiceFis: codiceFis.value,
      nomeTorneo: idParam,
      dataTorneo: dataParam,
    };
    spinner.classList.remove("d-none");
    data.classList.add("d-none");
    try {
      const rsp = await registraPartecipante(dizionarioTemp);
      messaggio.innerText = rsp.result ?? "Operazione completata.";
      nome.value = "";
      cognome.value = "";
      ranking.value = "";
      codiceFis.value = "";
      codiceFis.readOnly = false;
      selectedExisting = false;
      selectedCodiceFis = null;
      searchAtleta.value = "";
    } catch (err) {
      console.error("Errore registraPartecipante:", err);
      messaggio.innerText = "Errore di rete o server.";
    } finally {
      spinner.classList.add("d-none");
      data.classList.remove("d-none");
    }
  } else {
    nome.classList.add("border-danger");
    cognome.classList.add("border-danger");
    ranking.classList.add("border-danger");
    codiceFis.classList.add("border-danger");
  }
};

backIn.onclick = () => {
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

logout.onclick = () => {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("password");
  window.location.href = "../index.html";
};

window.onload = async () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );
  await caricaAtleti();
};
