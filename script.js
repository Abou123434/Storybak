// MENU MOBILE
const burgerBtn = document.getElementById("burgerBtn");
const navLinks = document.getElementById("navLinks");

burgerBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// FORM BOOKING
const bookingForm = document.getElementById("bookingForm");

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const arrival = document.getElementById("arrival").value;
  const departure = document.getElementById("departure").value;
  const adults = document.getElementById("adults").value;
  const roomsCount = document.getElementById("roomsCount").value;

  alert(
    "Réservation demandée ✅\n\n" +
    "Arrivée : " + arrival + "\n" +
    "Départ : " + departure + "\n" +
    "Adultes : " + adults + "\n" +
    "Chambres : " + roomsCount + "\n\n" +
    "Fonction démo : ici on connecterait un système de réservation."
  );
});

// BOUTONS RESERVER CHAMBRES
const bookBtns = document.querySelectorAll(".book-btn");

bookBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const roomName = btn.getAttribute("data-room");
    alert("Vous avez choisi : " + roomName + "\n\nCliquez sur 'Voir les disponibilités' pour réserver.");
  });
});

// FAQ ACCORDION
const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(question => {
  question.addEventListener("click", () => {
    const answer = question.nextElementSibling;

    if (answer.style.maxHeight) {
      answer.style.maxHeight = null;
    } else {
      document.querySelectorAll(".faq-answer").forEach(a => a.style.maxHeight = null);
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

// REVIEWS DYNAMIQUES
const reviewsData = [
  { name: "VIGREUX R.", rating: 5, text: "Très bien accueilli, confort excellent, personnel au top." },
  { name: "ESTHER G.", rating: 4, text: "Très bon hôtel, propre, pratique et accessible." },
  { name: "ALIX F.", rating: 4.5, text: "Excellent séjour, rapport qualité/prix parfait." },
  { name: "MÉLANIE A.", rating: 5, text: "Tout était parfait, calme, propre et agréable." },
  { name: "MARTIN F.", rating: 1, text: "Expérience moyenne, mais bon emplacement." },
  { name: "SANDRA L.", rating: 4, text: "Petit déjeuner complet, chambre confortable." },
  { name: "DAVID P.", rating: 5, text: "Parfait pour un séjour proche d'Orly." },
  { name: "KARIM A.", rating: 4.5, text: "Très bon service, parking sécurisé, je recommande." },
  { name: "JULIE M.", rating: 4, text: "Hôtel moderne, propre, très pratique pour voyager." }
];

let reviewIndex = 0;
const reviewsGrid = document.getElementById("reviewsGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");

function renderReviews(count = 3) {
  for (let i = 0; i < count; i++) {
    if (reviewIndex >= reviewsData.length) {
      loadMoreBtn.style.display = "none";
      return;
    }

    const review = reviewsData[reviewIndex];
    const card = document.createElement("div");
    card.classList.add("review-card");

    card.innerHTML = `
      <h4>${review.name}</h4>
      <div class="stars">⭐ ${review.rating} / 5</div>
      <p>${review.text}</p>
    `;

    reviewsGrid.appendChild(card);
    reviewIndex++;
  }
}

renderReviews(3);

loadMoreBtn.addEventListener("click", () => {
  renderReviews(3);
});

// BOUTON RETOUR EN HAUT
const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
});

topBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
