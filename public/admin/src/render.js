//Import moduli
import {
  recuperaTornei,
  recuperaAtleta,
  assegnaGironi,
  recuperaAssaltiTabellone,
  eliminaTorneo,
  aggiornaAssalti,
  recuperaAssaltiGirone,
} from "./cache.js";
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
          <p class="badge text-wrap">%TITOLO</p>
        </div>
        <div class="col-auto"> 
          <button class="bottoni-barra modifica btn bottoni-rosa" id="%COUNT" type="button" %DISABLED>
            <img src="../edit.svg" class="pedi-icon" />
          </button>
          <button class="bottoni-barra elimina btn bottoni-rosa" id="%COUNT" type="button">
            <img src="../bin.svg" class="pedi-icon" />
          </button>
        </div>
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
        // prendo il primo valore
        row = templateFirstTornei.replace(
          "%value",
          templateDivTornei
            .replace("%DIM", "w-100")
            .replace(
              "%ID",
              tornei[0].Id +
                "_" +
                tornei[0].Nome +
                "_" +
                tornei[0].Giorno +
                "_" +
                tornei[0].Stato
            )
            .replace("%TITOLO", tornei[0].Nome)
            .replaceAll(
              "%COUNT",
              tornei[0].Id +
                "_" +
                tornei[0].Nome +
                "_" +
                tornei[0].Giorno +
                "_" +
                tornei[0].Stato
            )
            .replace(
              "%DISABLED",
              tornei[0].Stato === "Iniziale" ? "" : "disabled"
            )
        );

        if (tornei.length > 1) {
          row += `<div class="row mt-2">`;
          for (let i = 1; i < tornei.length; i++) {
            const nome = tornei[i].Nome;
            const svolto = tornei[i].Stato;
            row += templateTdTornei.replace(
              "%value",
              templateDivTornei
                .replace("%DIM", "w-100")
                .replace(
                  "%ID",
                  tornei[i].Id +
                    "_" +
                    nome +
                    "_" +
                    tornei[i].Giorno +
                    "_" +
                    svolto
                )
                .replace("%TITOLO", nome)
                .replaceAll(
                  "%COUNT",
                  tornei[i].Id +
                    "_" +
                    nome +
                    "_" +
                    tornei[i].Giorno +
                    "_" +
                    svolto
                )
                .replace("%DISABLED", svolto === "Iniziale" ? "" : "disabled")
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
              "./classificaIniziale.html?id=" +
              id[0] +
              "&nomeTorneo=" +
              id[1] +
              "&data=" +
              id[2] +
              "&svolto=" +
              id[3];
          });
        });
        document.querySelectorAll(".elimina").forEach((div) => {
          div.addEventListener("click", (event) => {
            event.stopPropagation(); //evita di considerare ulteriori click, come quello sulla card
            const id = event.currentTarget.id.split("_");
            spinner.classList.remove("d-none");
            data.classList.add("d-none");
            eliminaTorneo({ id: id[0] }).then((response) => {
              window.location.reload();
            });
          });
        });
        document.querySelectorAll(".modifica").forEach((div) => {
          div.addEventListener("click", (event) => {
            event.stopPropagation(); //evita di considerare ulteriori click, come quello sulla card
            const id = event.currentTarget.id.split("_");
            window.location.href =
              "./modificaTorneo.html?id=" +
              id[0] +
              "&nomeTorneo=" +
              id[1] +
              "&data=" +
              id[2] +
              "&svolto=" +
              id[3];
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
const templateIniziale = `<tr><th>INDICE</th><th>COGNOME NOME</th><th>RANKING</th></tr>`;

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
      response = response.sort((a, b) => a.Ranking - b.Ranking);
      let html = "";
      html = templateIniziale;
      response.forEach((element, index) => {
        html += templateIniziale
          .replaceAll("th>", "td>")
          .replace("INDICE", index + 1)
          .replace("COGNOME NOME", element.Nome + " " + element.Cognome)
          .replace("RANKING", element.Ranking);
      });
      classificaIniziale.innerHTML = html;
    }
  });
};

//------------------------- FINE PAGINA CLASSIFICA INIZIALE  ---------------------------------------
//------------------------- INIZIO PAGINA GIRONI ---------------------------------------
// Dom
const tableGironi = document.getElementById("tableGironi");

/**
 * Distribuisce i giocatori in gironi in modo circolare
 */
function distribuisciGiocatori(numeroGironi, listaGiocatori, listaGironi) {
  if (!listaGironi || listaGironi.length == 0) {
    const numeroGiocatori = listaGiocatori.length;
    const gironi = new Array(numeroGironi).fill(null).map(() => []);
    listaGiocatori.sort((a, b) => b.ranking - a.ranking);
    for (let i = 0; i < numeroGiocatori; i++) {
      const giocatore = listaGiocatori[i];
      const indiceGirone = i % numeroGironi;
      gironi[indiceGirone].push(giocatore);
    }
    return gironi;
  } else {
    return listaGironi;
  }
}

