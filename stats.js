function openUsersPage(){
  document.getElementById("usersPage").style.display = "flex";
}

function closeUsersPage(){
  document.getElementById("usersPage").style.display = "none";
}

function openReportsPage() {
  document.getElementById("reportsPage").style.display = "flex";
}

function closeReportsPage() {
  document.getElementById("reportsPage").style.display = "none";
}
function openStatsPage() {
  document.getElementById("statsPage").style.display = "flex";


  // 🔥 Simulation (plus tard Django va remplacer ça)
  document.getElementById("usersCount").innerText = 120;
  document.getElementById("storiesCount").innerText = 45;
  document.getElementById("visitorsCount").innerText = 300;
  document.getElementById("coinsBought").innerText = 80;
  document.getElementById("withdrawCount").innerText = 10;
  document.getElementById("giftsCount").innerText = 60;
}

function closeStatsPage() {
  document.getElementById("statsPage").style.display = "none";
                }

