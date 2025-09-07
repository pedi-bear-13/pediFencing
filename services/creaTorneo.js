const fs = require("fs");
const mysql = require("mysql2/promise");

const creaTorneo = async (data, nome, provincia, luogo, pel, ngir) => {
    try {
        const conf = JSON.parse(fs.readFileSync("conf.json"));
        const connection = await mysql.createConnection({
            "host": conf.host,
            "user": conf.user,
            "password": conf.password,
            "database": conf.database
        }
        );
        const sqlVerifica = "SELECT * FROM torneo WHERE nome = ? AND data = ? AND provincia = ? AND luogo = ?";
        const [rows, fields] = await connection.execute(sqlVerifica,[nome, data, provincia, luogo]);
        if(rows && rows.length > 0){
            return {result: "Torneo già registrato"};
        }

        const sql = `
            INSERT INTO torneo(data,nome,provincia,luogo,percentualeEliminazione,svolto,nGironi) VALUES(?,?,?,?,?,0,?)
        `;
        await connection.execute(sql,[data, nome, provincia, luogo, pel, ngir]);
        const insertFaseIniziale = "INSERT INTO fase(tipologia, nomeTorneo, dataTorneo, luogo, data, svolta) VALUES(?,?,?,?,?,?)"
        await connection.execute(insertFaseIniziale,['Iniziale', nome, data, luogo, data, 0]);
        const recuperaIdFaseIniziale = "SELECT id FROM fase WHERE nomeTorneo='"+nome+"' AND dataTorneo='"+data+"'";
        const [res, inutile] = await connection.execute(recuperaIdFaseIniziale);
        const creaAssaltoFittizzio = "INSERT INTO assalto(idFase) VALUES(?)";
        await connection.execute(creaAssaltoFittizzio,[parseInt(res[0].id)]);
        await connection.end();
        return {result: "Torneo creato con successo"};
    } catch (error) {
        return {result: "Non è stato possibile creare il torneo"};
    }
}

module.exports = creaTorneo;