/**
 * Round robin
 */
function roundRobin(lunghezza) {
  let players = [];
  for (let index = 0; index < lunghezza; index++) {
    players.push(index + 1);
  }
  let rounds = [];
  if (players.length % 2 !== 0) players.push(null);
  let numRounds = players.length - 1;
  let half = players.length / 2;
  for (let round = 0; round < numRounds; round++) {
    let matches = [];
    for (let i = 0; i < half; i++) {
      let player1 = players[i];
      let player2 = players[numRounds - i];
      if (player1 !== null && player2 !== null)
        matches.push([player1, player2]);
    }
    rounds.push(matches);
    players.splice(1, 0, players.pop());
  }
  return rounds;
}

/**
 * Visualizza incontri in tabella
 */
export function renderincontri(lista) {
  let rounds = roundRobin(lista.length);
  let table = `<table class="pedi-tabella-incontri text-center mt-5">`;

  rounds.forEach((round) => {
    round.forEach(([i1, i2]) => {
      const atleta1 = lista[i1 - 1];
      const atleta2 = lista[i2 - 1];
      table += `<tr>
        <td>${atleta1.Cognome} ${atleta1.Nome}</td>
        <td>${i1} vs ${i2}</td>
        <td>${atleta2.Cognome} ${atleta2.Nome}</td>
      </tr>`;
    });
  });

  table += `</table>`;
  return table;
}

/**
 * Render gironi + gestione assalti
 */
export const renderGironi = (
  nomeTorneo,
  dataT,
  numeroGir,
  stato,
  idTorneo,
  controlloGironi,
  listaGironi
) => {
  recuperaAtleta(nomeTorneo, dataT).then((response) => {
    recuperaAssaltiGirone(idTorneo).then((assaltiGironi) => {
      data.classList.remove("d-none");
      spinner.classList.add("d-none");
      const partecipantiRedux = response.sort((a, b) => a.Ranking - b.Ranking);
      let countaGir = 0;
      distribuisciGiocatori(numeroGir, partecipantiRedux, listaGironi).forEach(
        (giocatoriDistribuiti) => {
          let assegnazioni = [];
          // giocatoriDistribuiti è già un array di atleti del singolo girone
          let html = `
    <div class="col-auto">
          <table class="pedi-tabella mt-5">
        <thead>
          <tr>
            <td>COGNOME</td>
            <td>NOME</td>`;
          // intestazioni numeriche (colonne degli avversari)
          for (let i = 0; i < giocatoriDistribuiti.length; i++) {
            html += `<td>${i + 1}</td>`;
          }
          html += `</tr></thead><tbody>`;
          // righe giocatori
          giocatoriDistribuiti.forEach((partecipante, index) => {
            assegnazioni.push({
              CodiceFIS: partecipante.CodiceFIS,
              Girone: countaGir + 1,
            });
            html += `
    <tr>
      <td>${partecipante.Cognome}</td>
      <td>${partecipante.Nome}</td>`;

            giocatoriDistribuiti.forEach((altroPartecipante, indexAltro) => {
              if (index !== indexAltro) {
                const assalto = assaltiGironi.find(
                  (a) =>
                    (a.IdAtleta1 === partecipante.CodiceFIS &&
                      a.IdAtleta2 === altroPartecipante.CodiceFIS) ||
                    (a.IdAtleta2 === partecipante.CodiceFIS &&
                      a.IdAtleta1 === altroPartecipante.CodiceFIS)
                );

                let risultato = "-";
                if (assalto) {
                  // separo risultato, ad esempio "V-3" oppure "V4-2"
                  const [p1, p2] = assalto.Risultato.split("-");

                  if (assalto.IdAtleta1 === partecipante.CodiceFIS) {
                    risultato = p1; // il giocatore di riga è Atleta1
                  } else if (assalto.IdAtleta2 === partecipante.CodiceFIS) {
                    risultato = p2; // il giocatore di riga è Atleta2
                  }
                }

                html += `<td>${risultato}</td>`;
              } else {
                html += `<td class="cella-diagonale"></td>`;
              }
            });

            html += "</tr>";
          });

          html += "</tbody></table></div>";
          countaGir++;
          if (controlloGironi) {
            assegnaGironi({ idTorneo, assegnazioni });
          }
          html += creaModalGironi(giocatoriDistribuiti, countaGir, stato);
          html += renderincontri(giocatoriDistribuiti);
          tableGironi.innerHTML += html;
        }
      );
      requestAnimationFrame(() => {
        // Gestione click sui bottoni "conferma"
        document.querySelectorAll(".conferma").forEach((button) => {
          button.onclick = () => {
            const nGirone = parseInt(button.id.replace("conferma", ""), 10);

            const atletaPrimo = document.getElementById(
              `select-1 girone-${nGirone}`
            ).value;
            const atletaSecondo = document.getElementById(
              `select-2 girone-${nGirone}`
            ).value;

            const punteggioPrimoRaw = document.getElementById(
              `girone-${nGirone} atleta-1`
            ).value;
            const punteggioSecondoRaw = document.getElementById(
              `girone-${nGirone} atleta-2`
            ).value;

            const punteggioPrimo = Number(punteggioPrimoRaw);
            const punteggioSecondo = Number(punteggioSecondoRaw);

            const punteggioValido = (val) =>
              val !== "" &&
              !isNaN(val) &&
              Number.isInteger(val) &&
              val >= 0 &&
              val <= 5;

            const punteggiValidi =
              punteggioValido(punteggioPrimo) &&
              punteggioValido(punteggioSecondo) &&
              punteggioPrimo !== punteggioSecondo;

            const atletiDiversi = atletaPrimo !== atletaSecondo;

            if (!punteggiValidi) {
              alert(
                "Inserisci punteggi interi tra 0 e 5 e assicurati che ci sia un vincitore."
              );
            } else if (!atletiDiversi) {
              alert("Non puoi inserire lo stesso atleta due volte.");
            } else {
              const assalto = checkPunteggi(
                atletaPrimo,
                punteggioPrimo,
                atletaSecondo,
                punteggioSecondo,
                idTorneo,
                "Girone"
              );
              aggiornaAssalti(assalto).then(() => {
                window.location.reload();
              });
            }

            resetFormGirone(nGirone);
          };
        });
      });
    });
  });
};

