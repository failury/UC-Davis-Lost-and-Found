//api key = m214m3r8j0

// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();
const assets = require("./assets");
const FormData = require("form-data");
const bodyParser = require("body-parser");
const request = require("request");
// and some new ones related to doing the login process
const passport = require("passport");
// There are other strategies, including Facebook and Spotify
const GoogleStrategy = require("passport-google-oauth20").Strategy;
app.use(express.json());
// Multer is a module to read and handle FormData objects, on the server side
const multer = require("multer");
const fs = require("fs");
// Make a "storage" object that explains to multer where to store the images...in /images
//db init
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);
// Some modules related to cookies, which indicate that the user
// is logged in
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");

// Start
// of
// Google
// Login
// Server
// Code

// Setup passport, passing it information about what we want to do
passport.use(
  new GoogleStrategy(
    // object containing data to be sent to Google to kick off the login process
    // the process.env values come from the key.env file of your app
    // They won't be found unless you have put in a client ID and secret for
    // the project you set up at Google
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      // CHANGE THE FOLLOWING LINE TO USE THE NAME OF YOUR APP
      callbackURL: "https://krustykrabinterns-final.glitch.me/auth/accepted",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo", // where to go for info
      scope: ["profile", "email"] // the information we will ask for from Google
    },
    // function to call to once login is accomplished, to get info about user from Google;
    // it is defined down below.
    gotProfile
  )
);

//take HTTP message body and put it as a string into req.body
app.use(bodyParser.urlencoded({ extended: true }));

// puts cookies into req.cookies
app.use(cookieParser());

// pipeline stage that echos the url and shows the cookies, for debugging.
app.use("/", printIncomingRequest);

// Now some stages that decrypt and use cookies

// express handles decryption of cooikes, storage of data about the session,
// and deletes cookies when they expire
app.use(
  expressSession({
    secret: "bananaBread", // a random string used for encryption of cookies
    maxAge: 6 * 60 * 60 * 1000, // Cookie time out - six hours in milliseconds
    // setting these to default values to prevent warning messages
    resave: true,
    saveUninitialized: false,
    // make a named session cookie; makes one called "connect.sid" as well
    name: "ecs162-session-cookie"
  })
);

// Initializes request object for further handling by passport
app.use(passport.initialize());

// If there is a valid cookie, will call passport.deserializeUser()
// which is defined below.  We can use this to get user data out of
// a user database table, if we make one.
// Does nothing if there is no cookie
app.use(passport.session());

// stage to serve files from /user, only works if user in logged in

// If user data is populated (by deserializeUser) and the
// session cookie is present, get files out
// of /user using a static server.
// Otherwise, user is redirected to public splash page (/index) by
// requireLogin (defined below)
app.get("/user/*", requireUser, requireLogin, express.static("."));

// Now the pipeline stages that handle the login process itself

// Handler for url that starts off login with Google.
// The app (in public/index.html) links to here (note not an AJAX request!)
// Kicks off login process by telling Browser to redirect to Google.
app.get("/auth/google", passport.authenticate("google"));
// The first time its called, passport.authenticate sends 302
// response (redirect) to the Browser
// with fancy redirect URL that Browser will send to Google,
// containing request for profile, and
// using this app's client ID string to identify the app trying to log in.
// The Browser passes this on to Google, which brings up the login screen.

// Google redirects here after user successfully logs in.
// This second call to "passport.authenticate" will issue Server's own HTTPS
// request to Google to access the user's profile information with the
// temporary key we got from Google.
// After that, it calls gotProfile, so we can, for instance, store the profile in
// a user database table.
// Then it will call passport.serializeUser, also defined below.
// Then it either sends a response to Google redirecting to the /setcookie endpoint, below
// or, if failure, it goes back to the public splash page.
app.get(
  "/auth/accepted",
  passport.authenticate("google", {
    successRedirect: "/setcookie",
    failureRedirect: "/?email=notUCD"
  })
);

// One more time! a cookie is set before redirecting
// to the protected homepage
// this route uses two middleware functions.
// requireUser is defined below; it makes sure req.user is defined
// the second one makes a public cookie called
// google-passport-example
app.get("/setcookie", requireUser, function(req, res) {
  // if(req.get('Referrer') && req.get('Referrer').indexOf("google.com")!=-1){
  // mark the birth of this cookie
  // set a public cookie; the session cookie was already set by Passport
  res.cookie("google-passport-example", new Date());
  res.redirect("/screen2.html");
  //} else {
  //   res.redirect('/');
  //}
});

