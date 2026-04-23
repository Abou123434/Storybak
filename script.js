// HORAIRES AUTO
const now=new Date();
const day=now.getDay();
const hour=now.getHours();
let open=false;

if(day>=1 && day<=4 && hour>=12 && hour<=23) open=true;
if(day==5 && hour>=12 && hour<=24) open=true;
if(day==6 && hour>=19 && hour<=24) open=true;

document.getElementById("status").innerText = open ? "🟢 Ouvert maintenant" : "🔴 Fermé";

// WHATSAPP FORM
document.getElementById("bookingForm").addEventListener("submit",e=>{
e.preventDefault();
let text=`Nouvelle réservation:%0A Nom:${name.value}%0A Téléphone:${phone.value}%0A Personnes:${people.value}%0A Date:${date.value}%0A Heure:${time.value}%0A Message:${message.value}`;
window.open(`https://wa.me/22500000000?text=${text}`);
});

// MULTILANGUE
const translations={
en:{hero_title:"Ultimate dining experience",book_table:"Book a table",menu_title:"Our Menu",hours_title:"Opening Hours",reservation_title:"Book a table",send_whatsapp:"Send via WhatsApp"},
it:{hero_title:"Esperienza culinaria",book_table:"Prenota tavolo",menu_title:"Menu",hours_title:"Orari",reservation_title:"Prenota tavolo",send_whatsapp:"Invia WhatsApp"},
de:{hero_title:"Kulinarisches Erlebnis",book_table:"Reservieren",menu_title:"Menü",hours_title:"Öffnungszeiten",reservation_title:"Reservieren",send_whatsapp:"Per WhatsApp senden"},
ar:{hero_title:"تجربة طعام فاخرة",book_table:"احجز طاولة",menu_title:"القائمة",hours_title:"ساعات العمل",reservation_title:"احجز",send_whatsapp:"إرسال واتساب"}
};

document.getElementById("languageSwitcher").addEventListener("change",e=>{
let lang=e.target.value;
document.querySelectorAll("[data-translate]").forEach(el=>{
el.innerText=translations[lang][el.dataset.translate]||el.innerText;
});
document.body.style.direction=(lang=="ar")?"rtl":"ltr";
});
