
var link = window.location.href;
console.log(link.substr(link.length - 13));
if (link.substr(link.length - 13) == "email=notUCD#") {
  document.getElementById("overlay").style.display = "block";
}
function off() {
  document.getElementById("overlay").style.display = "none";
}
