const mysql = require('mysql');
var connection = mysql.createConnection({host:'localhost',user:'root',password:'',database:'hodarihub'});
//var connection = mysql.createConnection({host:'localhost',user:'root',password:'#Ushindi@123',database:'hodarihub'});
connection.connect();
module.exports=connection;