// currently not used
// using this route, we can clear the cookie and close the session
app.get("/user/logoff", function(req, res) {
  // clear both the public and the named session cookie
  res.clearCookie("google-passport-example");
  res.clearCookie("ecs162-session-cookie");
  res.redirect("/");
});

function printIncomingRequest(req, res, next) {
  // console.log("Serving", req.url);
  if (req.cookies) {
    // console.log("cookies", req.cookies);
  }
  next();
}

// function that handles response from Google containint the profiles information.
// It is called by Passport after the second time passport.authenticate
// is called (in /auth/accepted/)
function gotProfile(accessToken, refreshToken, profile, done) {
  console.log("Google profile", profile);
  // here is a good place to check if user is in DB,
  // and to store him in DB if not already there.
  // Second arg to "done" will be passed into serializeUser,
  // should be key to get user out of database.
  let email = profile.emails[0].value;

  var fields = email.split("@");
  let dbRowID = 1;
  if (fields[1] != "ucdavis.edu") {
    dbRowID = 7;
    request.get(
      "https://accounts.google.com/o/oauth2/revoke",
      {
        qs: { token: accessToken }
      },
      function(err, res, body) {
        console.log("revoked token");
      }
    );
  } // temporary! Should be the real unique
  // key for db Row for this user in DB table.
  // Note: cannot be zero, has to be something that evaluates to
  // True.

  done(null, dbRowID);
}

// Part of Server's sesssion set-up.
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie.
// For instance, if there was some specific profile information, or
// some user history with this Website we pull out of the user table
// using dbRowID.  But for now we'll just pass out the dbRowID itself.
passport.serializeUser((dbRowID, done) => {
  //console.log("SerializeUser. Input is", dbRowID);
  done(null, dbRowID);
});

// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie (so, while user is logged in)
// This time,
// whatever we pass in the "done" callback goes into the req.user property
// and can be grabbed from there by other middleware functions
passport.deserializeUser((dbRowID, done) => {
  //console.log("deserializeUser. Input is:", dbRowID);
  // here is a good place to look up user data in database using
  // dbRowID. Put whatever you want into an object. It ends up
  // as the property "user" of the "req" object.
  let userData = { userData: dbRowID };
  done(null, userData);
});

function requireUser(req, res, next) {
  console.log("require user", req.user);
  if (req.user.userData == 7) {
    res.redirect("/index.html/query?email=notUCD");
  } else {
    console.log("user is", req.user);
    next();
  }
}

function requireLogin(req, res, next) {
  console.log("checking:", req.cookies);
  if (!req.cookies["ecs162-session-cookie"]) {
    res.redirect("/");
  } else {
    next();
  }
}

// End
// of
// google
// login
// server
// code

//Google Maps start

app.get("/getInfo", (req, res) => {
  res.json({ text: "request success" });
});

app.get("/getAddress", (req, res) => {
  let url =
    "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
    req.query.lat +
    ", " +
    req.query.lng +
    "&key=" +
    process.env.API_KEY;
  request(url, { json: true }, (error, response, body) => {
    if (error) {
      return console.log(error);
    }
    res.json(body);
  });
});

// USE KEYWORDS TO FIND ADDRESS
// SEE https://developers.google.com/places/web-service/search#find-place-examples
app.get("/searchAddress", (req, res) => {
  // LOCATION BIAS
  var url =
    "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=" +
    req.query.input +
    "&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&locationbias=circle:100000@38.5367859,-121.7553711&key=" +
    process.env.API_KEY;
  request(url, { json: true }, (error, response, body) => {
    if (error) {
      return console.log(error);
    }
    res.json(body);
  });
});

//Google Maps End

db.serialize(() => {
  if (!exists) {
    db.run(
      "CREATE TABLE Items (id INTEGER PRIMARY KEY AUTOINCREMENT, isLost INTEGER, title TEXT, category TEXT, description TEXT, photoURL TEXT, date DATE, time TIME, location TEXT)"
    );
    console.log("New table for Items has been created!");

    // let cmd = "INSERT INTO Items (isLost, title, category, description, photoURL,date,time,location) VALUES(?,?,?,?,?,?,?,?)"
    // db.serialize(() => {
    //   db.run(cmd, "1","asdasdasd", "phone","asddescription","photoURL","date","time","location", function(err){});
    // });
  } else {
    console.log('Database "Items" ready to go!');
    db.each("SELECT * from Items", (err, row) => {
      if (row) {
        //print table
        console.log(`id: ${row.id}, isLost:${row.isLost}, title:${row.title}, category:${row.category}, description:${row.description}, photoURL${row.photoURL}, date:${row.date}, time:${row.time},location:${row.location}`);
      }
    });
  }
});
let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, __dirname + "/images");
  },
  // keep the file's original name
  // the default behavior is to make up a random string
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

