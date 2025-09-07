//Import moduli
import {
  recuperaTornei,
  recuperaAtleta,
  recuperaEliminazioneDiretta,
  recuperaGironi,recuperaAssaltiGirone
} from "./cache.js";
//condivisa da tutti gli html
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
      <div class="row justify-content-start fs-3 text-white">
        <div class="col-auto">
          <svg height="40" width="40">
            <circle cx="20" cy="20" r="20" fill="%STATUS" />
          </svg>
        </div>
        <div class="col-auto">%TITOLO</div>
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
        const { nome, data, svolto } = tornei[0];
        // prendo il primo valore
        row = templateFirstTornei.replace(
          "%value",
          templateDivTornei
            .replace("%DIM", "w-100")
            .replace("%ID", nome + "_" + data + "_" + svolto)
            .replace("%TITOLO", nome)
            .replace("%STATUS", svolto ? "red" : "green")
        );

        if (tornei.length > 1) {
          row += `<div class="row mt-2">`;
          for (let i = 1; i < tornei.length; i++) {
            const { nome, data, svolto } = tornei[i];
            row += templateTdTornei.replace(
              "%value",
              templateDivTornei
                .replace("%DIM", "w-100")
                .replace("%ID", nome + "_" + data + "_" + svolto)
                .replace("%TITOLO", nome)
                .replace("%STATUS", svolto ? "red" : "green")
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
              id[1]+"&svolto=0";
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
          html += renderincontri(giocatoriDistribuiti);
          tableGironi.innerHTML += html;
            }
          );
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
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
//------------------------- INIZIO PAGINA ELIMINAZIONE DIRETTA -----------------------------
//Dom
const tabellone = document.getElementById("tabellone");
/*
//Template
const templateTr = "<tr>%DATA</tr>";
const templateTd =
  "<td><div><p>%INDICEUNO %COGNOMEUNO %NOMEUNO --- %INDICEDUE %COGNOMEDUE %NOMEDUE</p></div></td>";
*/
/**
 * Funzione per recuperare i gironi per l'eliminazione diretta
 * @param {*} nomeTorneo
 * @param {*} data
 * @param {*} percentualeElim
 * @param {*} numeroGir
 * @returns
 */
export const recuperaGironiElD = (
  nomeTorneo,
  data,
  percentualeElim,
  numeroGir
) => {
  return new Promise((resolve, reject) => {
    recuperaGironi(nomeTorneo, data)
      .then((response) => {
        if (response) {
          let contaGirone = 1;
          const listaGir = [];
          //Divisione per gironi
          let divisiPerGirone = dividiPerGirone(response);
          //Accoppiamento atleti con stesso assalto (Sfidante vs Sfidato)
          const divisiPerAssalto = accoppiaPerAssalto(divisiPerGirone);
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
              (result) => {
                const tot = {};
                tot["girone"] = contaGirone++;
                const lista = [];
                result.forEach((partecipante, index) => {
                  let obj = {};
                  const assaltiInComune = [];
                  divisiPerAssalto.forEach((girone) => {
                    girone.partecipanti.forEach((assalto) => {
                      if (
                        assalto.partecipanteUno.codiceFis ===
                          partecipante.codiceFis ||
                        assalto.partecipanteDue.codiceFis ===
                          partecipante.codiceFis
                      ) {
                        assaltiInComune.push(assalto);
                      }
                    });
                  });

                  obj["cognome"] = partecipante.cognome;
                  obj["nome"] = partecipante.nome;
                  obj["ranking"] = partecipante.ranking;
                  obj["societa"] = partecipante.societa;
                  obj["assalti"] = [];

                  result.forEach((altroPartecipante, indexAltro) => {
                    if (index !== indexAltro) {
                      let punteggioTemp = "-";
                      assaltiInComune.forEach((assalto) => {
                        if (
                          (assalto.partecipanteUno.codiceFis ===
                            partecipante.codiceFis &&
                            assalto.partecipanteDue.codiceFis ===
                              altroPartecipante.codiceFis) ||
                          (assalto.partecipanteDue.codiceFis ===
                            partecipante.codiceFis &&
                            assalto.partecipanteUno.codiceFis ===
                              altroPartecipante.codiceFis)
                        ) {
                          punteggioTemp =
                            assalto.partecipanteUno.codiceFis ===
                            partecipante.codiceFis
                              ? assalto.partecipanteUno.punteggio
                              : assalto.partecipanteDue.punteggio;
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
          //recupero la classifica gironi e la uso per creare il tabellone delle eliminazioni dirette
          resolve(
            riordinaLista(
              creaClassGir(listaGir, creaMatrici(listaGir)),
              percentualeElim
            )
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
};
/**
 * Funzione per recuperare la classifica dei gironi
 * @returns
 */
const recuperaClassificaGironi = (idParam, dataParam) => {
  return new Promise((resolve, reject) => {
    recuperaTornei().then((response) => {
      response.forEach((torneo) => {
        if (torneo.nome === idParam && torneo.data === dataParam) {
          const { percentualeEliminazione, nGironi } = torneo;
          recuperaGironiElD(
            idParam,
            dataParam,
            percentualeEliminazione,
            nGironi
          ).then((response) => resolve(response));
        }
      });
    });
  });
};
/**
 * Funzione per generare un array di json. Ogni json rappresenta una fase ad eliminazione diretta
 * @param {*} response
 * @returns
 */
const riordinaEliminazione = (response) => {
  const riordinatiPerEliminazione = [];
  //riordina per stessa eliminazione diretta
  response.forEach((partecipante) => {
    const index = riordinatiPerEliminazione.findIndex((element) => {
      return element.id === partecipante.tipologia;
    });
    if (index !== -1) {
      riordinatiPerEliminazione[index].partecipanti.push(partecipante);
    } else {
      riordinatiPerEliminazione.push({
        id: partecipante.tipologia,
        partecipanti: [partecipante],
      });
    }
  });
  return riordinatiPerEliminazione;
};
/**
 * Funzione per aggiustare il numero di partecipanti ad una fase ad eliminazione diretta
 * @param {*} array
 * @param {*} lunghezza
 * @returns
 */
/*
const aggiustaPartecipanti = (array, lunghezza) => {
  //metto il numero di partecipanti
  for (let i = 0; i < lunghezza; i++) {
    array.push({
      cognome: null,
      nome: null,
      date: null,
      differenza: null,
      nome: null,
      societa: null,
      stato: null,
      subite: null,
    });
  }
  return array;
};
*/

/**
 * Funzione per recuperare le eliminazioni dirette
 * @param {*} classificaGironi
 * @returns
 */
/*
const recuperaEliminazioneDirettaFunction = (
  classificaGironi,
  idParam,
  dataParam
) => {
  return new Promise((resolve, reject) => {
    recuperaEliminazioneDiretta(idParam, dataParam).then((response) => {
      const eliminazioni = riordinaEliminazione(response);
      let numeroTabelloneMassimo = [];
      const tabelloni = [];
      response.forEach((persona) => {
        const tabTemp = parseInt(
          persona.tipologia.replace("Eliminazione diretta tab ", "")
        );
        if (!numeroTabelloneMassimo.includes(tabTemp))
          numeroTabelloneMassimo.push(tabTemp);
      });
      //sorting numero tabellone
      numeroTabelloneMassimo = numeroTabelloneMassimo.sort((a, b) => b - a);
      //metto il numero di partecipanti corretti al numero di tabellone
      classificaGironi = aggiustaPartecipanti(
        classificaGironi,
        numeroTabelloneMassimo[0] - classificaGironi.length
      );
      const primoAccoppiamenti = generaAccoppiamento(classificaGironi);
      //prima eliminazione diretta inserita
      tabelloni.push({
        tipologia: numeroTabelloneMassimo[0],
        assegnamenti: primoAccoppiamenti,
      });
      //genero gli altri tabelloni
      {
        //prendo le singole fasi ad eliminazioni
        for (let i = 1; i < eliminazioni.length; i++) {
          const partecipanti = eliminazioni[i].partecipanti;
          //prendo tutti i partecipanti che hanno assegnato primo o secondo undefined e li metto già nella fase successiva
          const partecipantiSuccessivi = [];
          for (let j = 0; j < tabelloni[i - 1].assegnamenti.length; j++) {
            if (
              tabelloni[i - 1].assegnamenti[j].primo.nome == null &&
              tabelloni[i - 1].assegnamenti[j].primo.cognome == null
            ) {
              const value = tabelloni[i - 1].assegnamenti.splice(j, 1)[0];
              partecipantiSuccessivi.push(value.secondo);
            } else if (
              tabelloni[i - 1].assegnamenti[j].secondo.nome == null &&
              tabelloni[i - 1].assegnamenti[j].secondo.cognome == null
            ) {
              const value = tabelloni[i - 1].assegnamenti.splice(j, 1)[0];
              partecipantiSuccessivi.push(value.primo);
            }
          }

          //tolti gli undefined trovo i partecipanti in ordine
          for (let j = 0; j < tabelloni[i - 1].assegnamenti.length; j++) {
            //primo - secondo dell'ennesimo assegnamento di una fase ad eliminazione diretta
            const primo = tabelloni[i - 1].assegnamenti[j].primo;
            const secondo = tabelloni[i - 1].assegnamenti[j].secondo;
            partecipanti.forEach((partecipante) => {
              if (
                partecipante.nome === primo.nome &&
                partecipante.cognome === primo.cognome &&
                partecipante.societa === primo.societa
              ) {
                partecipantiSuccessivi.push(primo);
              } else if (
                partecipante.nome === secondo.nome &&
                partecipante.cognome === secondo.cognome &&
                partecipante.societa === secondo.societa
              ) {
                partecipantiSuccessivi.push(secondo);
              }
            });
          }
          //inserisco il nuovo tabellone
          tabelloni.push({
            tipologia: numeroTabelloneMassimo[i],
            assegnamenti: generaAccoppiamento(
              aggiustaPartecipanti(partecipantiSuccessivi)
            ),
          });
        }
      }
      resolve(tabelloni);
    });
  });
};
*/
const prova = (idParam, dataParam, classificaGironi) => {
  const tabs = [
    [0, 3, 1, 2],
    [0, 7, 3, 4, 2, 5, 1, 6],
    [0, 15, 7, 8, 4, 11, 3, 12, 2, 13, 5, 10, 6, 9, 1, 14],
  ];
  let checkTab = false;
  let countEsp = 1;
  while (!checkTab) {
    if (classificaGironi.length < Math.pow(2, countEsp)) {
      checkTab = true;
    } else {
      countEsp++;
    }
  }
  const tabScelta = [];
  tabs.forEach((tabellaBella) => {
    if (tabellaBella.length == Math.pow(2, countEsp)) {
      tabellaBella.forEach((element) => {
        tabScelta.push(element);
      });
      for (let index = 0; index < tabScelta.length; index++) {
        tabScelta.splice(index, 1, classificaGironi[tabScelta[index]]);
      }
    }
  });
  recuperaEliminazioneDiretta(idParam, dataParam).then((response) => {
    const eliminazioni = riordinaEliminazione(response);
    console.log(eliminazioni);
  });
};

const creaTabelloneCorrente = (primaColonna, tabelloniDB) => {}

/**
 * Funzione per generare l'accoppiamento tra gli atleti di una determinata fase * DA SISTEMARE
 * @param {*} array
 * @returns
 */
/*
const generaAccoppiamento = (array) => {
  const arrayFinale = [];
  let toltoTemp = undefined;
  if (array.length % 2 !== 0)
    toltoTemp = {
      primo: array.splice(array.length / 2, 1)[0],
      secondo: { posizione: "", cognome: "", nome: "" },
    };
  const arrayUno = array.slice(0, array.length / 2);
  const arrayDue = array.slice(array.length / 2, array.length);
  let contaSopra = 0;
  for (let i = 0; i < arrayUno.length; i++) {
    if (i % 2 === 0) {
      arrayFinale[contaSopra] = {
        primo: arrayUno[i],
        secondo: arrayDue[arrayDue.length - 1 - i],
      };
      contaSopra++;
    } else {
      arrayFinale[arrayUno.length - contaSopra] = {
        primo: arrayUno[i],
        secondo: arrayDue[arrayDue.length - i - 1],
      };
    }
  }
  if (toltoTemp !== undefined)
    arrayFinale.splice(arrayFinale.length / 2, 0, toltoTemp);

  // Se ci sono atleti non associati, aggiungili automaticamente alla fase successiva
  for (let i = 0; i < arrayFinale.length; i++) {
    if (arrayFinale[i].primo.nome === "") {
      arrayFinale[i].primo.nome = "Atleta non associato";
      arrayFinale[i].primo.societa = "Non associato";
    }
    if (arrayFinale[i].secondo.nome === "") {
      arrayFinale[i].secondo.nome = "Atleta non associato";
      arrayFinale[i].secondo.societa = "Non associato";
    }
  }

  return arrayFinale;
};
*/

/**
 * Funzione per la visualizzazione in finestra dell'eliminazione diretta
 * @param {*} nomeTorneo
 * @param {*} data
 */
export const renderEliminazioneDiretta = (nomeTorneo, data) => {
  recuperaClassificaGironi(nomeTorneo, data).then((classificaGironi) => {
    //recupero solo quelli qualificati
    classificaGironi = classificaGironi.filter(
      (element) => element.stato === "Qualificato"
    );
    //recupero le eliminazioni dirette
    prova(nomeTorneo, data, classificaGironi);
  });
};
//------------------------- FINE ELIMINAZIONE DIRETTA  ----------------------------------------
