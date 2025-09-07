//Import moduli
import {
  recuperaTornei,
  recuperaAtleta,
  recuperaGironi,
  iscriviUtenteReg,
  recuperaStorico,
  aggiornaAssalto,
  recuperaAssaltiGirone,
} from "./cache.js";

const spinner = document.getElementById("spinner");
const data = document.getElementById("data");
//------------------------- INIZIO PAGINA PRINCIPALE TORNEI ---------------------------------------
//Dom
const torneiTable = document.getElementById("tornei-container");
const resultIscrizione = document.getElementById("resultIscrizione");

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
        <div class="col-auto"> <button class="bottoni-barra elimina " id="%COUNT" type="button" %disabled>
          <img src="../person_add.svg" class="pedi-icon" />
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
        const {
          nome: nomePrimo,
          data: dataPrimo,
          svolto: svoltoPrimo,
        } = tornei[0];
        // prendo il primo valore
        row = templateFirstTornei.replace(
          "%value",
          templateDivTornei
            .replace("%DIM", "w-100")
            .replace("%ID", nomePrimo + "_" + dataPrimo + "_" + svoltoPrimo)
            .replace("%TITOLO", nomePrimo)
            .replace("%COUNT", nomePrimo + "_" + dataPrimo)
            .replace("%STATUS", svoltoPrimo ? "red" : "green")
            .replace("%disabled", svoltoPrimo ? "disabled" : " ")
        );

        if (tornei.length > 1) {
          row += `<div class="row mt-2">`;
          for (let i = 1; i < tornei.length; i++) {
            const {
              nome: nomeTorneo,
              data: dataTorneo,
              svolto: svoltoTorneo,
            } = tornei[i];
            row += templateTdTornei.replace(
              "%value",
              templateDivTornei
                .replace("%DIM", "w-100")
                .replace(
                  "%ID",
                  nomeTorneo + "_" + dataTorneo + "_" + svoltoTorneo
                )
                .replace("%TITOLO", nomeTorneo)
                .replace("%COUNT", nomeTorneo + "_" + dataTorneo)
                .replace("%STATUS", svoltoTorneo ? "red" : "green")
                .replace("%disabled", svoltoTorneo ? "disabled" : " ")
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
        console.log(document.querySelectorAll(".elimina"));
        document.querySelectorAll(".elimina").forEach((div) => {
          div.addEventListener("click", (event) => {
            event.stopPropagation(); //evita di considerare ulteriori click, come quello sulla card
            const id = event.currentTarget.id.split("_");
            iscriviUtenteReg(
              id[0],
              id[1],
              sessionStorage.getItem("username"),
              sessionStorage.getItem("password")
            )
              .then((result) => {
                console.log(result);
                new bootstrap.Modal("#avviso").show();
                if (result == "iscritto") {
                  resultIscrizione.innerHTML =
                    "<p>Registrazione avvenuta con successo</p>";
                } else {
                  resultIscrizione.innerHTML =
                    "<p>Risulti già iscritto a questo torneo</p>";
                }
              })
              .catch((error) => {
                resultIscrizione.innerHTML =
                  "<p>Impossibile proseguire con la registrazione, contatta l'amministratore per avere più dettagli</p>";
              });
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
//------------------------- INIZIO PAGINA GIRONI ---------------------------------------
//Dom
const tableGironi = document.getElementById("tableGironi");
/**
 * Funzione per distribuire i giocatori in un determinato girone in modo circolare
 * @param {*} numeroGironi
 * @param {*} listaGiocatori
 * @returns
 */
function distribuisciGiocatori(numeroGironi, listaGiocatori) {
  const numeroGiocatori = listaGiocatori.length;
  const gironi = new Array(numeroGironi).fill(null).map(() => []);
  //Inizializza un array vuoto per ciascun girone
  listaGiocatori.sort((a, b) => b.ranking - a.ranking);
  // Distribuisci i giocatori nei gironi
  for (let i = 0; i < numeroGiocatori; i++) {
    const giocatore = listaGiocatori[i];
    const indiceGirone = i % numeroGironi;
    gironi[indiceGirone].push(giocatore);
  }
  return gironi;
}

/**
 * Funzione per generare gli incontri dei vari sfidanti nei gironi
 * @param {*} lunghezza
 * @returns
 */
function roundRobin(lunghezza) {
  let players = [];
  for (let index = 0; index < lunghezza; index++) {
    players.push(index + 1);
  }
  let rounds = [];
  if (players.length % 2 !== 0) {
    players.push(null);
  }
  let numRounds = players.length - 1;
  let half = players.length / 2;
  for (let round = 0; round < numRounds; round++) {
    let matches = [];
    for (let i = 0; i < half; i++) {
      let player1 = players[i];
      let player2 = players[numRounds - i];
      if (player1 !== null && player2 !== null) {
        matches.push([player1, player2]);
      }
    }
    rounds.push(matches);
    players.splice(1, 0, players.pop());
  }
  return rounds;
}

/**
 * Funzione per visualizzare in tabella gli incontri nei vari gironi
 * @param {*} lista
 * @param {*} div
 * @param {*} roundRobin
 */
export function renderincontri(lista) {
  let rounds = roundRobin(lista.length);
  let table = `<table class="table table-bordered text-white text-center pedi-tabella mt-5">`;
  rounds.forEach((element) => {
    element.forEach((element2) => {
      let y =
        `<tr><td>` +
        lista[element2[0] - 1].cognome +
        ` ` +
        lista[element2[0] - 1].nome +
        `</td><td>` +
        element2[0] +
        ` vs ` +
        element2[1] +
        `</td><td>` +
        lista[element2[1] - 1].cognome +
        ` ` +
        lista[element2[1] - 1].nome +
        `</td></tr>`;
      table += y;
    });
  });
  table += `</table>`;
  return table;
}

/**
 * Funzione per dividere l'array di response della promise in un array di dizionari, dove ogni dizionario contiene
 * le informazioni dei singoli gironi. L'array restituito sarà messo in ordine di inserimento
 * @param {*} array
 * @returns
 */
const dividiPerGirone = (response) => {
  const array = [];
  response.forEach((element) => {
    const index = array.findIndex((girone) => girone.id === element.idFase);
    if (index !== -1) {
      array[index].partecipanti.push(element);
    } else {
      array.push({
        id: element.idFase,
        partecipanti: [element],
      });
    }
  });
  array.sort(function (a, b) {
    return a.id - b.id;
  });
  return array;
};

/**
 * Funzione per accoppiare ad ogni Sfidante l'atleta Sfidato in base all'assalto
 * @param {*} array
 */
const accoppiaPerAssalto = (array) => {
  const divisiPerAssalto = [];
  array.forEach((girone) => {
    const jsonTemp = { id: girone.id };
    const arrayTempAccoppiamenti = [];
    const partecipantiCopia = [...girone.partecipanti];
    partecipantiCopia.forEach((primo) => {
      const secondoIndex = partecipantiCopia.findIndex((partecipante) => {
        return (
          primo.idAssalto === partecipante.idAssalto &&
          primo.codiceFis !== partecipante.codiceFis
        );
      });
      if (secondoIndex !== -1) {
        const secondo = partecipantiCopia.splice(secondoIndex, 1)[0];
        arrayTempAccoppiamenti.push({
          partecipanteUno: primo,
          partecipanteDue: secondo,
        });
      }
    });
    jsonTemp["partecipanti"] = arrayTempAccoppiamenti;
    divisiPerAssalto.push(jsonTemp);
  });
  return divisiPerAssalto;
};

/**
 * Funzione per la visualizzazione in finestra dei gironi
 * @param {*} nomeTorneo
 * @param {*} data
 */
export const renderGironi = (nomeTorneo, dataT, numeroGir, stato) => {
  recuperaAtleta(nomeTorneo, dataT)
    .then((response) => {
      recuperaAssaltiGirone(nomeTorneo, dataT).then((assaltiGironi) => {
        data.classList.remove("d-none");
        spinner.classList.add("d-none");

        let divisiPerGirone = dividiPerGirone(response);
        let countaGir = 0;
        const assaltiPerGirone = [];
        //Visualizzazione in finestra
        divisiPerGirone.forEach((girone) => {
          const partecipanti = girone.partecipanti;
          const partecipantiRedux = partecipanti.filter(
            (elem, index, self) =>
              index ===
              self.findIndex((t) => {
                return (
                  t.nome === elem.nome &&
                  t.cognome === elem.cognome &&
                  t.codiceFis === elem.codiceFis &&
                  t.societa === elem.societa &&
                  t.ranking === elem.ranking
                );
              })
          );
          distribuisciGiocatori(numeroGir, partecipantiRedux).forEach(
            (giocatoriDistribuiti) => {
              const assaltiAggiornati = [];
              giocatoriDistribuiti.forEach((giocatore) => {
                const assaltiGiocatore = assaltiGironi.filter(
                  (assalto) => assalto.codiceFisAtleta === giocatore.codiceFis
                );
                assaltiAggiornati.push(...assaltiGiocatore);
              });
              const assaltiAccoppiati = [];
              assaltiAggiornati.forEach((assalto1, index) => {
                for (let i = index + 1; i < assaltiAggiornati.length; i++) {
                  const assalto2 = assaltiAggiornati[i];
                  if (
                    assalto1.codiceFisAtleta !== assalto2.codiceFisAtleta &&
                    assalto1.idAssalto === assalto2.idAssalto
                  ) {
                    assaltiAccoppiati.push({
                      assaltoUno: assalto1,
                      assaltoDue: assalto2,
                    });
                  }
                }
              });

              let html = `
              <div class="col-auto">
            <table class="table table-bordered text-white text-center pedi-tabella mt-5">
              <thead>
               <tr>
                <th>COGNOME</th>
                <th>NOME</th>
                <th>RANK</th>
                <th>SOCIETÀ</th>
                `;
              for (
                let index = 0;
                index < giocatoriDistribuiti.length;
                index++
              ) {
                let g = `<th>` + (index + 1) + `</th>`;
                html += g;
              }
              html += `
              </tr>
            </thead>
            <tbody>
          `;
              giocatoriDistribuiti.forEach((partecipante, index) => {
                let assaltiPartecipante = assaltiAccoppiati.filter(
                  (assalto) => {
                    return (
                      assalto.assaltoUno.codiceFisAtleta ===
                        partecipante.codiceFis ||
                      assalto.assaltoDue.codiceFisAtleta ===
                        partecipante.codiceFis
                    );
                  }
                );

                html +=
                  "<tr><td>" +
                  partecipante.cognome +
                  "</td><td>" +
                  partecipante.nome +
                  "</td><td>" +
                  partecipante.ranking +
                  "</td><td>" +
                  partecipante.societa +
                  "</td>";

                giocatoriDistribuiti.forEach(
                  (altroPartecipante, indexAltro) => {
                    if (index !== indexAltro) {
                      let punteggioTemp = "-";
                      assaltiPartecipante.forEach((assalto) => {
                        if (
                          (assalto.assaltoUno.codiceFisAtleta ===
                            partecipante.codiceFis &&
                            assalto.assaltoDue.codiceFisAtleta ===
                              altroPartecipante.codiceFis) ||
                          (assalto.assaltoDue.codiceFisAtleta ===
                            partecipante.codiceFis &&
                            assalto.assaltoUno.codiceFisAtleta ===
                              altroPartecipante.codiceFis)
                        ) {
                          punteggioTemp =
                            assalto.assaltoUno.codiceFisAtleta ===
                            partecipante.codiceFis
                              ? assalto.assaltoUno.punteggio
                              : assalto.assaltoDue.punteggio;
                        }
                      });
                      html += "<td>" + punteggioTemp + "</td>";
                    } else {
                      html += "<td></td>";
                    }
                  }
                );

                html += "</tr>";
              });

              html += "</tbody></table></div>";
              countaGir++;
              html += creaModalGironi(giocatoriDistribuiti, countaGir, stato);
              html += renderincontri(giocatoriDistribuiti);
              tableGironi.innerHTML += html;
              //Verifico la pressione del button di girone
              document
                .querySelectorAll(".conferma")
                .forEach((button, index) => {
                  button.onclick = () => {
                    const nGirone = parseInt(button.id.replace("conferma", ""));
                    const punteggioPrimo = Array.from(
                      document.querySelectorAll(".punteggio")
                    ).find((input) => {
                      return input.id == "girone-" + nGirone + " atleta-1";
                    }).value;
                    const punteggioSecondo = Array.from(
                      document.querySelectorAll(".punteggio")
                    ).find((input) => {
                      return input.id == "girone-" + nGirone + " atleta-2";
                    }).value;
                    const atletaPrimo = Array.from(
                      document.querySelectorAll(".plebeo")
                    ).find((input) => {
                      return input.id == "select-1 girone-" + nGirone;
                    }).value;
                    const atletaSecondo = Array.from(
                      document.querySelectorAll(".plebeo")
                    ).find((input) => {
                      return input.id == "select-2 girone-" + nGirone;
                    }).value;
                    if (
                      punteggioPrimo !== "" &&
                      punteggioSecondo !== "" &&
                      parseInt(punteggioPrimo, 10) == punteggioPrimo &&
                      parseInt(punteggioSecondo, 10) == punteggioSecondo &&
                      punteggioPrimo >= 0 &&
                      punteggioPrimo <= 5 &&
                      punteggioSecondo >= 0 &&
                      punteggioSecondo <= 5 &&
                      punteggioPrimo !== punteggioSecondo &&
                      atletaPrimo !== atletaSecondo
                    ) {
                      //una volta composti i due dizionari richiamo i metodi di aggiornamento
                      aggiornaAssalto(
                        checkPunteggi(
                          atletaPrimo,
                          punteggioPrimo,
                          atletaSecondo,
                          punteggioSecondo,
                          nomeTorneo,
                          dataT
                        )
                      ).then((dolore) => {
                        window.location.reload();
                      });
                    } else {
                      alert("Errore nella compilazione");
                    }
                    document.getElementById(
                      `girone-` + nGirone + ` atleta-1`
                    ).value = "";
                    document.getElementById(
                      `girone-` + nGirone + ` atleta-2`
                    ).value = "";
                    document.getElementById(
                      "select-1 girone-" + nGirone
                    ).selectedIndex = 0;
                    document.getElementById(
                      "select-2 girone-" + nGirone
                    ).selectedIndex = 0;
                  };
                });
            }
          );
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

const checkPunteggi = (
  atleta1,
  punteggio1,
  atleta2,
  punteggio2,
  nomeT,
  dataT
) => {
  let obj = {};
  if (punteggio1 == 5) {
    obj["atleta1"] = "V";
    obj["atleta2"] = punteggio2;
    obj["fisUno"] = atleta1;
    obj["fisDue"] = atleta2;
    obj["torneo"] = nomeT;
    obj["data"] = dataT;
  }
  if (punteggio1 > punteggio2 && punteggio1 != 5) {
    obj["atleta1"] = "V" + punteggio1;
    obj["atleta2"] = punteggio2;
    obj["fisUno"] = atleta1;
    obj["fisDue"] = atleta2;
    obj["torneo"] = nomeT;
    obj["data"] = dataT;
  }
  if (punteggio2 == 5) {
    obj["atleta1"] = punteggio1;
    obj["atleta2"] = "V";
    obj["fisUno"] = atleta1;
    obj["fisDue"] = atleta2;
    obj["torneo"] = nomeT;
    obj["data"] = dataT;
  }
  if (punteggio2 > punteggio1 && punteggio2 != 5) {
    obj["atleta1"] = punteggio1;
    obj["atleta2"] = "V" + punteggio2;
    obj["fisUno"] = atleta1;
    obj["fisDue"] = atleta2;
    obj["torneo"] = nomeT;
    obj["data"] = dataT;
  }
  return obj;
};

const creaModalGironi = (girone, contatore, torneoStatus) => {
  let modal =
    `
  <div class="col-auto">
  <!-- Button trigger modal -->
  <button data-bs-toggle="modal" data-bs-target="#girone` +
    contatore +
    `" class="bottoni-page" type="button"  %disabled>
    <img src="../edit.svg" class="pedi-icon" />
</button>
  </div>
  <!-- Modal -->
  <div class="modal fade" id="girone` +
    contatore +
    `" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">%TITOLO</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
        %CONTENUTO
        </div>
        <div class="modal-footer">
          <button type="button" id="conferma` +
    contatore +
    `" class="btn btn-success conferma" data-bs-dismiss="modal">Modifica</button>
        </div>
      </div>
    </div>
  </div>
  `;
  modal = modal.replace("%TITOLO", "Girone " + contatore);
  if (torneoStatus == 1) {
    modal = modal.replace("%disabled", "disabled");
  } else {
    modal = modal.replace("%disabled", " ");
  }
  let body = `<div class="row justify-content-center">`;
  let select1 =
    `<div class="col-auto"><select class="form-select plebeo" id="select-1 girone-` +
    contatore +
    `">`;
  girone.forEach((atleta) => {
    select1 +=
      `<option value="` +
      atleta.codiceFis +
      `">` +
      atleta.cognome +
      " " +
      atleta.nome +
      `</option>`;
  });
  select1 += "</select></div>";
  body += select1;
  body +=
    `<div class="col-auto"><input type="number" class="form-control punteggio" placeholder="Punteggio..." id="girone-` +
    contatore +
    ` atleta-1"></div></div>`;

  let select2 =
    `<div class="row justify-content-center mt-3"><div class="col-auto"><select class="form-select plebeo" id="select-2 girone-` +
    contatore +
    `">`;
  girone.forEach((atleta) => {
    select2 +=
      `<option value="` +
      atleta.codiceFis +
      `">` +
      atleta.cognome +
      " " +
      atleta.nome +
      `</option>`;
  });
  select2 += "</select></div>";
  body += select2;
  body +=
    `<div class="col-auto"><input type="number" class="form-control punteggio" placeholder="Punteggio..." id="girone-` +
    contatore +
    ` atleta-2"></div></div>`;
  modal = modal.replace("%CONTENUTO", body);
  return modal;
};

//------------------------- FINE PAGINA GIRONI  --------------------------------------------
//------------------------- INIZIO CLASSIFICA GIRONI ---------------------------------------

export const creaClassificaGironi = (
  nomeTorneo,
  dataT,
  percentualeElim,
  numeroGir
) => {
  recuperaAtleta(nomeTorneo, dataT).then((response) => {
    recuperaAssaltiGirone(nomeTorneo, dataT).then((assaltiGironi) => {
      data.classList.remove("d-none");
      spinner.classList.add("d-none");

      let divisiPerGirone = dividiPerGirone(response);
      let countaGir = 0;
      const listaGir = [];
      //Visualizzazione in finestra
      divisiPerGirone.forEach((girone) => {
        const partecipanti = girone.partecipanti;
        const partecipantiRedux = partecipanti.filter(
          (elem, index, self) =>
            index ===
            self.findIndex((t) => {
              return (
                t.nome === elem.nome &&
                t.cognome === elem.cognome &&
                t.codiceFis === elem.codiceFis &&
                t.societa === elem.societa &&
                t.ranking === elem.ranking
              );
            })
        );
        distribuisciGiocatori(numeroGir, partecipantiRedux).forEach(
          (giocatoriDistribuiti) => {
            const tot = {};
            tot["girone"] = countaGir++;
            const lista = [];
            const assaltiAggiornati = [];
            giocatoriDistribuiti.forEach((giocatore) => {
              const assaltiGiocatore = assaltiGironi.filter(
                (assalto) => assalto.codiceFisAtleta === giocatore.codiceFis
              );
              assaltiAggiornati.push(...assaltiGiocatore);
            });
            const assaltiAccoppiati = [];
            assaltiAggiornati.forEach((assalto1, index) => {
              for (let i = index + 1; i < assaltiAggiornati.length; i++) {
                const assalto2 = assaltiAggiornati[i];
                if (
                  assalto1.codiceFisAtleta !== assalto2.codiceFisAtleta &&
                  assalto1.idAssalto === assalto2.idAssalto
                ) {
                  assaltiAccoppiati.push({
                    assaltoUno: assalto1,
                    assaltoDue: assalto2,
                  });
                }
              }
            });
            giocatoriDistribuiti.forEach((partecipante, index) => {
              let obj = {};
              let assaltiPartecipante = assaltiAccoppiati.filter((assalto) => {
                return (
                  assalto.assaltoUno.codiceFisAtleta ===
                    partecipante.codiceFis ||
                  assalto.assaltoDue.codiceFisAtleta === partecipante.codiceFis
                );
              });

              obj["cognome"] = partecipante.cognome;
              obj["nome"] = partecipante.nome;
              obj["ranking"] = partecipante.ranking;
              obj["societa"] = partecipante.societa;
              obj["assalti"] = [];

              giocatoriDistribuiti.forEach((altroPartecipante, indexAltro) => {
                if (index !== indexAltro) {
                  let punteggioTemp = "-";
                  assaltiPartecipante.forEach((assalto) => {
                    if (
                      (assalto.assaltoUno.codiceFisAtleta ===
                        partecipante.codiceFis &&
                        assalto.assaltoDue.codiceFisAtleta ===
                          altroPartecipante.codiceFis) ||
                      (assalto.assaltoDue.codiceFisAtleta ===
                        partecipante.codiceFis &&
                        assalto.assaltoUno.codiceFisAtleta ===
                          altroPartecipante.codiceFis)
                    ) {
                      punteggioTemp =
                        assalto.assaltoUno.codiceFisAtleta ===
                        partecipante.codiceFis
                          ? assalto.assaltoUno.punteggio
                          : assalto.assaltoDue.punteggio;
                    }
                  });
                  obj.assalti.push(punteggioTemp);
                } else {
                  obj.assalti.push(" ");
                }
              });
              lista.push(obj);
            });
            tot["atleti"] = lista;
            listaGir.push(tot);
          }
        );
      });
      renderClassificaGironi(
        riordinaLista(
          creaClassGir(listaGir, creaMatrici(listaGir)),
          percentualeElim
        )
      );
    });
  });
};

const creaMatrici = (lista) => {
  const output = [];
  lista.forEach((element) => {
    const matrix = [];
    element.atleti.forEach((element2) => {
      const row = [];
      element2.assalti.forEach((element3) => {
        row.push(element3);
      });
      matrix.push(row);
    });
    output.push(matrix);
  });
  return output;
};

const creaClassGir = (listaGironi, listaMatrix) => {
  const output = [];
  listaGironi.forEach((gir, countMatrix) => {
    gir.atleti.forEach((atl, index) => {
      let countWin = 0;
      let sum = 0;
      listaMatrix[countMatrix][index].forEach((stoccate) => {
        if (stoccate !== " " && stoccate !== "-" && stoccate !== "") {
          if (stoccate == "V") {
            sum += 5;
            countWin++;
          } else if (stoccate == "V4") {
            sum += 4;
            countWin++;
          } else if (stoccate == "V3") {
            sum += 3;
            countWin++;
          } else if (stoccate == "V2") {
            sum += 2;
            countWin++;
          } else if (stoccate == "V1") {
            sum += 1;
            countWin++;
          } else {
            sum += Number.parseInt(stoccate, 10);
          }
        }
      });

      let sumDif = 0;
      for (let k = 0; k < listaMatrix[countMatrix].length; k++) {
        if (
          listaMatrix[countMatrix][k][index] !== "" &&
          listaMatrix[countMatrix][k][index] !== "-" &&
          listaMatrix[countMatrix][k][index] !== " "
        ) {
          if (listaMatrix[countMatrix][k][index] == "V") {
            sumDif += 5;
          } else if (listaMatrix[countMatrix][k][index] == "V4") {
            sumDif += 4;
          } else if (listaMatrix[countMatrix][k][index] == "V3") {
            sumDif += 3;
          } else if (listaMatrix[countMatrix][k][index] == "V2") {
            sumDif += 2;
          } else if (listaMatrix[countMatrix][k][index] == "V1") {
            sumDif += 1;
          } else {
            sumDif += Number.parseInt(listaMatrix[countMatrix][k][index], 10);
          }
        }
      }
      let obj = {
        cognome: atl.cognome,
        nome: atl.nome,
        societa: atl.societa,
        date: sum,
        subite: sumDif,
        differenza: sum - sumDif,
        aliquota: Number.parseFloat(
          (countWin / (listaMatrix[countMatrix][index].length - 1)).toFixed(2)
        ),
      };
      output.push(obj);
    });
  });
  return output;
};

const riordinaLista = (lista, percentualeElim) => {
  const output = [];
  lista.sort((a, b) => b.aliquota - a.aliquota);
  const listaAliquo = [];
  lista.forEach(function (oggetto) {
    listaAliquo.push(oggetto.aliquota);
  });
  listaAliquo.sort((a, b) => b - a);
  const listaAliquotaRagrup = Array.from(new Set(listaAliquo));
  const appoggioTotal = [];
  listaAliquotaRagrup.forEach((ali) => {
    const appoggio = [];
    lista.forEach((plebeo) => {
      if (ali === plebeo.aliquota) {
        appoggio.push(plebeo);
      }
    });
    appoggioTotal.push(appoggio);
  });
  appoggioTotal.forEach((gruppo) => {
    gruppo.sort((a, b) => b.differenza - a.differenza);
  });
  appoggioTotal.forEach((appoggino) => {
    appoggino.forEach((element) => {
      output.push(element);
    });
  });
  let numElim = Math.floor((output.length / 100) * percentualeElim);
  for (let z = output.length - 1; z >= 0; z--) {
    if (numElim !== 0) {
      output[z]["stato"] = "Eliminato";
      numElim--;
    } else {
      output[z]["stato"] = "Qualificato";
    }
  }
  return output;
};

/**
 * Funzione per il rendering in finestra della pagina iniziale - la pagina della classifica iniziale
 * @param {*} nometorneo
 * @param {*} data
 */
const renderClassificaGironi = (classifica) => {
  //table - DOM
  const classificaGironiTabella = document.getElementById(
    "classificaGironiTabella"
  );
  //template
  const templateClassGir = `<tr><th>POS</th><th>COGNOME</th><th>NOME</th><th>SOCIETA</th><th>V/A</th><th>DIFF.</th><th>DATE</th><th>STATO</th></tr>`;
  let html = "";
  html = templateClassGir;
  classifica.forEach((element, index) => {
    html += templateClassGir
      .replaceAll("th>", "td>")
      .replace("POS", index + 1)
      .replace("COGNOME", element.cognome)
      .replace("NOME", element.nome)
      .replace("SOCIETA", element.societa)
      .replace("V/A", element.aliquota)
      .replace("DIFF.", element.differenza)
      .replace("DATE", element.date)
      .replace("STATO", element.stato);
  });
  classificaGironiTabella.innerHTML = html;
};
//------------------------- FINE CLASSIFICA GIRONI  ----------------------------------------
export const renderStorico = (div) => {
  recuperaStorico(sessionStorage.getItem("username")).then((tornei) => {
    spinner.classList.add("d-none");
    data.classList.remove("d-none");
    if (tornei) {
      //template
      const templateStorico = `<tr><th>POS</th><th>NOME TORNEO</th><th>DATA TORNEO</th></tr>`;
      let html = "";
      html = templateStorico;
      tornei.forEach((element, index) => {
        html += templateStorico
          .replaceAll("th>", "td>")
          .replace("POS", index + 1)
          .replace("NOME TORNEO", element.nomeTorneo)
          .replace("DATA TORNEO", element.dataTorneo);
      });
      div.innerHTML = html;
    }
  });
};
