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

/**
 * Funzione per recuperare i dati per comporre la tabella dell'eliminazione diretta
 */
export const recuperaEliminazioneDiretta = async (nometorneo, data) => {
  return await fetch("/scherma/eliminazioneDiretta", {
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
    .then((response) => response.response)
    .catch((error) => error);
};

/**
 * Funzione di fetching per recuperare i gironi salvati su database mysql usando il servizio nodejs apposito
 * @returns promise
 */
export const recuperaGironi = async (nometorneo, data) => {
  return await fetch("/scherma/gironi", {
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
    .then((response) => response.response)
    .catch((error) => error);
};

/**
 * Funzione di fetching per iscrivere un utente a un torneo su database mysql usando il servizio nodejs apposito
 * @returns promise
 */
export const iscriviUtenteReg = async (nometorneo, data, user, pass) => {
  return await fetch("/scherma/iscriviUtenteReg", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      username: user,
      password: pass,
    },
    body: JSON.stringify({
      nomeTorneo: nometorneo,
      data: data,
    }),
  })
    .then((response) => response.json())
    .then((response) => response.response)
    .catch((error) => error);
};

/**
 * Funzione di fetching per recuperare i gironi salvati su database mysql usando il servizio nodejs apposito
 * @returns promise
 */
export const recuperaStorico = async (user) => {
  return await fetch("/scherma/recuperaStorico", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      user: user,
    }),
  })
    .then((response) => response.json())
    .then((response) => response.response)
    .catch((error) => error);
};

/**
 * Funzione di fetching per recuperare i gironi salvati su database mysql usando il servizio nodejs apposito
 * @returns promise
 */
export const recuperaAssaltiGirone = async (nometorneo, data) => {
  return await fetch("/scherma/recuperaAssaltiGirone", {
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
    .then((response) => response.response)
    .catch((error) => error);
};

export const aggiornaAssalto = async (obj) => {
  let rsp = await fetch("/scherma/aggiornaAssalti", {
    method: "post",
    headers: {
      "content-type": "application/json",
      username: sessionStorage.getItem("username"),
      password: sessionStorage.getItem("password"),
    },
    body: JSON.stringify(obj),
  });
  rsp = await rsp.json();
  console.log(rsp);
  return rsp;
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
      console.log(data);
      if (data.result == "Unauthorized") {
        window.location.href = "../login.html";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
