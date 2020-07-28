
let sub =document.getElementsByClassName("SubmitItem")
let i;
for(i = 0; i<sub.length;i++){
  sub[i].addEventListener("click", () => {
  let title = document.getElementById("titleinput").value;
  let category = document.getElementById("categoryinput").value;

  
  let datel = document.getElementById("dateinput").value;
  let timel = document.getElementById("timeinput").value;
  let dateh = document.getElementById("dateinput2").value;
  let timeh = document.getElementById("timeinput2").value;
  let location = document.getElementById("coordinates").innerHTML;
  
  var item = {
    Title: title,
    Category:category,
    Datel: datel,
    Timel: timel,
    Dateh: dateh,
    Timeh: timeh,
    Location: location
  };
   console.log(item);
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "/searchLostItems", true);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.onloadend = function(e) {
  window.location.href = '/specificLost.html'
  };
  xmlhttp.send(JSON.stringify(item));
});
}



// document.getElementsByClassName("SubmitItem").addEventListener("click", () => {
//   let isLost = 1;
//   let title = document.getElementById("titleinput").value;
//   let category = document.getElementById("categoryinput").value;

  
//   let datel = document.getElementById("dateinput").value;
//   let timel = document.getElementById("timeinput").value;
//   let dateh = document.getElementById("dateinput2").value;
//   let timeh = document.getElementById("timeinput2").value;
//   let location = document.getElementById("coordinates").innerHTML;
  
//   var item = {
//     Title: title,
//     Category:category,
//     Datel: datel,
//     Timel: timel,
//     Dateh: dateh,
//     Timeh: timeh,
//     Location: location
//   };
//    console.log(item);
//   var xmlhttp = new XMLHttpRequest();
//   xmlhttp.open("POST", "/searchLostItems", true);
//   xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//   xmlhttp.onloadend = function(e) {
//   window.location.href = '/specificLost.html'
//   };
//   xmlhttp.send(JSON.stringify(item));
// });