var mysql = require('mysql');

var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root"
});

conn.connect(function(err) {
  if (err) throw err;
  conn.query("CREATE DATABASE loopnet", function (err, result) {
    if (err) throw err;
    console.log("Database created");
    process.exit()
  });
})
