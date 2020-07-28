var i, j, k, l;
let collapsable_object = document.getElementsByClassName("collapsible")[0];
var element = document.getElementsByClassName("element")[0];
var coll = document.getElementsByClassName("collapsible");
let more = document.getElementsByClassName("more");
var less = document.getElementsByClassName("less");

var main = document.getElementById("main");
let xhr = new XMLHttpRequest();
xhr.open("POST", "/getAllLostItems", true);
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhr.onloadend = function(e) {
  let data = JSON.parse(xhr.responseText); //turn to object
  data = data["items"];
  console.log(data.length);

  for (k = 0; k < data.length; k++) {
    if (k == 0) {
      collapsable_object.style.display = "flex";
    } else {
      var clone = element.cloneNode(true);
      document.getElementById("main").appendChild(clone);
      
      
    }
  }
  


  
  var itemNames = document.getElementsByClassName("itemName");
  var images = document.getElementsByClassName("image");
  var categoryvalueslist = document.getElementsByClassName("categoryvalues");
  var locationvalueslist = document.getElementsByClassName("locationvalues");
  var datevalueslist = document.getElementsByClassName("datevalues");
  var paragraphs = document.getElementsByClassName("smalltext");
  for (var l = 0; l < data.length; l++) {
    console.log(
      data[l].Title,
      data[l].PhotoURL,
      data[l].Category,
      data[l].Location,
      data[l].Date,
      data[l].Time,
      data[l].Description
    );
    itemNames[l].innerHTML = data[l].Title;
    images[l].src = data[l].PhotoURL;
    categoryvalueslist[l].innerHTML = data[l].Category;
    var shortlocation = data[l].Location.split(",");
    locationvalueslist[l].innerHTML = shortlocation[0];
    datevalueslist[l].innerHTML = data[l].Date + " " + data[l].Time;
    paragraphs[l].innerHTML = data[l].Description;
  }
  
  
  
  
  
  
  
  //Click Listener
  for (i = 0; i < coll.length; i++) {
  if (coll[i].nextElementSibling.firstElementChild.firstElementChild.src == "https://krustykrabinterns-final.glitch.me/screen9.html") {
    coll[i].nextElementSibling.firstElementChild.firstElementChild.style.display ="none";
  }

  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    console.log(coll.length);
    var content = this.nextElementSibling;
    if (content.style.display === "flex") {
      content.style.display = "none";
    } else {
      content.style.display = "flex";
    }
    if (this.lastElementChild.style.display == "none") {
      this.lastElementChild.style.display = "block";
    } else {
      this.lastElementChild.style.display = "none";
    }
  });
}
  for (j = 0; j < less.length; j++) {
  less[j].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.parentElement;
    if (content.style.display == "flex") {
      content.style.display = "none";
      content.previousElementSibling.lastElementChild.style.display = "flex";
    } else {
      content.style.display = "flex";
    }
  });
}
};









xhr.send();


// let less = document.querySelectorAll(".");




