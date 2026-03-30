document.addEventListener("DOMContentLoaded", () => {

  const overlay = document.getElementById("authOverlay");
  const mainPage = document.getElementById("mainPage");

  const googleBtn = document.getElementById("googleLogin");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // ===== FONCTIONS =====
  function showApp() {
    overlay.style.display = "none";
    mainPage.style.display = "block";
    document.body.style.overflow = "auto";
  }

  function showLogin() {
    overlay.style.display = "flex";
    mainPage.style.display = "none";
    document.body.style.overflow = "hidden";
  }

  // ===== AUTO LOGIN =====
  const user = localStorage.getItem("user");
  if (user) showApp();
  else showLogin();

  // ===== LOGIN GOOGLE =====
  googleBtn.addEventListener("click", () => {
    localStorage.setItem("user", "google_user");
    showApp();
  });

  // ===== LOGIN EMAIL =====
  loginBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Remplis tous les champs");
      return;
    }

    localStorage.setItem("user", email);
    showApp();
  });

  // ===== LOGOUT =====
  logoutBtn.addEventListener("click", () => {
    if (!confirm("Tu veux vraiment te déconnecter ?")) return;
    localStorage.removeItem("user");
    emailInput.value = "";
    passwordInput.value = "";
    showLogin();
  });

});
