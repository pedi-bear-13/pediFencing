//Import moduli
import { renderTornei } from "./render.js";
import { loginControllo } from "./cache.js";
const logout = document.getElementById("logout");
logout.onclick = () => {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("password");
  window.location.href = "../login.html";
};
/**
 * Al caricamento della pagina viene fatto il render dei tornei
 */
window.onload = () => {
  loginControllo(
    sessionStorage.getItem("username"),
    sessionStorage.getItem("password")
  );
  renderTornei();
};
