const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

const fs = require("fs");
const cors = require("cors");
const conf = JSON.parse(fs.readFileSync("conf.json"));
//servizi
const accessLogin = require("./services/accessLogin.js");
const recuperaTornei = require("./services/recuperaTornei");
const recuperaAtleti = require("./services/recuperaAtleti");
const recuperaTuttiAtleti = require("./services/recuperaTuttiAtleti");
const aggiornaAssalti = require("./services/aggiornaAssalti.js");
const creaTorneo = require("./services/creaTorneo.js");
const eliminaTorneo = require("./services/eliminaTorneo.js");
const modificaTorneo = require("./services/modificaTorneo.js");
const registraPartecipante = require("./services/registraPartecipante.js");
const recuperaAssaltiGirone = require("./services/recuperaAssaltiGirone.js");

(() => {
  //gestione cors
  const corsOptions = {
    origin: "*",
    methods: "POST",
    optionsSuccessStatus: 204,
  };
  app.use(cors(corsOptions));

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  //reindirizzamento a cartella public con la form di login
  app.use(express.static(path.join(__dirname, "public")));

  /**
   * Login amministratore
   */
  app.post("/scherma/accessLogin", (req, res) => {
    const username = req.headers.username;
    const password = req.headers.password;
    checkLogin(username, password)
      .then(() => {
        res.json({ result: "admin" });
      })
      .catch(() => {
        res.status(401); //401 è il codice http Unauthorized)
        res.json({ result: "Unauthorized" });
      });
  });

  /**
   * Funzione per recuperare gli atleti di un torneo
   */
  app.post("/scherma/atleti", async (request, response) => {
    const { nomeTorneo, data } = request.body;
    try {
      const result = await recuperaAtleti(nomeTorneo, data);
      response.json({ response: result });
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

  /**
   * Funzione per recuperare gli atleti di un torneo
   */
  app.post("/scherma/recuperaTuttiAtleti", async (request, response) => {
    try {
      const result = await recuperaTuttiAtleti();
      response.json({ response: result });
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

  /**
   * Funzione per recuperare i tornei salvati sul server
   */
  app.get("/scherma/tornei", async (request, response) => {
    try {
      recuperaTornei().then((result) => {
        response.json({ response: result.reverse() });
      });
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });
  /**
   * Funzione per eliminare un torneo
   */
  app.post("/scherma/eliminaTorneo", async (request, response) => {
    const username = request.headers.username;
    const password = request.headers.password;
    await checkLogin(username, password)
      .then(() => {
        const { nome, data } = request.body;
        if (nome && data && nome !== "" && data !== "") {
          try {
            const result = eliminaTorneo(nome, data);
            response.json(result);
          } catch (error) {
            response.status(500).json({ result: error.message });
          }
        } else {
          response.status(400).json({ result: "Dati non validi" });
        }
      })
      .catch(() => {
        res.status(401); //401 è il codice http Unauthorized)
        res.json({ result: "Unauthorized" });
      });
  });

  /**
   * Recupera tutti gli assalti di girone per un torneo
   */
  app.post("/scherma/recuperaAssaltiGirone", async (req, res) => {
    const { idTorneo } = req.body;
    try {
      const result = await recuperaAssaltiGirone(idTorneo);
      res.json({ response: result });
    } catch (error) {
      console.error("Errore recuperaAssaltiGirone:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/scherma/registraPartecipante", async (request, response) => {
    const username = request.headers.username;
    const password = request.headers.password;

    await checkLogin(username, password)
      .then(async () => {
        const { nome, cognome, ranking, codiceFis, nomeTorneo, dataTorneo } =
          request.body;

        // qui serve await!
        const rsp = await registraPartecipante(
          nome,
          cognome,
          ranking,
          codiceFis,
          nomeTorneo,
          dataTorneo
        );

        response.json(rsp);
      })
      .catch(() => {
        response.status(401).json({ result: "Unauthorized" });
      });
  });

  /**
   * Funzione server per controllo login
   */
  const checkLogin = (username, password) => {
    return new Promise((res, rej) => {
      accessLogin().then((result) => {
        let check = false;
        result.forEach((utente) => {
          if (utente.Email == username && utente.Password == password) {
            check = true;
          }
        });
        if (check) {
          res();
        } else {
          rej();
        }
      });
    });
  };

  /**
   * Aggiorna o inserisce un assalto
   */
  app.post("/scherma/aggiornaAssalti", async (req, res) => {
    const username = req.headers.username;
    const password = req.headers.password;

    try {
      await checkLogin(username, password);
      const result = await aggiornaAssalti(req.body); // ← qui aspettiamo
      res.json(result);
    } catch (error) {
      console.error("Errore aggiornaAssalti:", error);
      res.status(401).json({ result: "Unauthorized" });
    }
  });

  /**
   * Servizio per registrare assalti in comune
   */
  app.post("/scherma/assegnaAssalti", async (request, response) => {
    const {
      torneo,
      data,
      fisUno,
      fisDue,
      punteggioUno,
      punteggioDue,
      tipologia,
    } = request.body;
    if (
      torneo &&
      data &&
      fisUno &&
      fisDue &&
      punteggioUno &&
      punteggioDue &&
      tipologia &&
      torneo !== "" &&
      data !== "" &&
      fisUno !== "" &&
      fisDue !== "" &&
      punteggioUno !== "" &&
      punteggioDue !== "" &&
      tipologia !== ""
    ) {
      const res = await assalti(
        torneo,
        data,
        fisUno,
        fisDue,
        punteggioUno,
        punteggioDue,
        tipologia
      );
      response.json(res);
    } else {
      response
        .status(400)
        .json({ result: "Elementi non completi o non validi" });
    }
  });

  /**
   * Servizio per salvare in db il torneo
   */
  app.post("/scherma/creaTorneo", async (request, response) => {
    const username = request.headers.username;
    const password = request.headers.password;
    await checkLogin(username, password)
      .then(() => {
        const { data, nome, pel, ngir } = request.body;
        if (
          data &&
          nome &&
          pel &&
          ngir &&
          data !== "" &&
          nome !== "" &&
          pel !== "" &&
          ngir !== ""
        ) {
          const res = creaTorneo(data, nome, pel, ngir);
          response.json(res);
        } else {
          response
            .status(400)
            .json({ result: "Elementi non completi o non validi" });
        }
      })
      .catch(() => {
        res.status(401); //401 è il codice http Unauthorized)
        res.json({ result: "Unauthorized" });
      });
  });

  /**
   * Servizio per modificare un torneo esistente
   */
  app.post("/scherma/modificaTorneo", async (request, response) => {
    const username = request.headers.username;
    const password = request.headers.password;

    await checkLogin(username, password)
      .then(async () => {
        const { id, data, nome, pel, ngir } = request.body;
        if (
          id &&
          data &&
          nome &&
          pel &&
          ngir &&
          id !== "" &&
          data !== "" &&
          nome !== "" &&
          pel !== "" &&
          ngir !== ""
        ) {
          const res = await modificaTorneo(id, data, nome, pel, ngir);
          response.json(res);
        } else {
          response
            .status(400)
            .json({ result: "Elementi non completi o non validi" });
        }
      })
      .catch(() => {
        response.status(401).json({ result: "Unauthorized" });
      });
  });

  /**
   * Creazione del server ed ascolto sulla porta effimera 3040
   */
  const server = http.createServer(app);
  server.listen(3040, () => {
    console.log("---> server running on port 3040");
  });
})();
