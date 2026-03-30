// ===== PAGE KYC =====
function openKYCPage(){
  document.getElementById("kycPage").style.display = "block";
}

function closeKYCPage(){
  document.getElementById("kycPage").style.display = "none";
}

function acceptKYC(){
  document.getElementById("kycStatus").innerText = "✅ KYC accepté";
}

function refuseKYC(){
  document.getElementById("kycStatus").innerText = "❌ KYC refusé";
}