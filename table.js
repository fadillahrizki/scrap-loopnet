var mysql = require('mysql');

var conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "loopnet"
});

conn.connect(function(err) {
  if (err) throw err;
  var sql = `CREATE TABLE products (
          id INT AUTO_INCREMENT PRIMARY KEY, 
          name VARCHAR(255), 
          link VARCHAR(255), 
          category VARCHAR(255), 
          state VARCHAR(255), 
          city VARCHAR(255), 
          address VARCHAR(255), 
          contact_name VARCHAR(255), 
          contact_number VARCHAR(255), 
          sale_condition VARCHAR(255), 
          sale_type VARCHAR(255),
          building_size VARCHAR(255),
          building_class VARCHAR(255),
          year_built VARCHAR(255),
          property_sub_type VARCHAR(255),
          price VARCHAR(255), 
          price_per VARCHAR(255),
          lot_size VARCHAR(255),
          no_stories VARCHAR(255),
          latitude VARCHAR(255),
          longitude VARCHAR(255)
        )`;
  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created")
    process.exit()
  })
});

