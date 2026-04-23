// HORAIRES OUVERT / FERME
const statusText = document.getElementById("status");
const hour = new Date().getHours();
statusText.innerText = (hour>=12 && hour<=23) ? "🟢 Ouvert maintenant" : "🔴 Fermé";

// 🌍 TRADUCTIONS
const translations = {
fr:{
nav_menu:"Menu",nav_about:"À propos",nav_gallery:"Galerie",nav_book:"Réserver",
hero_title:"L'expérience culinaire ultime",
hero_sub:"Haute gastronomie • Produits d’exception • Instant magique",
book_table:"Réserver une table",
view_menu:"Voir le menu",
menu_title:"Notre Menu Signature",
about_title:"Notre Histoire",
about_text:"Depuis 2010, nous sublimons la gastronomie avec passion.",
gallery_title:"Galerie",
hours_title:"Horaires",
find_us:"Nous trouver",
reservation_title:"Réserver une table",
reviews_title:"Avis clients",
send:"Envoyer"
},

en:{
nav_menu:"Menu",nav_about:"About",nav_gallery:"Gallery",nav_book:"Book",
hero_title:"Ultimate dining experience",
hero_sub:"Fine dining • Exceptional products • Magical moments",
book_table:"Book a table",
view_menu:"View menu",
menu_title:"Our Menu",
about_title:"Our Story",
about_text:"Since 2010 we elevate gastronomy with passion.",
gallery_title:"Gallery",
hours_title:"Opening hours",
find_us:"Find us",
reservation_title:"Book a table",
reviews_title:"Customer reviews",
send:"Send"
},

it:{
nav_menu:"Menu",nav_about:"Chi siamo",nav_gallery:"Galleria",nav_book:"Prenota",
hero_title:"Esperienza culinaria definitiva",
hero_sub:"Alta cucina • Prodotti eccezionali",
book_table:"Prenota tavolo",
view_menu:"Vedi menu",
menu_title:"Il nostro menu",
about_title:"La nostra storia",
about_text:"Dal 2010 eleviamo la gastronomia.",
gallery_title:"Galleria",
hours_title:"Orari",
find_us:"Dove siamo",
reservation_title:"Prenota tavolo",
reviews_title:"Recensioni",
send:"Invia"
},

de:{
nav_menu:"Menü",nav_about:"Über uns",nav_gallery:"Galerie",nav_book:"Reservieren",
hero_title:"Ultimatives kulinarisches Erlebnis",
hero_sub:"Gourmetküche • Magische Momente",
book_table:"Tisch reservieren",
view_menu:"Menü ansehen",
menu_title:"Unser Menü",
about_title:"Unsere Geschichte",
about_text:"Seit 2010 veredeln wir Gastronomie.",
gallery_title:"Galerie",
hours_title:"Öffnungszeiten",
find_us:"Standort",
reservation_title:"Tisch reservieren",
reviews_title:"Bewertungen",
send:"Senden"
},

ar:{
nav_menu:"القائمة",nav_about:"من نحن",nav_gallery:"معرض",nav_book:"احجز",
hero_title:"تجربة طعام فاخرة",
hero_sub:"مطبخ فاخر • لحظات سحرية",
book_table:"احجز طاولة",
view_menu:"عرض القائمة",
menu_title:"قائمتنا",
about_title:"قصتنا",
about_text:"منذ 2010 نقدم تجربة فاخرة.",
gallery_title:"معرض الصور",
hours_title:"ساعات العمل",
find_us:"موقعنا",
reservation_title:"احجز طاولة",
reviews_title:"آراء العملاء",
send:"إرسال"
}
};

document.getElementById("languageSwitcher").addEventListener("change", e=>{
const lang=e.target.value;
document.querySelectorAll("[data-translate]").forEach(el=>{
el.textContent=translations[lang][el.dataset.translate];
});
document.body.style.direction = (lang==="ar")?"rtl":"ltr";
});
