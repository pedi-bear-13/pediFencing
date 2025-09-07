const fs = require("fs");
const mysql = require("mysql2/promise");

const iscriviUtenteReg = async (nomeTorneo, data, user) => {
  console.log("Iscrivo l'utente al torneo");
  try {
    const conf = JSON.parse(fs.readFileSync("conf.json"));
    const connection = await mysql.createConnection({
      "host": conf.host,
      "user": conf.user,
      "password": conf.password,
      "database": conf.database
  }
  );
    const codiceFisQuery =
      "SELECT codiceFis FROM atleta WHERE emailUtente='" + user + "' ";
    //recupero il codiceFis dell'atleta che si sta registrando
    const [atleti, atletiFields] = await connection.execute(codiceFisQuery);

    let idPrimoAssalto =
      "SELECT assalto.id, fase.id AS fase FROM fase INNER JOIN assalto ON fase.id = assalto.idFase WHERE nomeTorneo='" +
      nomeTorneo +
      "' AND dataTorneo='" +
      data +
      "'";
    const [assalto, fieldss] = await connection.execute(idPrimoAssalto);
    idPrimoAssalto = assalto[0].id;
    if (atleti.length > 0) {
      const atleta = atleti[0].codiceFis;
      const verificaSql =
        "SELECT * FROM partecipare WHERE codiceFisAtleta=" +
        atleta +
        " AND nomeTorneo = '" +
        nomeTorneo +
        "' AND dataTorneo='" +
        data +
        "'";
      const [rows, fields] = await connection.execute(verificaSql);
      if (rows > 0) {
        await connection.end();
        return { response: "Utente già registrato" };
      } else {
        console.log("Procedo a registrare l'utente");
        const sqlAddIniziale =
          "INSERT INTO partecipare(codiceFisAtleta, nomeTorneo, dataTorneo, idAssalto, idFase, punteggio) VALUES (" +
          "'" +
          atleta +
          "', '" +
          nomeTorneo +
          "', '" +
          data +
          "', " +
          idPrimoAssalto +
          ", " +
          assalto[0].fase +
          ", '-1')";
        console.log("Eseguo la query");
        await connection.execute(sqlAddIniziale);
        console.log("Inserito");
      }
    }
    await connection.end();
    return { response: "Utente registrato con successo" };
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

module.exports = iscriviUtenteReg;