let uploadMulter = multer({ storage: storage });

// First, server any static file requests
app.use(express.static("public"));
app.use(express.static("display"));

// Next, serve any images out of the /images directory
app.use("/images", express.static("images"));

// Next, serve images out of /assets (we don't need this, but we might in the future)
app.use("/assets", assets);

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/public/index.html");
});

app.get("/index.html/query?*", function(request, response) {
  response.sendFile(__dirname + "/public/index.html");
});

// Next, handle post request to upload an image
// by calling the "single" method of the object uploadMulter that we made above
app.post("/upload", uploadMulter.single("newImage"), function(
  request,
  response
) {
  // file is automatically stored in /images
  // WARNING!  Even though Glitch is storing the file, it won't show up
  // when you look at the /images directory when browsing your project
  // until later.  So sorry.
  console.log(
    "Recieved",
    request.file.originalname,
    request.file.size,
    "bytes"
  );
  let file_name = "/images/";
  console.log(request.file.originalname);
  file_name = file_name.concat(request.file.originalname);
  console.log(file_name);
  sendMediaStore(file_name, request, response);

  let file = "/app/images/";

  file = file.concat(request.file.originalname);
  fs.unlink(file, function(err) {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log("Image Deleted from personal server");
  });
});

// listen for HTTP requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

// function called when the button is pushed
// handles the upload to the media storage API
function sendMediaStore(filename, serverRequest, serverResponse) {
  let apiKey = process.env.ECS162KEY;
  if (apiKey === undefined) {
    serverResponse.status(400);
    serverResponse.send("No API key provided");
  } else {
    // we'll send the image from the server in a FormData object
    let form = new FormData();

    // we can stick other stuff in there too, like the apiKey
    form.append("apiKey", apiKey);
    // stick the image into the formdata object
    form.append("storeImage", fs.createReadStream(__dirname + filename));
    // and send it off to this URL
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(
      err,
      APIres
    ) {
      // did we get a response from the API server at all?
      if (APIres) {
        // OK we did
        console.log("API response status", APIres.statusCode);
        // the body arrives in chunks - how gruesome!
        // this is the kind stream handling that the body-parser
        // module handles for us in Express.
        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {
          // now we have the whole body
          if (APIres.statusCode != 200) {
            serverResponse.status(400); // bad request
            serverResponse.send(" Media server says: " + body);
          } else {
            serverResponse.status(200);
            serverResponse.send(body);
          }
        });
      } else {
        // didn't get APIres at all
        serverResponse.status(500); // internal server error
        serverResponse.send("Media server seems to be down.");
      }
    });
  }
}

let cmd =
  "INSERT INTO Items (isLost, title, category, description, photoURL,date,time,location) VALUES(?,?,?,?,?,?,?,?)";
app.post("/save", function(req, res) {
  console.log(req.body.IsLost);
  console.log(req.body.Title);
  console.log(req.body.Category);
  console.log(req.body.Description);
  console.log(req.body.PhotoURL);
  console.log(req.body.Date);
  console.log(req.body.Time);
  console.log(req.body.Location);
  db.serialize(() => {
    db.run(
      cmd,
      req.body.IsLost,
      req.body.Title,
      req.body.Category,
      req.body.Description,
      req.body.PhotoURL,
      req.body.Date,
      req.body.Time,
      req.body.Location,
      function(err) {}
    );
  });

  res.send("DATA SENT");
  res.end();
});

//Used for submit
//Screen9
app.post("/getAllLostItems", function(request, response) {
  //get all lost items
  let cmd = "SELECT * FROM Items WHERE isLost = 1";
  let buf = 0;
  let data = { items: [] };
  let singleItem;
  response.setHeader("Content-Type", "application/json;charset=UTF-8");
  db.all(cmd, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach(row => {
      singleItem = {
        IsLost: row.isLost,
        Title: row.title,
        Category: row.category,
        Description: row.description,
        PhotoURL: row.photoURL,
        Date: row.date,
        Time: row.time,
        Location: row.location
      };
      data["items"][buf] = singleItem;
      buf = buf + 1;
    });
    response.send(JSON.stringify(data));
  });
});

