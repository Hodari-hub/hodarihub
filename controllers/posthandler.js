const express = require("express");
const post_route = express.Router();
const conn=require("../modals/connection");
var bcrypt = require('bcryptjs');
const rt_fromspecific=require("./retweet_from_specific");

//authed check
const isAuth=(req,res,next)=>{
    //check if there is any cookies established
    if(typeof req.cookies !== 'undefined'){
        //run the database check and log user in if success or redirect incase of fuiler
        if(typeof req.cookies.userPass !== undefined && req.cookies.userEmail!=""){next();}
        //if cookies is not set then redirect user to the login page
        else{res.redirect("/");}
    }
    else{res.redirect("/");}
}

//add new user to the database
post_route.post("/addnewmember",isAuth,(req,res)=>{
    const {fname, uaddress, phone1, phone2, utype, location, description, password}=req.body;
    let hashpassword = bcrypt.hashSync(password, 8);
    //check if user exist first
    conn.query(`SELECT * FROM base_members WHERE m_name='${fname}' AND m_email='${uaddress}' AND (m_phone_number='${phone1}' OR m_sec_number='${phone2}')`,(err,results)=>{
        if(err) throw err;
        if(!results.length){
            //if user is not exist then insert the new user to the database
            conn.query(`INSERT INTO base_members SET ?`,{m_pic:'/static/images/user.png',m_name:fname,m_pass:hashpassword,m_email:uaddress,m_phone_number:phone1,m_sec_number:phone2,m_type:utype,m_location:location,m_description:description,created_by:req.cookies.userId,date_created:new Date().toISOString().slice(0, 20),last_log:new Date().toISOString().slice(0, 20),}, 
            function(error, results) {
                if(error) throw error;
                if(results.affectedRows){
                    res.json({code: 1,message:"Succesfuly new user inserted"});
                    res.end();
                }
                else{
                    res.json({code: 0,message:"An unknown error occurred, and a new user could not be saved!"});
                    res.end();
                }
            });
        }
    });
});

//add new bot to the database
post_route.post("/addnewbot",isAuth,(req,res)=>{
    const {baretoken,bots_name,medianame,owner_id,media_address,bots_phone,password,api_key,apisecret,access_token,access_secret,description}=req.body;
    //check if user exist first
    conn.query(`SELECT * FROM bots WHERE medianame='${medianame}' AND owner_id='${owner_id}' AND bot_name='${bots_name}'`,(err,results)=>{
        if(err) throw err;
        if(!results.length){
            //if user is not exist then insert the new user to the database
            conn.query(`INSERT INTO bots SET ?`,{baretoken:baretoken,owner_id:owner_id,bot_name:bots_name,medianame:medianame,media_address:media_address,description:description,bot_phone:bots_phone,api_key:api_key,apisecret:apisecret,access_token:access_token,access_secret:access_secret,media_password:password,created_by:req.cookies.userId,date_created:new Date().toISOString().slice(0, 20)}, 
            function(error, results) {
                if(error) throw error;
                if(results.affectedRows){
                    res.json({code: 1,message:"Succesfuly!, new bot inserted"});
                    res.end();
                }
                else{
                    res.json({code: 0,message:"An unknown error occurred, and a new bot couldn't be saved!"});
                    res.end();
                }
            });
        }
    });
});

post_route.post("/deletuser",isAuth,(req,res)=>{
    const {userid} = req.body;
    conn.query(`DELETE FROM base_members WHERE m_id='${userid}' AND m_type!='${userid}'`,(err,resp)=>{
        if(err) throw err;
        if(resp.affectedRows){
            res.json({code: 1,message:"Succesfuly!, user deleted"});
            res.end();
        }
        else{
            res.json({code: 0,message:"Unknown error occurred, user couldn't be deleted!"});
            res.end(); 
        }
    });
});

post_route.post("/edit_user",isAuth,(req,res)=>{
    const {fname, uaddress, phone1, phone2, utype, location, description, password}=req.body;
    let hashpassword = bcrypt.hashSync(password, 8);
    conn.query(`UPDATE base_members SET m_name='${fname}',m_email='${uaddress}',m_phone_number='${phone1}',m_sec_number='${phone2}',m_pass='${hashpassword}',m_type='${utype}',m_description='${description}',m_location='${location}',m_pass='${hashpassword}' WHERE m_id='${req.cookies.userId}' AND m_pass='${req.cookies.userPass}'`,(err,resp)=>{
        if(err) throw err;
        if(resp.affectedRows){ res.cookie('userPass',hashpassword); res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, user deleted"}); res.end(); }
        else{res.json({code: 0,message:"Unknown error occurred, user couldn't be deleted!"}); res.end(); }
    });
});

//delete media
post_route.post("/delete_media",isAuth,(req,res)=>{
    const {mediaid}=req.body;
    conn.query(`DELETE FROM bots WHERE bot_id='${mediaid}'`,(err,resp)=>{
        if(err) throw err;
        if(resp.affectedRows){res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, media deleted"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, media couldn't be deleted!"}); res.end();}
    });
});

post_route.post("/new_email",isAuth,(req,res)=>{
    const {email_name, emailtype, owner_id, email_address, primary_address, email_phone, password}=req.body;
    conn.query(`INSERT INTO emails SET ?`,{owner_id:owner_id,f_name:email_name,mailtype:emailtype,mail_address:email_address,primary_address:primary_address,mail_phone:email_phone,password:password,created_by:req.cookies.userId,	date_created:new Date().toISOString().slice(0, 20)}, 
    function(error, results) {
        if(error) throw error;
        if(results.affectedRows){
            res.json({code: 1,message:"Succesfuly!, new email inserted"});
            res.end();
        }
        else{
            res.json({code: 0,message:"An unknown error occurred, and a new email couldn't be saved!"});
            res.end();
        }
    });
});