// Funzione di reset form
function resetFormGirone(nGirone) {
  document.getElementById(`girone-${nGirone} atleta-1`).value = "";
  document.getElementById(`girone-${nGirone} atleta-2`).value = "";
  document.getElementById(`select-1 girone-${nGirone}`).selectedIndex = 0;
  document.getElementById(`select-2 girone-${nGirone}`).selectedIndex = 0;
}

// Composizione oggetto assalto
function checkPunteggi(atleta1, punteggio1, atleta2, punteggio2, idT, tipo) {
  let vincitore, punteggioV, sconfitto, punteggioS;

  if (punteggio1 > punteggio2) {
    vincitore = atleta1;
    punteggioV = punteggio1;
    sconfitto = atleta2;
    punteggioS = punteggio2;
  } else {
    vincitore = atleta2;
    punteggioV = punteggio2;
    sconfitto = atleta1;
    punteggioS = punteggio1;
  }

  const risultato = `${
    punteggioV === 5 ? "V" : "V" + punteggioV
  }-${punteggioS}`;

  return {
    fisUno: vincitore,
    fisDue: sconfitto,
    idTorneo: idT,
    tipo: tipo,
    Risultato: risultato,
  };
}

const creaModalGironi = (girone, contatore, torneoStatus) => {
  let modal = `
   <div class="col-auto">
     <!-- Button trigger modal -->
     <button data-bs-toggle="modal" data-bs-target="#girone${contatore}" class="bottoni-page btn bottoni-rosa" type="button" %disabled>
       <img src="../edit.svg" class="pedi-icon" />
     </button>
   </div>
   <!-- Modal -->
   <div class="modal fade" id="girone${contatore}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
     <div class="modal-dialog modal-dialog-centered">
       <div class="modal-content">
         <div class="modal-header">
           <h1 class="modal-title fs-5" id="exampleModalLabel">Girone ${contatore}</h1>
           <button type="button" class="btn-close pedi-icon" data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">
           %CONTENUTO
         </div>
         <div class="modal-footer">
           <button type="button" id="conferma${contatore}" class="btn bottoni-rosa conferma" data-bs-dismiss="modal">Modifica</button>

         </div>
       </div>
     </div>
   </div>
  `;

  // gestione bottone disabilitato
  if (torneoStatus !== "Gironi") {
    modal = modal.replace("%disabled", "disabled");
  } else {
    modal = modal.replace("%disabled", "");
  }

  // corpo del modal
  let body = `<div class="row justify-content-center">`;

  // select 1
  let select1 = `
    <div class="col-auto">
      <select class="form-select plebeo" id="select-1 girone-${contatore}">
  `;
  girone.forEach((atleta) => {
    select1 += `<option value="${atleta.CodiceFIS}">${atleta.Cognome} ${atleta.Nome}</option>`;
  });
  select1 += `</select></div>`;
  body += select1;

  body += `
    <div class="col-auto">
      <input type="number" class="form-control punteggio" placeholder="Punteggio..." id="girone-${contatore} atleta-1">
    </div>
  </div>`;

  // select 2
  let select2 = `
    <div class="row justify-content-center mt-3">
      <div class="col-auto">
        <select class="form-select plebeo" id="select-2 girone-${contatore}">
  `;
  girone.forEach((atleta) => {
    select2 += `<option value="${atleta.CodiceFIS}">${atleta.Cognome} ${atleta.Nome}</option>`;
  });
  select2 += `</select></div>`;
  body += select2;

  body += `
    <div class="col-auto">
      <input type="number" class="form-control punteggio" placeholder="Punteggio..." id="girone-${contatore} atleta-2">
    </div>
  </div>`;

  modal = modal.replace("%CONTENUTO", body);
  return modal;
};

