const fs = require("fs");
const mysql = require("mysql2/promise");

const aggiornaAssalti = async (assaltino) => {
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    const connection = await mysql.createConnection({
      "host": conf.host,
      "user": conf.user,
      "password": conf.password,
      "database": conf.database
  }
  );
    const sql =
      "SELECT fase.id AS idFase FROM fase WHERE tipologia='Girone'AND nomeTorneo='" +
      assaltino.torneo +
      "' AND dataTorneo='" +
      assaltino.data +
      "'";
    const [rows, fields] = await connection.execute(sql);
    if (rows.length > 0) {
      const idFase = rows[0].idFase;
      const sql2 =
        "SELECT * FROM partecipare WHERE (nomeTorneo='" +
        assaltino.torneo +
        "' AND dataTorneo='" +
        assaltino.data +
        "' AND idFase='" +
        idFase +
        "' AND codiceFisAtleta='" +
        assaltino.fisUno +
        "' AND punteggio='" +
        assaltino.atleta1 +
        "') OR (nomeTorneo='" +
        assaltino.torneo +
        "' AND dataTorneo='" +
        assaltino.data +
        "' AND idFase='" +
        idFase +
        "' AND codiceFisAtleta='" +
        assaltino.fisDue +
        "' AND punteggio='" +
        assaltino.atleta2 +
        "')";
      const [rows2, fields2] = await connection.execute(sql2);
      let pulizia = [];
      rows2.forEach((sas) => {
        let check = false;
        rows2.forEach((dos) => {
          if (
            dos.idAssalto == sas.idAssalto &&
            sas.codiceFisAtleta !== dos.codiceFisAtleta
          ) {
            check = true;
          }
        });
        if (check) {
          pulizia.push(sas);
        }
      });
      if (pulizia.length === 0) {
        const sql3 =
          "SELECT * FROM partecipare WHERE (nomeTorneo='" +
          assaltino.torneo +
          "' AND dataTorneo='" +
          assaltino.data +
          "' AND idFase='" +
          idFase +
          "' AND codiceFisAtleta='" +
          assaltino.fisUno +
          "') OR (nomeTorneo='" +
          assaltino.torneo +
          "' AND dataTorneo='" +
          assaltino.data +
          "' AND idFase='" +
          idFase +
          "' AND codiceFisAtleta='" +
          assaltino.fisDue +
          "')";
        const [rows3, fields3] = await connection.execute(sql3);
        if (rows3.length > 0) {
          let accoppia = [];
          rows3.forEach((a) => {
            let check = false;
            rows3.forEach((b) => {
              if (
                b.idAssalto == a.idAssalto &&
                a.codiceFisAtleta !== b.codiceFisAtleta
              ) {
                check = true;
              }
            });
            if (check) {
              accoppia.push(a);
            }
          });
          if (accoppia.length === 0) {
            const sql6 =
              "INSERT INTO `assalto`(`idFase`) VALUES ('" + idFase + "')";
            const [rows6, fields6] = await connection.execute(sql6);
              const sql7 = "SELECT MAX(id) AS ultimo_assalto FROM assalto";
              const [rows7, fields7] = await connection.execute(sql7);
              if (rows7.length > 0) {
                const lastAssalt = rows7[0].ultimo_assalto;
                const sql8 =
                  "INSERT INTO `partecipare`(`codiceFisAtleta`, `nomeTorneo`, `dataTorneo`, `idAssalto`, `idFase`, `punteggio`) VALUES ('" +
                  assaltino.fisUno +
                  "','" +
                  assaltino.torneo +
                  "','" +
                  assaltino.data +
                  "','" +
                  lastAssalt +
                  "','" +
                  idFase +
                  "','" +
                  assaltino.atleta1 +
                  "'), ('" +
                  assaltino.fisDue +
                  "','" +
                  assaltino.torneo +
                  "','" +
                  assaltino.data +
                  "','" +
                  lastAssalt +
                  "','" +
                  idFase +
                  "','" +
                  assaltino.atleta2 +
                  "')";
                const [rows8, fields8] = await connection.execute(sql8);
              } else {
                await connection.end();
              }
          } else {
            accoppia.forEach(async(pleb) => {
              if (assaltino.fisUno == pleb.codiceFisAtleta) {
                const sql4 =
                  "UPDATE `partecipare` SET `punteggio`='" +
                  assaltino.atleta1 +
                  "' WHERE `codiceFisAtleta`='" +
                  pleb.codiceFisAtleta +
                  "' AND `nomeTorneo`='" +
                  pleb.nomeTorneo +
                  "' AND `dataTorneo`='" +
                  pleb.dataTorneo +
                  "' AND `idAssalto`='" +
                  pleb.idAssalto +
                  "' AND `idFase`='" +
                  idFase +
                  "'";
                const [rows4, fields4] = await connection.execute(sql4);
              } else if (assaltino.fisDue == pleb.codiceFisAtleta) {
                const sql5 =
                  "UPDATE `partecipare` SET `punteggio`='" +
                  assaltino.atleta2 +
                  "' WHERE `codiceFisAtleta`='" +
                  pleb.codiceFisAtleta +
                  "' AND `nomeTorneo`='" +
                  pleb.nomeTorneo +
                  "' AND `dataTorneo`='" +
                  pleb.dataTorneo +
                  "' AND `idAssalto`='" +
                  pleb.idAssalto +
                  "' AND `idFase`='" +
                  idFase +
                  "'";
                const [rows5, fields5] = await  connection.execute(sql5);
              }
            });
          }
        } else {
          await connection.end();
        }
      } else {
      }
    } else {
      await connection.end();
    }
    return {result: "ok"};
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = aggiornaAssalti;
