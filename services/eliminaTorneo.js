
const fs = require("fs");
const mysql = require("mysql2/promise");
/**
 * Modulo contenente la funzione per eliminare un torneo con determinate caratteristiche
 * @param {*} nomeTorneo 
 * @param {*} data 
 * @returns 
 */
const eliminaTorneo = async (nomeTorneo, data) => {
    //console.log("marameo")
    try {
        const sql = "DELETE FROM torneo WHERE nome = '"+nomeTorneo+"' AND data = '"+data+"';";
        const conf = JSON.parse(fs.readFileSync("conf.json"));
        const connection = await mysql.createConnection({
            "host": conf.host,
            "user": conf.user,
            "password": conf.password,
            "database": conf.database
        }
        );
        const [rows, fields] = await connection.execute(sql);
        await connection.end();
        return {result: "ok"};
    } catch (error) {
        //console.log(error);
        return {result: "Error: "+error};
    }
}

module.exports = eliminaTorneo;