//------------------------- FINE PAGINA GIRONI  --------------------------------------------
//------------------------- INIZIO CLASSIFICA GIRONI ---------------------------------------

export const creaClassificaGironi = (
  nomeTorneo,
  dataT,
  percentualeElim,
  numeroGir,
  idTorneo
) => {
  recuperaAtleta(nomeTorneo, dataT).then((response) => {
    recuperaAssaltiGirone(idTorneo).then((assaltiGironi) => {
      data.classList.remove("d-none");
      spinner.classList.add("d-none");
      // ordina i partecipanti per ranking
      const partecipantiRedux = response.sort((a, b) => a.Ranking - b.Ranking);

      let countaGir = 0;
      const listaGir = [];

      for (let i = 1; i <= numeroGir; i++) {
        const atletiGirone = partecipantiRedux.filter(
          (a) => Number(a.Girone) === i
        );
        const tot = { girone: i, atleti: [] };

        atletiGirone.forEach((partecipante, index) => {
          const obj = {
            cognome: partecipante.Cognome,
            nome: partecipante.Nome,
            ranking: partecipante.Ranking,
            codiceFis: partecipante.CodiceFIS,
            assalti: [],
          };

          atletiGirone.forEach((altroPartecipante, indexAltro) => {
            if (index !== indexAltro) {
              const assalto = assaltiGironi.find(
                (a) =>
                  (a.IdAtleta1 === partecipante.CodiceFIS &&
                    a.IdAtleta2 === altroPartecipante.CodiceFIS) ||
                  (a.IdAtleta2 === partecipante.CodiceFIS &&
                    a.IdAtleta1 === altroPartecipante.CodiceFIS)
              );

              let punteggioTemp = "-";
              if (assalto) {
                const [p1, p2] = assalto.Risultato.split("-");
                if (assalto.IdAtleta1 === partecipante.CodiceFIS) {
                  punteggioTemp = p1;
                } else {
                  punteggioTemp = p2;
                }
              }
              obj.assalti.push(punteggioTemp);
            } else {
              obj.assalti.push(" ");
            }
          });

          tot.atleti.push(obj);
        });

        listaGir.push(tot);
      }

      // render della classifica finale
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

      // stoccate date
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

      // stoccate subite
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
        codiceFis: atl.codiceFis,
        cognome: atl.cognome,
        nome: atl.nome,
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

const renderClassificaGironi = (classifica) => {
  const classificaGironiTabella = document.getElementById(
    "classificaGironiTabella"
  );

  // intestazione senza SOCIETA
  const templateClassGir = `
    <tr>
      <th>POS</th>
      <th>COGNOME</th>
      <th>NOME</th>
      <th>V/A</th>
      <th>DIFF.</th>
      <th>DATE</th>
      <th>STATO</th>
    </tr>`;

  let html = templateClassGir;

  classifica.forEach((element, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${element.cognome}</td>
        <td>${element.nome}</td>
        <td>${element.aliquota}</td>
        <td>${element.differenza}</td>
        <td>${element.date}</td>
        <td style="color:${element.stato === "Qualificato" ? "lime" : "red"}">
          ${element.stato}
        </td>
      </tr>`;
  });

  classificaGironiTabella.innerHTML = html;
};

//------------------------- FINE CLASSIFICA GIRONI  ----------------------------------------
//------------------------- INIZIO ELIMINAZIONE DIRETTA  ----------------------------------------
export const renderEliminazioneDiretta = (
  nomeTorneo,
  dataT,
  percentualeElim,
  numeroGir,
  idTorneo
) => {
  recuperaAtleta(nomeTorneo, dataT).then((response) => {
    recuperaAssaltiGirone(idTorneo).then((assaltiGironi) => {
      recuperaAssaltiTabellone(idTorneo).then((assaltiTabellone) => {
        data.classList.remove("d-none");
        spinner.classList.add("d-none");

        const partecipantiRedux = response.sort(
          (a, b) => a.Ranking - b.Ranking
        );

        let countaGir = 0;
        const listaGir = [];

        distribuisciGiocatori(numeroGir, partecipantiRedux).forEach(
          (giocatoriDistribuiti) => {
            const tot = {};
            tot["girone"] = countaGir++;
            const lista = [];

            giocatoriDistribuiti.forEach((partecipante, index) => {
              let obj = {};
              obj["cognome"] = partecipante.Cognome;
              obj["nome"] = partecipante.Nome;
              obj["ranking"] = partecipante.Ranking;
              obj["codiceFis"] = partecipante.CodiceFIS;
              obj["assalti"] = [];

              giocatoriDistribuiti.forEach((altroPartecipante, indexAltro) => {
                if (index !== indexAltro) {
                  const assalto = assaltiGironi.find(
                    (a) =>
                      (a.IdAtleta1 === partecipante.CodiceFIS &&
                        a.IdAtleta2 === altroPartecipante.CodiceFIS) ||
                      (a.IdAtleta2 === partecipante.CodiceFIS &&
                        a.IdAtleta1 === altroPartecipante.CodiceFIS)
                  );

                  let punteggioTemp = "-";
                  if (assalto) {
                    const [p1, p2] = assalto.Risultato.split("-");
                    punteggioTemp =
                      assalto.IdAtleta1 === partecipante.CodiceFIS ? p1 : p2;
                  }
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

        const classificaCompleta = riordinaLista(
          creaClassGir(listaGir, creaMatrici(listaGir)),
          percentualeElim
        );

        //filtro solo i qualificati
        const qualificati = classificaCompleta.filter(
          (a) => a.stato === "Qualificato"
        );

        let primoTabellone = generaAccoppiamenti(qualificati, assaltiTabellone);

        // Creo l'oggetto fasi
        const fasi = {};
        let dimensione = primoTabellone.length * 2;
        let nextTabellone = primoTabellone.map((m) => ({
          ...m,
          atleta1: m.atleta1
            ? { ...m.atleta1, risultato: m.risultato.split("-")[0] }
            : "",
          atleta2: m.atleta2
            ? { ...m.atleta2, risultato: m.risultato.split("-")[1] }
            : "",
        }));

        const primoTabName = primoTabellone[0]?.tabellone || `tab${dimensione}`;
        fasi[primoTabName] = nextTabellone;
        // Genero i tabelloni successivi propagando i vincitori
        while (dimensione > 2) {
          const nextDimensione = dimensione / 2;
          const tabName = `tab${nextDimensione}`;
          const matches = [];

          const vincitori = [];
          fasi[`tab${dimensione}`].forEach((match) => {
            const a1 = match.atleta1;
            const a2 = match.atleta2;

            if (a1 && a2 && a1.risultato !== "" && a2.risultato !== "") {
              const p1 = parseInt(a1.risultato);
              const p2 = parseInt(a2.risultato);
              if (!isNaN(p1) && !isNaN(p2)) {
                vincitori.push(p1 > p2 ? a1 : a2);
              }
            } else if (a1 && !a2) {
              vincitori.push(a1);
            } else if (!a1 && a2) {
              vincitori.push(a2);
            }
          });

          for (let i = 0; i < vincitori.length; i += 2) {
            const atleta1 = vincitori[i] || "";
            const atleta2 = vincitori[i + 1] || "";

            // Verifica se esiste già un assalto con risultato valido
            const assaltoEsistente = assaltiTabellone.find(
              (a) =>
                ((a.IdAtleta1 === atleta1.codiceFis &&
                  a.IdAtleta2 === atleta2.codiceFis) ||
                  (a.IdAtleta2 === atleta1.codiceFis &&
                    a.IdAtleta1 === atleta2.codiceFis)) &&
                a.Risultato !== "-" &&
                a.Risultato !== ""
            );

            let risultato = "-";
            let atleta1Ris = "";
            let atleta2Ris = "";

            if (assaltoEsistente) {
              const [p1, p2] = assaltoEsistente.Risultato.split("-");
              if (assaltoEsistente.IdAtleta1 === atleta1.codiceFis) {
                atleta1Ris = p1;
                atleta2Ris = p2;
              } else {
                atleta1Ris = p2;
                atleta2Ris = p1;
              }
              risultato = assaltoEsistente.Risultato;
            }

            matches.push({
              tabellone: tabName,
              match: `${i + 1}-${nextDimensione - i}`,
              atleta1: atleta1 ? { ...atleta1, risultato: atleta1Ris } : "",
              atleta2: atleta2 ? { ...atleta2, risultato: atleta2Ris } : "",
              risultato,
            });
          }

          fasi[tabName] = matches;
          dimensione = nextDimensione;
        }
        // Genero HTML
        const htmlTabellone = generaHTMLTabellone(fasi);

        const bracketArea = document.getElementById("bracketArea");
        if (bracketArea) {
          bracketArea.innerHTML = htmlTabellone;
        } else {
          const div = document.createElement("div");
          div.id = "bracketArea";
          div.innerHTML = htmlTabellone;
          document.getElementById("data").appendChild(div);
        }
      });
    });
  });
};

function generaAccoppiamenti(classifica, assaltiTabellone) {
  const ordinati = classifica.map((atleta, index) => ({
    ...atleta,
    PosizioneProvv: index + 1,
  }));

  const n = ordinati.length;
  const schemi = {
    4: [
      [1, 4],
      [2, 3],
    ],
    8: [
      [1, 8],
      [4, 5],
      [3, 6],
      [2, 7],
    ],
    16: [
      [1, 16],
      [8, 9],
      [5, 12],
      [4, 13],
      [3, 14],
      [6, 11],
      [7, 10],
      [2, 15],
    ],
    32: [
      [1, 32],
      [16, 17],
      [9, 24],
      [8, 25],
      [5, 28],
      [12, 21],
      [13, 20],
      [4, 29],
      [3, 30],
      [14, 19],
      [11, 22],
      [6, 27],
      [7, 26],
      [10, 23],
      [15, 18],
      [2, 31],
    ],
  };

  const potenze = [4, 8, 16, 32];
  const dimensioneTabellone = potenze.find((p) => n <= p) || 32;
  const schema = schemi[dimensioneTabellone];

  return schema
    .map(([p1, p2]) => {
      const atleta1 = ordinati.find((a) => a.PosizioneProvv === p1) || "";
      const atleta2 = ordinati.find((a) => a.PosizioneProvv === p2) || "";

      const assalto = assaltiTabellone.find(
        (a) =>
          (a.IdAtleta1 === atleta1.codiceFis &&
            a.IdAtleta2 === atleta2.codiceFis) ||
          (a.IdAtleta2 === atleta1.codiceFis &&
            a.IdAtleta1 === atleta2.codiceFis)
      );

      let risultato = "-";
      let atleta1Ris = "";
      let atleta2Ris = "";
      if (assalto && assalto.Risultato !== "-") {
        const [p1, p2] = assalto.Risultato.split("-");
        if (assalto.IdAtleta1 === atleta1.codiceFis) {
          atleta1Ris = p1;
          atleta2Ris = p2;
        } else {
          atleta1Ris = p2;
          atleta2Ris = p1;
        }
        risultato = atleta1Ris + "-" + atleta2Ris;
      }

      return {
        tabellone: `tab${dimensioneTabellone}`,
        match: `${p1}-${p2}`,
        atleta1: atleta1 ? { ...atleta1, risultato: atleta1Ris } : "",
        atleta2: atleta2 ? { ...atleta2, risultato: atleta2Ris } : "",
        risultato,
      };
    })
    .filter((m) => m.atleta1 || m.atleta2);
}

export function generaHTMLTabellone(fasi) {
  if (!fasi || Object.keys(fasi).length === 0)
    return "<p>Nessun tabellone disponibile</p>";

  const titoli = {
    tab32: "Sedicesimi di Finale",
    tab16: "Ottavi di Finale",
    tab8: "Quarti di Finale",
    tab4: "Semifinali",
    tab2: "Finale",
  };

  function generaFaseHTML(tabName, matchList) {
    if (!matchList || matchList.length === 0) return "";

    const matchHTML = matchList
      .map(
        (m) => `
      <div class="match-box">
        <div class="athlete ${
          m.risultato?.vincitore === "atleta1" ? "winner" : ""
        }">
        <div class="pos">${
          m.atleta1 ? `(${m.atleta1.PosizioneProvv})` : ""
        }</div>
          <div class="name">${
            m.atleta1 ? `${m.atleta1.nome} ${m.atleta1.cognome}` : "Bye"
          }</div>

          <div class="score">${m.atleta1?.risultato || ""}</div>
        </div>
        <div class="athlete ${
          m.risultato?.vincitore === "atleta2" ? "winner" : ""
        }">
        <div class="pos">${
          m.atleta2 ? `(${m.atleta2.PosizioneProvv})` : ""
        }</div>
          <div class="name">${
            m.atleta2 ? `${m.atleta2.nome} ${m.atleta2.cognome}` : "Bye"
          }</div>
          <div class="score">${m.atleta2?.risultato || ""}</div>
        </div>
      </div>
    `
      )
      .join("");
    return `
      <div class="bracket-round pedi-card-page">
        <div class="round-title">${titoli[tabName] || tabName}</div>
        ${matchHTML}
      </div>
    `;
  }

  const ordine = ["tab32", "tab16", "tab8", "tab4", "tab2"];
  const fasiOrdinate = ordine.filter((o) => fasi[o]);
  const htmlFasi = fasiOrdinate
    .map((fase) => generaFaseHTML(fase, fasi[fase]))
    .join("");

  return `<div class="bracket-wrapper">${htmlFasi}</div>`;
}
//------------------------- FINE ELIMINAZIONE DIRETTA  ----------------------------------------
//------------------------- INIZIO CLASSIFICA FINALE ---------------------------------------

export const creaClassificaFinale = (
  nomeTorneo,
  dataT,
  percentualeElim,
  numeroGir,
  idTorneo
) => {
  recuperaAtleta(nomeTorneo, dataT).then((response) => {
    recuperaAssaltiGirone(idTorneo).then((assaltiGironi) => {
      recuperaAssaltiTabellone(idTorneo).then((assaltiTabellone) => {
        data.classList.remove("d-none");
        spinner.classList.add("d-none");

        const partecipantiRedux = response.sort(
          (a, b) => a.Ranking - b.Ranking
        );

        let countaGir = 0;
        const listaGir = [];

        distribuisciGiocatori(numeroGir, partecipantiRedux).forEach(
          (giocatoriDistribuiti) => {
            const tot = {};
            tot["girone"] = countaGir++;
            const lista = [];

            giocatoriDistribuiti.forEach((partecipante, index) => {
              let obj = {};
              obj["cognome"] = partecipante.Cognome;
              obj["nome"] = partecipante.Nome;
              obj["ranking"] = partecipante.Ranking;
              obj["codiceFis"] = partecipante.CodiceFIS;
              obj["assalti"] = [];

              giocatoriDistribuiti.forEach((altroPartecipante, indexAltro) => {
                if (index !== indexAltro) {
                  const assalto = assaltiGironi.find(
                    (a) =>
                      (a.IdAtleta1 === partecipante.CodiceFIS &&
                        a.IdAtleta2 === altroPartecipante.CodiceFIS) ||
                      (a.IdAtleta2 === partecipante.CodiceFIS &&
                        a.IdAtleta1 === altroPartecipante.CodiceFIS)
                  );

                  let punteggioTemp = "-";
                  if (assalto) {
                    const [p1, p2] = assalto.Risultato.split("-");
                    punteggioTemp =
                      assalto.IdAtleta1 === partecipante.CodiceFIS ? p1 : p2;
                  }
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

        let classificaPostGironi = riordinaLista(
          creaClassGir(listaGir, creaMatrici(listaGir)),
          percentualeElim
        );

        const classificaCompleta = riordinaLista(
          creaClassGir(listaGir, creaMatrici(listaGir)),
          percentualeElim
        );

        //filtro solo i qualificati
        const qualificati = classificaCompleta.filter(
          (a) => a.stato === "Qualificato"
        );

        let primoTabellone = generaAccoppiamenti(qualificati, assaltiTabellone);

        // Creo l'oggetto fasi
        const fasi = {};
        let dimensione = primoTabellone.length * 2;
        let nextTabellone = primoTabellone.map((m) => ({
          ...m,
          atleta1: m.atleta1
            ? { ...m.atleta1, risultato: m.risultato.split("-")[0] }
            : "",
          atleta2: m.atleta2
            ? { ...m.atleta2, risultato: m.risultato.split("-")[1] }
            : "",
        }));

        const primoTabName = primoTabellone[0]?.tabellone || `tab${dimensione}`;
        fasi[primoTabName] = nextTabellone;
        // Genero i tabelloni successivi propagando i vincitori
        while (dimensione > 2) {
          const nextDimensione = dimensione / 2;
          const tabName = `tab${nextDimensione}`;
          const matches = [];

          const vincitori = [];
          fasi[`tab${dimensione}`].forEach((match) => {
            const a1 = match.atleta1;
            const a2 = match.atleta2;

            if (a1 && a2 && a1.risultato !== "" && a2.risultato !== "") {
              const p1 = parseInt(a1.risultato);
              const p2 = parseInt(a2.risultato);
              if (!isNaN(p1) && !isNaN(p2)) {
                vincitori.push(p1 > p2 ? a1 : a2);
              }
            } else if (a1 && !a2) {
              vincitori.push(a1);
            } else if (!a1 && a2) {
              vincitori.push(a2);
            }
          });

          for (let i = 0; i < vincitori.length; i += 2) {
            const atleta1 = vincitori[i] || "";
            const atleta2 = vincitori[i + 1] || "";

            // Verifica se esiste già un assalto con risultato valido
            const assaltoEsistente = assaltiTabellone.find(
              (a) =>
                ((a.IdAtleta1 === atleta1.codiceFis &&
                  a.IdAtleta2 === atleta2.codiceFis) ||
                  (a.IdAtleta2 === atleta1.codiceFis &&
                    a.IdAtleta1 === atleta2.codiceFis)) &&
                a.Risultato !== "-" &&
                a.Risultato !== ""
            );

            let risultato = "-";
            let atleta1Ris = "";
            let atleta2Ris = "";

            if (assaltoEsistente) {
              const [p1, p2] = assaltoEsistente.Risultato.split("-");
              if (assaltoEsistente.IdAtleta1 === atleta1.codiceFis) {
                atleta1Ris = p1;
                atleta2Ris = p2;
              } else {
                atleta1Ris = p2;
                atleta2Ris = p1;
              }
              risultato = assaltoEsistente.Risultato;
            }

            matches.push({
              tabellone: tabName,
              match: `${i + 1}-${nextDimensione - i}`,
              atleta1: atleta1 ? { ...atleta1, risultato: atleta1Ris } : "",
              atleta2: atleta2 ? { ...atleta2, risultato: atleta2Ris } : "",
              risultato,
            });
          }

          fasi[tabName] = matches;
          dimensione = nextDimensione;
        }
        const classificaFinale = generaClassificaFinale(
          fasi,
          classificaPostGironi
        );
        renderClassificaFinale(classificaFinale);
      });
    });
  });
};

const generaClassificaFinale = (fasi, classificaPostGironi) => {
  const classifica = [];
  const giàPiazzati = new Set();

  // Finale: 1° e 2°
  const finali = fasi.tab2?.[0];
  if (finali) {
    const p1 = parseInt(finali.atleta1.risultato);
    const p2 = parseInt(finali.atleta2.risultato);
    const vincitore = p1 > p2 ? finali.atleta1 : finali.atleta2;
    const perdente = p1 > p2 ? finali.atleta2 : finali.atleta1;
    classifica.push(vincitore, perdente);
    giàPiazzati.add(vincitore.codiceFis);
    giàPiazzati.add(perdente.codiceFis);
  }

  // Semifinali: 3° pari merito (senza ordinamento)
  (fasi.tab4 || []).forEach((match) => {
    const p1 = parseInt(match.atleta1.risultato);
    const p2 = parseInt(match.atleta2.risultato);
    const perdente = p1 > p2 ? match.atleta2 : match.atleta1;
    if (!giàPiazzati.has(perdente.codiceFis)) {
      classifica.push(perdente);
      giàPiazzati.add(perdente.codiceFis);
    }
  });

  // Tabelloni precedenti (tab8, tab16, tab32, …)
  const tabelloni = Object.keys(fasi)
    .filter((k) => k.startsWith("tab"))
    .map((k) => parseInt(k.replace("tab", "")))
    .filter((n) => n >= 8)
    .sort((a, b) => a - b); // dal più grande al più piccolo

  tabelloni.forEach((n) => {
    const matches = fasi[`tab${n}`] || [];
    const perdenti = matches
      .map((match) => {
        const a1 = match.atleta1;
        const a2 = match.atleta2;
        if (!a1 || !a2 || match.risultato === "-" || match.risultato === "")
          return null;
        const p1 = parseInt(a1.risultato);
        const p2 = parseInt(a2.risultato);
        return p1 > p2 ? a2 : a1;
      })
      .filter(Boolean)
      .filter((a) => !giàPiazzati.has(a.codiceFis))
      .sort((a, b) => a.PosizioneProvv - b.PosizioneProvv);

    classifica.push(...perdenti);
    perdenti.forEach((a) => giàPiazzati.add(a.codiceFis));
  });

  // Eliminati nei gironi
  const eliminatiGironi = classificaPostGironi
    .filter((a) => !giàPiazzati.has(a.codiceFis))
    .sort((a, b) => a.PosizioneProvv - b.PosizioneProvv)
    .map((a) => ({
      codiceFis: a.codiceFis,
      cognome: a.cognome,
      nome: a.nome,
    }));
  classifica.push(...eliminatiGironi);

  // Output normalizzato
  return classifica.map((a) => ({
    codicefis: a.codiceFis,
    cognome: a.cognome,
    nome: a.nome,
  }));
};

const renderClassificaFinale = (classifica) => {
  const classificaFinaleTabella = document.getElementById(
    "classificaFinaleTabella"
  );

  // intestazione senza SOCIETA
  const templateClassGir = `
    <tr>
      <th>POS</th>
      <th>CODICE FIS</th>
      <th>COGNOME</th>
      <th>NOME</th>
    </tr>`;

  let html = templateClassGir;

  classifica.forEach((element, index) => {
    if (index == 3) {
      html += `
      <tr>
        <td>${3}</td>
        <td>${element.codicefis}</td>
        <td>${element.cognome}</td>
        <td>${element.nome}</td>
      </tr>`;
    } else {
      html += `
      <tr>
        <td>${index + 1}</td>
        <td>${element.codicefis}</td>
        <td>${element.cognome}</td>
        <td>${element.nome}</td>
      </tr>`;
    }
  });

  classificaFinaleTabella.innerHTML = html;
};
//------------------------- FINE CLASSIFICA FINALE  ----------------------------------------
