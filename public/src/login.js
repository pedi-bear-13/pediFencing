const email = document.getElementById("email");
const password = document.getElementById("password");
const idErrati = document.getElementById("idErrati");

const login = (user, pass) => {
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
      if (data.result === "admin") {
        sessionStorage.setItem("username", user);
        sessionStorage.setItem("password", pass);
        window.location.href = "/admin/index.html";
      } else {
        idErrati.classList.remove("d-none");
        email.classList.add("border-danger");
        password.classList.add("border-danger");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

document.getElementById("invio").onclick = () => {
  idErrati.classList.add("d-none");
  login(email.value, password.value);
  email.value = "";
  password.value = "";
};
