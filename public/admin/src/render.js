//Import moduli
import {
  recuperaTornei,
  recuperaAtleta,
  assegnaGironi,
  //iscriviUtenteReg,
  //recuperaStorico,
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
          <svg height="40" width="40">
            <circle cx="20" cy="20" r="20" fill="%STATUS" />
          </svg>
          <p class="badge text-wrap">%TITOLO</p>
        </div>
        <div class="col-auto"> 
        <button class="bottoni-barra modifica" id="%COUNT" type="button">
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
            .replace("%STATUS", tornei[0].Stato ? "green" : "red")
            .replace("%disabled", tornei[0].Stato ? "disabled" : " ")
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
                .replace("%STATUS", svolto ? "green" : "red")
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
            eliminaTorneo({ nome: id[1], data: id[2] }).then((response) => {
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
  let table = `<table class="table table-bordered text-white text-center pedi-tabella mt-5">`;

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
      <table class="table table-bordered text-white text-center pedi-tabella mt-5">
        <thead>
          <tr>
            <th>COGNOME</th>
            <th>NOME</th>
            <th>RANK</th>`;
          // intestazioni numeriche (colonne degli avversari)
          for (let i = 0; i < giocatoriDistribuiti.length; i++) {
            html += `<th>${i + 1}</th>`;
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
      <td>${partecipante.Nome}</td>
      <td>${partecipante.Ranking}</td>`;

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
                html += "<td></td>";
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

      // Gestione click sui bottoni "conferma"
      document.querySelectorAll(".conferma").forEach((button) => {
        button.onclick = () => {
          const nGirone = parseInt(button.id.replace("conferma", ""), 10);

          const punteggioPrimo = Number(
            document.getElementById(`girone-${nGirone} atleta-1`).value
          );
          const punteggioSecondo = Number(
            document.getElementById(`girone-${nGirone} atleta-2`).value
          );
          const atletaPrimo = document.getElementById(
            `select-1 girone-${nGirone}`
          ).value;
          const atletaSecondo = document.getElementById(
            `select-2 girone-${nGirone}`
          ).value;

          // Validazioni
          const punteggiValidi =
            !isNaN(punteggioPrimo) &&
            !isNaN(punteggioSecondo) &&
            punteggioPrimo >= 0 &&
            punteggioPrimo <= 5 &&
            punteggioSecondo >= 0 &&
            punteggioSecondo <= 5 &&
            punteggioPrimo !== punteggioSecondo;

          if (punteggiValidi && atletaPrimo !== atletaSecondo) {
            const assalto = checkPunteggi(
              atletaPrimo,
              punteggioPrimo,
              atletaSecondo,
              punteggioSecondo,
              idTorneo
            );
            aggiornaAssalti(assalto).then(() => {
              window.location.reload();
            });
          } else {
            alert("Errore nella compilazione");
          }

          resetFormGirone(nGirone);
        };
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
function checkPunteggi(atleta1, punteggio1, atleta2, punteggio2, idT) {
  const obj = {
    fisUno: atleta1,
    fisDue: atleta2,
    idTorneo: idT,
  };

  if (punteggio1 > punteggio2) {
    obj.atleta1 = punteggio1 === 5 ? "V" : "V" + punteggio1;
    obj.atleta2 = punteggio2;
  } else {
    obj.atleta1 = punteggio1;
    obj.atleta2 = punteggio2 === 5 ? "V" : "V" + punteggio2;
  }

  return obj;
}

const creaModalGironi = (girone, contatore, torneoStatus) => {
  let modal = `
   <div class="col-auto">
     <!-- Button trigger modal -->
     <button data-bs-toggle="modal" data-bs-target="#girone${contatore}" class="bottoni-page" type="button" %disabled>
       <img src="../edit.svg" class="pedi-icon" />
     </button>
   </div>
   <!-- Modal -->
   <div class="modal fade" id="girone${contatore}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
     <div class="modal-dialog modal-dialog-centered">
       <div class="modal-content">
         <div class="modal-header">
           <h1 class="modal-title fs-5" id="exampleModalLabel">Girone ${contatore}</h1>
           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
         </div>
         <div class="modal-body">
           %CONTENUTO
         </div>
         <div class="modal-footer">
           <button type="button" id="conferma${contatore}" class="btn btn-success conferma" data-bs-dismiss="modal">Modifica</button>
         </div>
       </div>
     </div>
   </div>
  `;

  // gestione bottone disabilitato
  if (torneoStatus == 0) {
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
                // cerca assalto relativo a questa coppia
                const assalto = assaltiGironi.find(
                  (a) =>
                    (a.IdAtleta1 === partecipante.CodiceFIS &&
                      a.IdAtleta2 === altroPartecipante.CodiceFIS) ||
                    (a.IdAtleta2 === partecipante.CodiceFIS &&
                      a.IdAtleta1 === altroPartecipante.CodiceFIS)
                );

                let punteggioTemp = "-";
                if (assalto) {
                  // separo risultato (es. "V-3", "V4-2")
                  const [p1, p2] = assalto.Risultato.split("-");

                  if (assalto.IdAtleta1 === partecipante.CodiceFIS) {
                    punteggioTemp = p1;
                  } else if (assalto.IdAtleta2 === partecipante.CodiceFIS) {
                    punteggioTemp = p2;
                  }
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
      data.classList.remove("d-none");
      spinner.classList.add("d-none");
      // ordina i partecipanti per ranking
      const partecipantiRedux = response.sort((a, b) => a.Ranking - b.Ranking);
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
                // cerca assalto relativo a questa coppia
                const assalto = assaltiGironi.find(
                  (a) =>
                    (a.IdAtleta1 === partecipante.CodiceFIS &&
                      a.IdAtleta2 === altroPartecipante.CodiceFIS) ||
                    (a.IdAtleta2 === partecipante.CodiceFIS &&
                      a.IdAtleta1 === altroPartecipante.CodiceFIS)
                );

                let punteggioTemp = "-";
                if (assalto) {
                  // separo risultato (es. "V-3", "V4-2")
                  const [p1, p2] = assalto.Risultato.split("-");

                  if (assalto.IdAtleta1 === partecipante.CodiceFIS) {
                    punteggioTemp = p1;
                  } else if (assalto.IdAtleta2 === partecipante.CodiceFIS) {
                    punteggioTemp = p2;
                  }
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
      // calcolo della classifica post gironi
      let primoTabellone = generaAccoppiamenti(
        riordinaLista(
          creaClassGir(listaGir, creaMatrici(listaGir)),
          percentualeElim
        )
      );
      console.log(primoTabellone);
    });
  });
};

function generaAccoppiamenti(classifica) {
  // Assegna posizione provvisoria in base all'indice (input già ordinato)
  const ordinati = classifica.map((atleta, index) => ({
    ...atleta,
    PosizioneProvv: index + 1,
  }));

  const n = ordinati.length;

  // Schemi di accoppiamento standard
  const schemi = {
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

  // Trova la dimensione tabellone corretta
  const potenze = [8, 16, 32];
  const dimensioneTabellone = potenze.find((p) => n <= p) || 32;
  const schema = schemi[dimensioneTabellone];

  // Genera accoppiamenti
  const accoppiamenti = schema.map(([p1, p2]) => {
    const atleta1 = ordinati.find((a) => a.PosizioneProvv === p1) || null;
    const atleta2 = ordinati.find((a) => a.PosizioneProvv === p2) || null;
    return {
      tabellone: `tab${dimensioneTabellone}`, // 👈 fase del tabellone
      match: `${p1}-${p2}`,
      atleta1,
      atleta2,
      risultato: null,
    };
  });

  // Rimuove match completamente vuoti
  return accoppiamenti.filter((m) => m.atleta1 || m.atleta2);
}

// 🏆 Genera il turno successivo dai vincitori
function generaTurnoSuccessivo(matchCorrenti) {
  if (!matchCorrenti || matchCorrenti.length === 0) return [];

  // Ricava la dimensione attuale del tabellone (es. 8 da "tab8")
  const tabelloneAttuale = parseInt(
    matchCorrenti[0].tabellone.replace("tab", ""),
    10
  );
  const nuovoTabellone = tabelloneAttuale / 2;

  if (nuovoTabellone < 1) return []; // finale già conclusa

  const nuoviMatch = [];

  for (let i = 0; i < matchCorrenti.length; i += 2) {
    const match1 = matchCorrenti[i];
    const match2 = matchCorrenti[i + 1];

    // Determina vincitori (qui assumiamo che risultato contenga "atleta1" o "atleta2")
    const vincitore1 =
      match1?.risultato === "atleta1" ? match1.atleta1 : match1.atleta2;
    const vincitore2 =
      match2?.risultato === "atleta1" ? match2.atleta1 : match2?.atleta2;

    nuoviMatch.push({
      tabellone: `tab${nuovoTabellone}`,
      match: `${i + 1}-${i + 2}`,
      atleta1: vincitore1 || null,
      atleta2: vincitore2 || null,
      risultato: null,
    });
  }

  return nuoviMatch;
}

//------------------------- FINE ELIMINAZIONE DIRETTA  ----------------------------------------
