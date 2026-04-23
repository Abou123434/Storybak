const translations = {
  it:{
    menu:"Menu",
    story:"Storia",
    contact:"Contatti",
    hero_title:"Brace, Famiglia & Tradizione",
    hero_text:"Un’esperienza autentica dal 1998",
    menu_title:"Il Menu",
    meat:"Carne alla brace",
    meat_desc:"Selezione esclusiva di carni premium cotte lentamente alla brace con carbone naturale.",
    pasta:"Pasta fatta in casa",
    pasta_desc:"Pasta fresca lavorata a mano ogni giorno con ricette tradizionali italiane.",
    starter:"Antipasti",
    starter_desc:"Antipasti preparati con prodotti locali freschi.",
    story_title:"La Nostra Storia",
    story_text:"Una storia di famiglia iniziata nel 1998.",
    contact_title:"Contatti"
  },

  en:{
    menu:"Menu",
    story:"Story",
    contact:"Contact",
    hero_title:"Fire, Family & Tradition",
    hero_text:"Authentic experience since 1998",
    menu_title:"Menu",
    meat:"Grilled Meat",
    meat_desc:"Premium grilled meat cooked slowly over charcoal.",
    pasta:"Homemade Pasta",
    pasta_desc:"Fresh handmade pasta with traditional recipes.",
    starter:"Starters",
    starter_desc:"Fresh local appetizers.",
    story_title:"Our Story",
    story_text:"A family story since 1998.",
    contact_title:"Contact"
  },

  fr:{
    menu:"Menu",
    story:"Histoire",
    contact:"Contact",
    hero_title:"Feu, Famille & Tradition",
    hero_text:"Expérience authentique depuis 1998",
    menu_title:"Menu",
    meat:"Viande grillée",
    meat_desc:"Viande premium cuite lentement au charbon.",
    pasta:"Pâtes maison",
    pasta_desc:"Pâtes fraîches faites à la main.",
    starter:"Entrées",
    starter_desc:"Entrées fraîches locales.",
    story_title:"Notre histoire",
    story_text:"Une histoire familiale depuis 1998.",
    contact_title:"Contact"
  },

  de:{
    menu:"Menü",
    story:"Geschichte",
    contact:"Kontakt",
    hero_title:"Feuer, Familie & Tradition",
    hero_text:"Seit 1998",
    menu_title:"Menü",
    meat:"Gegrilltes Fleisch",
    meat_desc:"Premium Fleisch langsam gegrillt.",
    pasta:"Hausgemachte Pasta",
    pasta_desc:"Frische Pasta nach traditionellen Rezepten.",
    starter:"Vorspeisen",
    starter_desc:"Frische lokale Vorspeisen.",
    story_title:"Unsere Geschichte",
    story_text:"Familiengeschichte seit 1998.",
    contact_title:"Kontakt"
  }
};

function setLang(lang){
  document.querySelectorAll("[data-key]").forEach(el=>{
    el.textContent = translations[lang][el.dataset.key];
  });
}

function order(item){
  window.open("https://wa.me/393913404676?text=Ordino: "+item);
}
