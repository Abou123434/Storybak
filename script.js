function order(item){
  let phone = "393913404676";
  let msg = "Ciao, voglio ordinare: " + item;
  let url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(msg);
  window.open(url, "_blank");
}

function topFunction(){
  window.scrollTo({top:0, behavior:"smooth"});
}