//edit bot
post_route.post("/edit_bot_form",isAuth,(req,res)=>{
    const {baretoken,bot_id,bots_name,medianame,owner_id,media_address,bots_phone,password,api_key,apisecret,access_token,access_secret,description}=req.body;
    let changeOwner,admn;

    if(req.cookies.userType=="admin"){changeOwner=`owner_id='${owner_id}',`;admn=``;}
    else{changeOwner=``;admn=` AND owner_id='${req.cookies.userId}'`;}

    conn.query(`
        UPDATE bots SET ${changeOwner}bot_name='${bots_name}',medianame='${medianame}',
        media_address='${media_address}',description='${description}',bot_phone='${bots_phone}',
        api_key='${api_key}',apisecret='${apisecret}',baretoken='${baretoken}',
        access_token='${access_token}',access_secret='${access_secret}',media_password='${password}'
        WHERE bot_id='${bot_id}'${admn}`,
        (err,resp)=>{
            if(err) throw err;
            if(resp.affectedRows){res.json({code: 1,message:"Succesfuly!, user deleted"}); res.end();}
            else{res.json({code: 0,message:"Unknown error occurred, user couldn't be deleted!"}); res.end(); }
        });
});

post_route.post("/delete_email",isAuth,(req,res)=>{
    const {mailid} = req.body;
    conn.query(`DELETE FROM emails WHERE mail_id='${mailid}'`,(err,resp)=>{
        if(err) throw err;
        if(resp.affectedRows){res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, email deleted"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, email couldn't be deleted!"}); res.end();}
    });
});

post_route.post("/edit_email",isAuth,(req,res)=>{
    const {mail_id,email_name, emailtype, owner_id, email_address, primary_address, email_phone, password}=req.body;
    let changeOwner,admn;

    if(req.cookies.userType=="admin"){changeOwner=`owner_id='${owner_id}',`;admn=``;}
    else{changeOwner=``;admn=` AND owner_id='${req.cookies.userId}'`;}

    conn.query(`UPDATE emails SET ${changeOwner}f_name='${email_name}',mailtype='${emailtype}',mail_address='${email_address}',primary_address='${primary_address}',mail_phone='${email_phone}',
                password='${password}' WHERE mail_id='${mail_id}'${admn}`,
        (err,resp)=>{
            if(err) throw err;
            if(resp.affectedRows){res.json({code: 1,message:"Succesfuly!, user deleted"}); res.end();}
            else{res.json({code: 0,message:"Unknown error occurred, user couldn't be deleted!"}); res.end(); }
        });
});

post_route.post("/newbystander",isAuth,(req,res)=>{
    const {selected_bot,key_word}=req.body;
    conn.query(`INSERT INTO key_bystander SET ?`,{bot_id:selected_bot, keyword:key_word,owner_id:req.cookies.userId}, 
    function(error, results) {
        if(error) throw error;
        if(results.affectedRows){
            res.json({code: 1,message:"Succesfuly!, new bystander inserted"});
            res.end();
        }
        else{
            res.json({code: 0,message:"An unknown error occurred, and a new bystander couldn't be saved!"});
            res.end();
        }
    });
});

post_route.post("/delete_bystander",isAuth,(req,res)=>{
    const {listernerid} = req.body;
    conn.query(`DELETE FROM key_bystander WHERE key_id='${listernerid}'`,(err,resp)=>{
        if(err) throw err;
        if(resp.affectedRows){res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, listener deleted"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});

post_route.post("/delete_keyword",isAuth,(req,res)=>{
    const {keyword_id} = req.body;
    conn.query(`DELETE FROM daily_tone WHERE key_id='${keyword_id}'`,(err,resp)=>{
        if(err) throw err;
        console.log(keyword_id)
        if(resp.affectedRows){res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, listener deleted"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});

post_route.post("/new_keyword",isAuth,(req,res)=>{
    const {medianame,nkyw} = req.body;
    conn.query(`INSERT INTO daily_tone SET ?`,{key_word:nkyw,media:medianame,user_id:req.cookies.userId,date_created:new Date().toISOString().slice(0, 20)}, 
    function(error, results) {
        if(error) throw error;
        if(results.affectedRows){
            res.json({code: 1,message:"Succesfuly!, new keyword inserted"});
            res.end();
        }
        else{
            res.json({code: 0,message:"An unknown error occurred, and a new keyword couldn't be saved!"});
            res.end();
        }
    });
});

post_route.post("/new_listener",isAuth,(req,res)=>{
    const {listener_bot, author_id,nkyw,from_name} = req.body;
    conn.query(`INSERT INTO retweet_from_specific SET ?`,{user_id:req.cookies.userId,bot_id:listener_bot,from_author_id: author_id,keyword:nkyw,from_author_name:from_name,date_created:new Date().toISOString().slice(0, 20)}, 
    function(error, results) {
        if(error) throw error;
        if(results.affectedRows){
            rt_fromspecific.start_process();
            res.json({code: 1,message:"Succesfuly!, new keyword inserted"});
            res.end();
        }
        else{
            res.json({code: 0,message:"An unknown error occurred, and a new keyword couldn't be saved!"});
            res.end();
        }
    });
});

post_route.post("/delete_rt_keywords",isAuth,(req,res)=>{
    const {keyword_id} = req.body;
    conn.query(`DELETE FROM retweet_from_specific WHERE ky_id='${keyword_id}'`,(err,resp)=>{
        if(err) throw err;
        if(resp.affectedRows){rt_fromspecific.start_process(); res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, listener deleted"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});

module.exports= post_route;