const fs = require("fs");
const mysql = require("mysql2/promise");
const recuperaAtleti = require("./recuperaAtleti");
const shortid = require('shortid');
const generatePassword = () => shortid.generate();
const email = require("./sendmail.js");

const registraPartecipante = async (
    nome,
    cognome,
    club,
    ranking,
    codiceFis,
    mail,
    nomeTorneo,
    dataTorneo
) => {
    try {
        const conf = JSON.parse(fs.readFileSync("conf.json"));
        const emailConf = JSON.parse(fs.readFileSync("email.json"));
        const connection = await mysql.createConnection({
            "host": conf.host,
            "user": conf.user,
            "password": conf.password,
            "database": conf.database
        }
        );

        const [atletirows, atletifields] = await connection.execute(
            "SELECT * FROM atleta WHERE codiceFis=?",
            [codiceFis]
        );
        if (atletirows.length === 0) {

            //se l'alteta non è stato trovato allora lo registro
            await connection.execute(
                "INSERT INTO atleta (nome, cognome, societa, ranking, codiceFis, emailUtente) VALUES (?, ?, ?, ?, ?,?)",
                [nome, cognome, club, ranking, codiceFis, mail]
            );
            if (mail && mail != "" && mail.includes("@")) {
                //verifico se la mail è già presente
                const sqlemail = "SELECT * FROM  utenteRegistrato WHERE email = ? ";
                const [res] = await connection.execute(
                    sqlemail,
                    [mail]
                );
                if (res.length > 0) {
                    return { result: "Email già registrata con un altro account" };
                } else {
                    const password = generatePassword();
                    email.send(
                        mail,
                        emailConf.fromMail,
                        emailConf.subject,
                        emailConf.body.replace("%PASSWORD", password));
                    //registro l'atleta con la password e la mando via mail
                    const inserisciUtenteRegistrato = "INSERT INTO utenteRegistrato(email, password) VALUES(?,?)";
                    await connection.execute(
                        inserisciUtenteRegistrato,
                        [mail, password]
                    );
                }
            }

        } else {
            const emailTemp = atletirows[0].emailUtente;
            if (emailTemp != '' && emailTemp) {
                ;
            } else {
                if (mail && mail != "" && mail.includes("@") ) {
                    //verifico se la mail è già presente
                    const sqlemail = "SELECT * FROM  utenteRegistrato WHERE email = ? ";
                    const [res] = await connection.execute(
                        sqlemail,
                        [mail]
                    );
                    if (res.length > 0) {
                        return { result: "Email già registrata con un altro account" };
                    } else {
                        //update email all'atleta in questione
                        const password = generatePassword();
                        email.send(
                            mail,
                            emailConf.fromMail,
                            emailConf.subject,
                            emailConf.body.replace("%PASSWORD", password));
                        //registro l'atleta con la password e la mando via mail
                        const inserisciUtenteRegistrato = "INSERT INTO utenteRegistrato(email, password) VALUES(?,?)";
                        await connection.execute(
                            inserisciUtenteRegistrato,
                            [mail, password]
                        );
                        const emailUpdate = "UPDATE atleta SET emailUtente = ? WHERE codiceFis = ?";

                        await connection.execute(
                            emailUpdate,
                            [mail, atletirows[0].codiceFis]
                        );
                    }

                }
            }
        }

        const atleti = await recuperaAtleti(nomeTorneo, dataTorneo);
        const atleta = atleti.find(atle => atle.codiceFis == codiceFis);

        if (atleta) {
            await connection.end();
            return { result: "Partecipante già registrato nel torneo" };
        } else {
            const [idFaseRows, idFaseFields] = await connection.execute(
                "SELECT id FROM fase WHERE tipologia='Iniziale' AND nomeTorneo=? AND dataTorneo=?",
                [nomeTorneo, dataTorneo]
            );

            if (idFaseRows.length > 0) {
                const idFaseIniziale = idFaseRows[0].id;

                const [idAssaltoRows, idAssaltoFields] = await connection.execute(
                    "SELECT id FROM assalto WHERE idFase=?",
                    [idFaseIniziale]
                );

                if (idAssaltoRows.length > 0) {
                    const sqlAddIniziale = "INSERT INTO partecipare(codiceFisAtleta, nomeTorneo, dataTorneo, idAssalto, idFase, punteggio) VALUES(?,?,?,?,?,?)";
                    const sqlAddGirone = "INSERT INTO partecipare(codiceFisAtleta, nomeTorneo, dataTorneo, idAssalto, idFase, punteggio) VALUES(?,?,?,?,?,?)";
                    await connection.execute(
                        sqlAddGirone,
                        [codiceFis, nomeTorneo, dataTorneo, idAssaltoRows[0].id, (parseInt(idFaseRows[0].id) + 1), -1]
                    );
                    await connection.execute(
                        sqlAddIniziale,
                        [codiceFis, nomeTorneo, dataTorneo, idAssaltoRows[0].id, idFaseRows[0].id, -1]
                    );

                    await connection.end();
                    return { result: "Partecipante registrato con successo" };
                } else {
                    await connection.end();
                    return { error: "Nessun assalto trovato per la fase iniziale" };
                }
            } else {
                await connection.end();
                return { error: "Nessuna fase iniziale trovata per il torneo" };
            }
        }
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};

module.exports = registraPartecipante;
