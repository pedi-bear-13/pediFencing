/**
 * Funzione di fetching per recuperare i tornei salvati su database mysql usando il servizio nodejs apposito
 * @returns promise
 */
export const recuperaTornei = async () => {
  return await fetch("/scherma/tornei")
    .then((response) => response.json())
    .then((response) => response.response)
    .catch((error) => error);
};

/**
 * Funzione di fetching per recuperare gli atleti salvati su database mysql usando il servizio nodejs apposito
 * @returns promise
 */
export const recuperaAtleta = (nometorneo, data) => {
  return new Promise((resolve, reject) => {
    fetch("/scherma/atleti", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        nomeTorneo: nometorneo,
        data: data,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        resolve(response.response);
      })
      .catch((error) => reject(error));
  });
};

export const creaTorneo = (dizionario) => {
  return new Promise((resolve, reject) => {
    fetch("/scherma/creaTorneo", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        username: sessionStorage.getItem("username"),
        password: sessionStorage.getItem("password"),
      },
      body: JSON.stringify(dizionario),
    })
      .then((response) => response.json())
      .then((response) => {
        resolve(response.result);
      })
      .catch((error) => reject(error));
  });
};

export const eliminaTorneo = (dizionario) => {
  return new Promise((resolve, reject) => {
    fetch("/scherma/eliminaTorneo", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        username: sessionStorage.getItem("username"),
        password: sessionStorage.getItem("password"),
      },
      body: JSON.stringify(dizionario),
    })
      .then((response) => response.json())
      .then((response) => resolve(response.result))
      .catch((error) => reject(error));
  });
};

export const modificaTorneo = (dizionario) => {
  return new Promise((resolve, reject) => {
    fetch("/scherma/modificaTorneo", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        username: sessionStorage.getItem("username"),
        password: sessionStorage.getItem("password"),
      },
      body: JSON.stringify(dizionario),
    })
      .then((response) => response.json())
      .then((response) => {
        resolve(response.result);
      })
      .catch((error) => reject(error));
  });
};

export const recuperaFasi = (dizionario) => {
  return new Promise((resolve, reject) => {
    fetch("/scherma/selectFasi", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(dizionario),
    })
      .then((response) => response.json())
      .then((response) => resolve(response.response))
      .catch((error) => reject(error));
  });
};

export const statoTorneo = (dizionario) => {
  return new Promise((resolve, reject) => {
    fetch("/scherma/statoTorneo", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(dizionario),
    })
      .then((response) => response.json())
      .then((response) => resolve(response.response))
      .catch((error) => reject(error));
  });
};

export const chiudiTorneo = (dizionario) => {
  return new Promise((resolve, reject) => {
    fetch("/scherma/chiudiTorneo", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        username: sessionStorage.getItem("username"),
        password: sessionStorage.getItem("password"),
      },
      body: JSON.stringify(dizionario),
    })
      .then((response) => response.json())
      .then((response) => resolve(response.response))
      .catch((error) => reject(error));
  });
};

export const registraPartecipante = (dizionario) => {
  return new Promise((resolve, reject) => {
    fetch("/scherma/registraPartecipante", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        username: sessionStorage.getItem("username"),
        password: sessionStorage.getItem("password"),
      },
      body: JSON.stringify(dizionario),
    })
      .then((response) => response.json())
      .then((response) => resolve(response))
      .catch((error) => reject(error));
  });
};

export const passaFase = (dizionario) => {
  return new Promise((resolve, reject) => {
    fetch("/scherma/passaFase", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        username: sessionStorage.getItem("username"),
        password: sessionStorage.getItem("password"),
      },
      body: JSON.stringify(dizionario),
    })
      .then((response) => response.json())
      .then((response) => resolve(response))
      .catch((error) => reject(error));
  });
};

export const loginControllo = (user, pass) => {
  fetch("/scherma/accessLogin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      username: user,
      password: pass,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.result == "Unauthorized") {
        window.location.href = "../index.html";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

/**
 * Servizio per aggiornare un assalto (inserisce o modifica punteggi).
 * @param {*} obj Deve contenere: { idTorneo, fisUno, atleta1, fisDue, atleta2 }
 */
export const aggiornaAssalti = async (obj) => {
  let rsp = await fetch("/scherma/aggiornaAssalti", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      username: sessionStorage.getItem("username"),
      password: sessionStorage.getItem("password"),
    },
    body: JSON.stringify(obj),
  });

  rsp = await rsp.json();
  console.log("Risposta aggiornaAssalto:", rsp);
  return rsp;
};

/**
 * Funzione di fetching per recuperare gli assalti dei gironi di un torneo
 * @param {number} idTorneo
 * @returns {Promise<Array>} elenco assalti
 */
export const recuperaAssaltiGirone = async (idTorneo) => {
  return await fetch("/scherma/recuperaAssaltiGirone", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ idTorneo }),
  })
    .then((response) => response.json())
    .then((response) => response.response)
    .catch((error) => {
      console.error("Errore recuperaAssaltiGirone:", error);
      return [];
    });
};
