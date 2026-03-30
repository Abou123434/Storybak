document.addEventListener("DOMContentLoaded", () => {

  const overlay = document.getElementById("authOverlay");
  const mainPage = document.getElementById("mainPage");

  const googleBtn = document.getElementById("googleLogin");
  const loginBtn = document.getElementById("loginBtn");

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // ===== AUTO LOGIN (reste connecté) =====
  const user = localStorage.getItem("user");

  if (user) {
    showMainPage();
  }

  // ===== GOOGLE LOGIN (simulation) =====
  googleBtn.addEventListener("click", () => {

    const fakeUser = {
      type: "google",
      name: "Utilisateur Google",
      email: "google@gmail.com"
    };

    localStorage.setItem("user", JSON.stringify(fakeUser));

    showMainPage();
  });

  // ===== LOGIN EMAIL =====
  loginBtn.addEventListener("click", () => {

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {
      alert("Remplis tous les champs");
      return;
    }

    const userData = {
      type: "email",
      email: email,
      password: password
    };

    localStorage.setItem("user", JSON.stringify(userData));

    showMainPage();
  });
  
    // ===== AFFICHER PAGE PRINCIPALE =====
  function showMainPage() {
    overlay.style.display = "none";
    mainPage.style.display = "block";
    document.body.style.overflow = "auto";
  }

});

// ===== LOGOUT =====
function logout() {
  localStorage.removeItem("user");
  location.reload();
}
document.addEventListener("DOMContentLoaded", () => {

  // ===== ELEMENTS =====
  const overlay = document.getElementById("authOverlay");
  const googleBtn = document.getElementById("googleLogin");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // ===== FONCTIONS SESSION =====

  function showApp() {
    overlay.style.display = "none";
    document.body.style.overflow = "auto";
  }

  function showLogin() {
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
  
    // ===== VERIFIER SI USER DEJA CONNECTÉ =====
  const user = localStorage.getItem("user");

  if (user) {
    showApp(); // reste connecté
  } else {
    showLogin(); // demande connexion
  }

  // ===== LOGIN GOOGLE (simulation) =====
  googleBtn.addEventListener("click", () => {
    localStorage.setItem("user", "google_user");
    showApp();
  });

  // ===== LOGIN EMAIL =====
  loginBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {
      alert("Remplis tous les champs");
      return;
    }

    localStorage.setItem("user", email);
    showApp();
  });

  // ===== LOGOUT (LA PARTIE IMPORTANTE) =====
  logoutBtn.addEventListener("click", () => {

    const confirmLogout = confirm("Tu veux vraiment te déconnecter ?");

    if (!confirmLogout) return;

    // Supprime la session
    localStorage.removeItem("user");

    // Nettoyage champs login
    emailInput.value = "";
    passwordInput.value = "";

    // Retour écran connexion
    showLogin();

  });

});
