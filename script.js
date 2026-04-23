const data = {
  it:{
    heroTitle:"Benvenuti",
    heroText:"Esperienza culinaria unica",
    reserve:"Prenota su WhatsApp",
    menuTitle:"Menu",
    dish1:"Carne premium cotta alla brace",
    dish2:"Pasta fatta in casa",
    storyTitle:"La Nostra Storia",
    storyText:"Dal 1998 tradizione familiare",
    contactTitle:"Contatti",
    address:"Via Catilina, Ardea",
    phone:"+39 391 340 4676"
  },
  fr:{
    heroTitle:"Bienvenue",
    heroText:"Expérience culinaire unique",
    reserve:"Réserver WhatsApp",
    menuTitle:"Menu",
    dish1:"Viande grillée premium",
    dish2:"Pâtes maison",
    storyTitle:"Notre histoire",
    storyText:"Depuis 1998 tradition familiale",
    contactTitle:"Contact",
    address:"Via Catilina, Ardea",
    phone:"+39 391 340 4676"
  },
  en:{
    heroTitle:"Welcome",
    heroText:"Unique dining experience",
    reserve:"Book on WhatsApp",
    menuTitle:"Menu",
    dish1:"Premium grilled meat",
    dish2:"Homemade pasta",
    storyTitle:"Our Story",
    storyText:"Family tradition since 1998",
    contactTitle:"Contact",
    address:"Via Catilina, Ardea",
    phone:"+39 391 340 4676"
  },
  de:{
    heroTitle:"Willkommen",
    heroText:"Einzigartiges kulinarisches Erlebnis",
    reserve:"WhatsApp Reservierung",
    menuTitle:"Speisekarte",
    dish1:"Premium Grillfleisch",
    dish2:"Hausgemachte Pasta",
    storyTitle:"Unsere Geschichte",
    storyText:"Seit 1998 Familientradition",
    contactTitle:"Kontakt",
    address:"Via Catilina, Ardea",
    phone":"+39 391 340 4676"
  }
};

function setLang(l){
  document.getElementById('heroTitle').innerText=data[l].heroTitle;
  document.getElementById('heroText').innerText=data[l].heroText;
  document.getElementById('reserveBtn').innerText=data[l].reserve;
  document.getElementById('reserveBtn').href="https://wa.me/393913404676";
  document.getElementById('menuTitle').innerText=data[l].menuTitle;
  document.getElementById('dish1').innerText=data[l].dish1;
  document.getElementById('dish2').innerText=data[l].dish2;
  document.getElementById('storyTitle').innerText=data[l].storyTitle;
  document.getElementById('storyText').innerText=data[l].storyText;
  document.getElementById('contactTitle').innerText=data[l].contactTitle;
  document.getElementById('address').innerText=data[l].address;
  document.getElementById('phone').innerText=data[l].phone;
}

setLang('it');
