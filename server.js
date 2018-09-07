var express = require("express");
var bodyParser = require("body-parser");

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "watch_list_db"
});

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});
//Use Handlebars to render main index.html page
app.get("/", function(req, res) {
    connection.query("SELECT * FROM movies;", function(err, data){
        if (err) {
            return res.status(500).end(); 
        }

        res.render("index", {movies:data});
    });
});

//create a new movie

app.post("/movies", function(req, res) {
  connection.query("INSERT INTO movies (movie) VALUES (?)", [req.body.movie], function(err, result){
    if (err) {
      return res.status(500).end();
    }
//send back id of new movie
    
    res.json({id:result.insertId});
    console.log({id: result.insertId});
  });
});

//retrieve all movies
app.get("/movies", function(req, res){
  connection.query("SELECT * FROM movies;", function(err, data){
    if (err) {
      return res.status(500).end();
    }
    res.json(data);
  });
});

//update movie
app.put("/movies/:id", function(req, res){
  connection.query("UPDATE movies SET movie = ? WHERE id = ?",
[req.body.plan, req.params.id], function(err, result){
  if (err) {
    return res.status(500).end();
  }
  else if (result.changedRows === 0) {
    return res.status(404).end();
  }
  res.status(200).end();
});
});

//delete a movie
app.delete("/movies/:id", function(req, res) {
  connection.query("DELETE FROM movies WHERE id = ?", [req.params.id], function(err, result){
    if(err) {
      return res.status(500).end();
    }
    else if (result.affectedRows === 0){
      return res.status(404).end();
    }
    res.status(200).end();
  });
});

app.listen(PORT, function() {
  console.log("Server listening on " + PORT);
});