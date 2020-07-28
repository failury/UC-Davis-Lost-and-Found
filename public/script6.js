// Always include at top of Javascript file
"use strict";

// UPLOAD IMAGE using a post request
// Called by the event listener that is waiting for a file to be chosen
function uploadFile() {
  // get the file chosen by the file dialog control
  const selectedFile = document.getElementById("fileChooser").files[0];
  // store it in a FormData object
  const formData = new FormData();
  // name of field, the file itself, and its name
  formData.append("newImage", selectedFile, selectedFile.name);

  // build a browser-style HTTP request data structure
  const xhr = new XMLHttpRequest();
  // it will be a POST request, the URL will this page's URL+"/upload"
  xhr.open("POST", "/upload", true);
  document.getElementById("chooserlable").innerHTML = "Uploading";
  // callback function executed when the HTTP response comes back
  xhr.onloadend = function(e) {
    // Get the server's response body
    console.log(xhr.responseText);
    document.getElementById("chooserlable").innerHTML = "Change File";
  };

  // actually send the request
  xhr.send(formData);
}

// // Add event listener to the file input element
document.getElementById("fileChooser").addEventListener("change", uploadFile);

let prompt1 = document.getElementById("prompt1");
let prompt2 = document.getElementById("prompt2");
document.getElementById("next").addEventListener("click", () => {
  console.log("clicked");
  prompt1.style.display = "none";
  prompt2.style.display = "flex";
});

document.getElementById("SubmitItem").addEventListener("click", () => {
  let isLost = 1;
  let title = document.getElementById("titleinput").innerHTML;
  let category = document.getElementById("categoryinput").value;
  let description = document.getElementById("descriptioninput").innerHTML;
  let photoURL;
  if (document.querySelector("#fileChooser").files[0] == null) {
    photoURL = "";
  } else {
    let file_name = document.querySelector("#fileChooser").files[0].name;
    photoURL = "http://ecs162.org:3000/images/stetan/";
    photoURL = photoURL.concat(file_name);
  }

  let date = document.getElementById("dateinput").value;
  let time = document.getElementById("timeinput").value;
  let location = document.getElementById("coordinates").innerHTML;

  var item = {
    IsLost: isLost,
    Title: title,
    Category: category,
    Description: description,
    PhotoURL: photoURL,
    Date: date,
    Time: time,
    Location: location
  };
  console.log(item);
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "/save", true);
  xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xmlhttp.onloadend = function(e) {
    window.location.href = "/submit.html";
  };
  xmlhttp.send(JSON.stringify(item));
});
