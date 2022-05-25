const express = require("express");
const twiter_route = express.Router();
const conn=require("../modals/connection");
const checktags=require("../controllers/checkTags");

twiter_route.post('/addapp',async (req,res)=>{
    const {appName,appKey,keySecrete,accessToken,accessSecrete} = req.body;
    conn.query(`INSERT INTO botapp(app_name,api_key,api_secrete,access_token,access_secret) VALUES('${appName}','${appKey}','${keySecrete}','${accessToken}','${accessSecrete}')`, 
        function (error, results) {
            if(error){console.log(error);}
            if(results.affectedRows){res.json({code: 1,message:"App added successfully!",appid:results.insertId});res.end();}
            else{res.json({code: 0,message:"Insertion failed!"}); res.end();}
        });
});

twiter_route.post('/addTag',async (req,res)=>{
    const {newTag} = req.body;
    conn.query(`INSERT INTO tags(tag_Name) VALUES ('${newTag}')`, 
    function (error, results) {
        if(error){console.log(error);}
        if(results.affectedRows){res.json({code: 1,message:"Tag added successfully!",tag_id:results.insertId});res.end();}
        else{res.json({code: 0,message:"Insertion failed!"});res.end();}
    });
});

twiter_route.post('/add_tagwords',async (req,res)=>{
    const {tagwords} = req.body;
    conn.query(`INSERT INTO tagwords(wordtoListern) VALUES ('${tagwords}')`, 
    function (error, results) {
        if(error){console.log(error);}
        if(results.affectedRows){res.json({code: 1,message:"Tag Word added successfully!",tag_id:results.insertId});res.end();}
        else{res.json({code: 0,message:"Insertion failed!"});res.end();}
    });
});

twiter_route.post('/addRetweet',async (req,res)=>{
    const {time_interval,dedicated_day,selected_tag,app_id,numofretweet} = req.body;
    conn.query(`INSERT INTO retweets(time_interval,app_id,tag_name,day_name,numofretweet) VALUES('${time_interval}','${app_id}','${selected_tag}','${dedicated_day}','${numofretweet}')`, 
    function (error, results) {
        if(error){console.log(error);}
        if(results.affectedRows){checktags.updateTags();res.json({code: 1,message:"Retweet schedule is set successfully!"});res.end();}
        else{res.json({code: 0,message:"Insertion failed!"});res.end();}
    });
});

twiter_route.post('/getTable',async (req,res)=>{
    const {getTable}=req.body;
    conn.query(`SELECT * FROM retweets WHERE app_id='${getTable}'`, 
    function (error, results) {
        if(error){console.log(error);}
        let rtac="";
        if(results.length){
            for(let i =0; i<results.length; i++){rtac+=`<tr id='tr_${results[i].rt_id}'><th scope="row">${i+1}</th><td>${results[i].day_name}</td><td>${results[i].tag_name}</td><td>${results[i].time_interval}</td><td><i id="delet_${results[i].rt_id}" class="bi bi-trash deleteTag" data-day='${results[i].day_name}' data-id='${results[i].rt_id}' role='button'></i></td></tr>`;}
            res.json({code: 1,message:"Retweet schedule is set successfully!",list:rtac}); res.end();
        }
        else{res.json({code: 0,message:"No data found!"});res.end();}
    });
});

twiter_route.post('/deleteTag',async (req,res)=>{
    const {id}=req.body;
    conn.query(`DELETE FROM retweets WHERE rt_id='${id}'`, 
    function (error, results) {
        if(error){console.log(error);}
        if(results.affectedRows){res.json({code: 1,message:"Retweet deleted from schedule successfully!"});res.end();}
        else{res.json({code: 0,message:"Insertion failed!"});res.end();}
    });
});

twiter_route.post('/delete_tag',async (req,res)=>{
    const {appid}=req.body;
    conn.query(`DELETE FROM tags WHERE tag_id='${appid}'`, 
    function (error, results) {
        if(error){console.log(error);}
        if(results.affectedRows){res.json({code: 1,message:"Tag deleted successfully!"});res.end();}
        else{res.json({code: 0,message:"Insertion failed!"}); res.end();}
    });
});

twiter_route.post('/delete_app',async (req,res)=>{
    const {botid}=req.body;
    conn.query(`DELETE FROM botapp WHERE app_id='${botid}'`, 
    function (error, results) {
        if(error){console.log(error);}
        if(results.affectedRows){res.json({code: 1,message:"App deleted successfully!"});res.end();}
        else{res.json({code: 0,message:"Insertion failed!"}); res.end();}
    });
});

module.exports=twiter_route;