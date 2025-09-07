const fs = require("fs");
const mysql = require("mysql2/promise");

const assalti = async (torneo, data, fisUno, fisDue, puntUno, puntDue, tipologia) => {
    try {
        const conf = JSON.parse(fs.readFileSync("conf.json"));
        const connection = await mysql.createConnection({
            "host": conf.host,
            "user": conf.user,
            "password": conf.password,
            "database": conf.database
        }
        );
        //recupero la tipologia
        const sqlRecuperoIdFase = `
            SELECT idFase 
            FROM fase 
            WHERE nomeTorneo = ? AND dataTorneo = ? AND tipologia = ?;
        `;
        const [idFase, ffase] = await connection.execute(sqlRecuperoIdFase, [torneo, data, tipologia]);
        if (idFase.length > 0 && idFase[0].id) {
            //controllo se è già presente
            const sqlControllo = `
                SELECT * 
                FROM partecipare p1 
                INNER JOIN partecipare p2 
                    ON p1.idAssalto = p2.idAssalto 
                    AND p1.nomeTorneo = p2.nomeTorneo 
                    AND p1.dataTorneo = p2.dataTorneo 
                    AND p1.idFase = p2.idFase
                WHERE (p1.codiceFisAtleta = ? AND p2.codiceFisAtleta = ?)
                OR (p1.codiceFisAtleta = ? AND p2.codiceFisAtleta = ?)
                AND p1.nomeTorneo = ?
                AND p1.dataTorneo = ?
                AND p1.idFase = ?;
            `;
            const [controlli, fControlli] = await connection.execute(sqlControllo, [fisUno, fisDue, fisDue, fisUno, torneo, data, idFase[0].id]);
            if (controlli.length > 0) {
                return { result: "Assegnamento già fatto" };
            } else {
                try {
                    //se non è presente l'assegnamento
                    const sqlInserimento = `
                        START TRANSACTION;
                            INSERT INTO assalto(idFase) VALUES('${idFase[0].id}');
                            INSERT INTO partecipare(codiceFisAtleta, nomeTorneo, dataTorneo, idAssalto, idFase, punteggio)
                            VALUES(${fisUno},'${torneo}','${data}',LAST_INSERT_ID(),'${idFase[0].id}','${puntUno}');
                            INSERT INTO partecipare(codiceFisAtleta, nomeTorneo, dataTorneo, idAssalto, idFase, punteggio)
                            VALUES(${fisDue},'${torneo}','${data}',LAST_INSERT_ID(),'${idFase[0].id}','${puntDue}');
                        COMMIT;
                    `;
                    const [result, fResult] = await connection.execute(sqlInserimento);
                    await connection.end();
                    return { result: "ok" };
                } catch (e) {
                    await connection.end();
                    return { result: "error: " + e };
                }
            }
        } else {
            await connection.end();
            return { result: "Fase non esistente nel DB" };
        }

    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = assalti;