//Screen 10;
app.post("/getAllFoundItems", function(request, response) {
    //get all lost items
  let cmd = "SELECT * FROM Items WHERE isLost = 0";
  let buf = 0;
  let data = { items: [] };
  let singleItem;
  response.setHeader("Content-Type", "application/json;charset=UTF-8");
  db.all(cmd, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach(row => {
      singleItem = {
        IsLost: row.isLost,
        Title: row.title,
        Category: row.category,
        Description: row.description,
        PhotoURL: row.photoURL,
        Date: row.date,
        Time: row.time,
        Location: row.location
      };
      data["items"][buf] = singleItem;
      buf = buf + 1;
    });
    response.send(JSON.stringify(data));
  });
  
  
  
});
let searchResults;

//Used for screen8 -> screen 10 but has serach
app.post("/searchLostItems", function(request, response) {
  //get all lost items based on specific time & location
  console.log(request.body);
  let title = request.body.Title;
  let category = request.body.Category;
  let ldate = request.body.Datel;
  let ltime = request.body.Timel;
  let hdate = request.body.Dateh;
  let htime = request.body.Timeh;
  let location = request.body.Location;

  // select * from items where isLost = 1 And category = ... and date >= ldate and date <= hdate and time >= ltime and time <= htime and location = location or title = title
  let cmd = "SELECT * FROM Items WHERE isLost = 1";

  if (category != "") {
    cmd = cmd + " AND category = '" + category + "'";
  }

  if (ldate != "" && hdate != "") {
    cmd = cmd + " AND date BETWEEN '" + ldate + "' " + "and '" + hdate + "'";
  }
  
  if (ltime != "" && htime != ""){
    cmd = cmd + " AND time BETWEEN '" + ltime + "' " + "and '" + htime + "'";
  }
  
  if (location != ""){
    cmd = cmd + " AND location = '" + location + "'";
    
  }
  
  if (title != ""){
    cmd = cmd + " AND title LIKE '%" + title + "%'";
  }
  
console.log(cmd);
  let buf = 0;
  let data = { items: [], specifications:[] };
  let specs = {
    lowdate: ldate,
    highdate:hdate,
    categ:category,
    locat:location
  }
  data["specifications"][0] = specs;
  let singleItem;
  response.setHeader("Content-Type", "application/json;charset=UTF-8");
  db.all(cmd, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach(row => {
      singleItem = {
        IsLost: row.isLost,
        Title: row.title,
        Category: row.category,
        Description: row.description,
        PhotoURL: row.photoURL,
        Date: row.date,
        Time: row.time,
        Location: row.location
      };
      data["items"][buf] = singleItem;
      buf = buf + 1;
      
      
    });
    searchResults = data;
    console.log(searchResults)
    response.send(JSON.stringify(data));

  });
});


app.post("/searchFoundItems", function(request, response) {
  //get all lost items based on specific time & location
  console.log(request.body);
  let title = request.body.Title;
  let category = request.body.Category;
  let ldate = request.body.Datel;
  let ltime = request.body.Timel;
  let hdate = request.body.Dateh;
  let htime = request.body.Timeh;
  let location = request.body.Location;

  // select * from items where isLost = 1 And category = ... and date >= ldate and date <= hdate and time >= ltime and time <= htime and location = location or title = title
  let cmd = "SELECT * FROM Items WHERE isLost = 0";

  if (category != "") {
    cmd = cmd + " AND category = '" + category + "'";
  }

  if (ldate != "" && hdate != "") {
    cmd = cmd + " AND date BETWEEN '" + ldate + "' " + "and '" + hdate + "'";
  }
  
  if (ltime != "" && htime != ""){
    cmd = cmd + " AND time BETWEEN '" + ltime + "' " + "and '" + htime + "'";
  }
  
  if (location != ""){
    cmd = cmd + " AND location = '" + location + "'";
    
  }
  
  if (title != ""){
    cmd = cmd + " AND title LIKE '%" + title + "%'";
  }
  
console.log(cmd);
  let buf = 0;
  let data = { items: [], specifications:[] };
  let specs = {
    lowdate: ldate,
    highdate:hdate,
    categ:category,
    locat:location
  }
  data["specifications"][0] = specs;
  let singleItem;
  response.setHeader("Content-Type", "application/json;charset=UTF-8");
  db.all(cmd, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach(row => {
      singleItem = {
        IsLost: row.isLost,
        Title: row.title,
        Category: row.category,
        Description: row.description,
        PhotoURL: row.photoURL,
        Date: row.date,
        Time: row.time,
        Location: row.location
      };
      data["items"][buf] = singleItem;
      buf = buf + 1;
      
      
    });
    searchResults = data;
    console.log(searchResults)
    response.send(JSON.stringify(data));

  });
});




app.post("/getSearchResults", function(request, response) {

  response.setHeader("Content-Type", "application/json;charset=UTF-8");
  response.send(JSON.stringify(searchResults));

});