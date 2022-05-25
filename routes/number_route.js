const express = require("express");
const number_route = express.Router();
const conn=require("../modals/connection");

number_route.post('/addNumber',async (req,res)=>{
    const {number_owner,new_number,response_url} = req.body;
    conn.query(`INSERT INTO onlinenumber(user_name,user_number,unique_URL) VALUES ('${number_owner}','${new_number}','${response_url}')`, 
        function (error, results) {
            if(error){console.log(error);}
            if(results.affectedRows){res.json({code: 1,message:"App added successfully!",number_id:results.insertId});res.end();}
            else{res.json({code: 0,message:"Insertion failed!"}); res.end();}
        });
});

number_route.get("/message/:id",async (req,res)=>{
    let mesageto=req.params.id;
    let from=req.body.From;
    let message=req.body.Body;
    console.log("the message url has called!",mesageto,from,message);
    conn.query(`INSERT INTO messages(message,number_id,from_num) VALUES('${message}','${mesageto}','${from}')`,function (error, results) {
            if(error){console.log(error);}
        });
        //res.writeHead(200, {'Content-Type': 'text/xml'});
        res.send("<Response><Message>Hello! This is the response</Message></Response>");
});

module.exports=number_route;