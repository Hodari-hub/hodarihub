const express = require("express");
const post_route = express.Router();
const conn=require("../modals/connection");
var bcrypt = require('bcryptjs');
const rt_fromspecific=require("./retweet_from_specific");
const bystander=require("./rt_automation_controller");
const influencers_tracker=require("./influencers_tracker");
const config={host:'localhost',user:'root',password:'',database:'hodarihub'};
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
//const config = {host:'localhost',user:'root',password:'#Ushindi@123',database:'hodarihub'};
var syncSql = require('sync-sql');
const needle = require('needle');
const fs=require("fs");
const axios = require("axios");
const youtube_apiUrl = "https://www.googleapis.com/youtube/v3";
const youtube_apiKey="AIzaSyDZZ6VYHGOYYnqM0E_GdipJU_qFENnW88U";
//guselya ngwandu credentials
let baretoken='AAAAAAAAAAAAAAAAAAAAAPs3UwEAAAAA4A8wV5DdD0sKMqeYYaYyJ00%2Bc3U%3D1xyvw5zev4IRhfQXX17PAh84FtJbJiRXuyDwwZPicpFkQH9WWX';


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


/////////////////////////////////////////////////////////////////////
/////////////////////PROFILE & MEMBER ISSUES ///////////////////////
///////////////////////////////////////////////////////////////////

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
                    if(error) { res.json({code: 0,message:error}); res.end(); return; }
                    if(results.affectedRows){ res.json({code: 1,message:"Succesfuly new user inserted"});  res.end();}
                    else{res.json({code: 0,message:"An unknown error occurred, and a new user could not be saved!"});res.end();}
                });
            }
        });
    });

    //edit user
    post_route.post("/edit_user",isAuth,(req,res)=>{
        const {fname, uaddress, phone1, phone2, utype, location, description, password,user_id}=req.body;
        let hashpassword = bcrypt.hashSync(password, 8);
        conn.query(`UPDATE base_members SET m_name='${fname}',m_email='${uaddress}',m_phone_number='${phone1}',m_sec_number='${phone2}',m_pass='${hashpassword}',m_type='${utype}',m_description='${description}',m_location='${location}',m_pass='${hashpassword}' WHERE m_id='${user_id}'`,(err,resp)=>{
            if(err) { res.json({code: 0,message:err}); res.end(); return; }
            if(resp.affectedRows){ res.cookie('userPass',hashpassword); res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, user deleted"}); res.end(); }
            else{res.json({code: 0,message:"Unknown error occurred, user couldn't be deleted!"}); res.end(); }
        });
    });

    //delete user
    post_route.post("/deletuser",isAuth,(req,res)=>{
        const {userid} = req.body;
        conn.query(`DELETE FROM base_members WHERE m_id='${userid}' AND m_type!='${userid}'`,(err,resp)=>{
            if(err) {res.json({code: 0,message:err}); res.end(); return; }
            if(resp.affectedRows){ res.json({code: 1,message:"Succesfuly!, user deleted"}); res.end();}
            else{ res.json({code: 0,message:"Unknown error occurred, user couldn't be deleted!"});  res.end();}
        });
    });

post_route.post("/single_user_data",isAuth,(req,res)=>{
    const {start,end,m_id,platform} = req.body;
    let numpost=0,numrt=0,impres=0,reach=0;
    if(platform=="twitter"){
        //prepare statment
        if(start!=""&&end!=""){date_test=` AND twitter_stats.date_created >= '${start}' AND twitter_stats.date_created <= '${end}'`;}
        else if(start==""&&end!=""){date_test=` AND twitter_stats.date_created >= '${start}'`;}
        else if(start!=""&&end==""){date_test=` AND twitter_stats.date_created <= '${end}'`;}
        else if(start==""&&end==""){date_test=` `;}
        //count and get the statistics
        numpost=syncSql.mysql(config,`SELECT COALESCE(SUM(stats_id),0) AS numpost FROM twitter_stats  LEFT JOIN bots ON  twitter_stats.owner_id=bots.bots_id WHERE bots.owner_id='${m_id}' AND twitter_stats.post_type='POST OR COMMENT'${date_test}`);
        if(numpost.data.rows.length){numpost=numpost.data.rows[0].numpost;}
        numrt=syncSql.mysql(config,`SELECT COALESCE(SUM(stats_id),0) AS numrt FROM twitter_stats  LEFT JOIN bots ON  twitter_stats.owner_id=bots.bots_id WHERE bots.owner_id='${m_id}' AND twitter_stats.post_type='RT'${date_test}`);
        if(numrt.data.rows.length){numrt=numrt.data.rows[0].numrt;}
        impres=syncSql.mysql(config,`SELECT COALESCE(SUM(impression),0) AS impres FROM twitter_stats  LEFT JOIN bots ON  twitter_stats.owner_id=bots.bots_id WHERE bots.owner_id='${m_id}' AND twitter_stats.post_type='POST OR COMMENT'${date_test}`);
        if(impres.data.rows.length){impres=impres.data.rows[0].impres;}
        reach=syncSql.mysql(config,`SELECT COALESCE(SUM(reach),0) AS reach FROM twitter_stats  LEFT JOIN bots ON  twitter_stats.owner_id=bots.bots_id WHERE bots.owner_id='${m_id}' AND twitter_stats.post_type='POST OR COMMENT'${date_test}`);
        if(reach.data.rows.length){reach=reach.data.rows[0].reach;}
        //send response 
        res.json({code: 1,message:"Successfully!",numpost:numpost,numrt:numrt,impres:impres,reach:reach}); 
        res.end();
    }
    else{
        //incase the platform is not available
        res.json({code: 1,message:"Successfully!",numpost:0,numrt:0,impres:0,reach:0}); 
        res.end();
    }
});
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
///////////////END OF PROFILE & USERS ISSUES///////////////////////
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX


//////////////////////////////////////////////////////////////////////////
//////////////////////////BOT AND SOCIAL MEDIA ISSUES////////////////////
////////////////////////////////////////////////////////////////////////
//add new bot to the database
post_route.post("/addnewbot",isAuth,(req,res)=>{
    const {baretoken,bots_name,bots_id,medianame,owner_id,media_address,bots_phone,password,api_key,apisecret,access_token,access_secret,description}=req.body;
    //check if user exist first
    conn.query(`SELECT * FROM bots WHERE medianame='${medianame}' AND owner_id='${owner_id}' AND bot_name='${bots_name}'`,(err,results)=>{
        if(err) throw err;
        if(!results.length){
            //if user is not exist then insert the new user to the database
            conn.query(`INSERT INTO bots SET ?`,{bots_id:bots_id,baretoken:baretoken,owner_id:owner_id,bot_name:bots_name,medianame:medianame,media_address:media_address,description:description,bot_phone:bots_phone,api_key:api_key,apisecret:apisecret,access_token:access_token,access_secret:access_secret,media_password:password,created_by:req.cookies.userId,date_created:new Date().toISOString().slice(0, 20)}, 
            function(error, results) {

                if(error) { res.json({code: 0,message:error}); res.end(); return; }

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

//delete media
post_route.post("/delete_media",isAuth,(req,res)=>{
    const {mediaid}=req.body;
    conn.query(`DELETE FROM bots WHERE bot_id='${mediaid}'`,(err,resp)=>{
        if(err) {res.json({code: 0,message:err}); res.end(); return;}
        if(resp.affectedRows){res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, media deleted"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, media couldn't be deleted!"}); res.end();}
    });
});

post_route.post("/new_email",isAuth,(req,res)=>{
    const {email_name, emailtype, owner_id, email_address, primary_address, email_phone, password}=req.body;
    conn.query(`INSERT INTO emails SET ?`,{owner_id:owner_id,f_name:email_name,mailtype:emailtype,mail_address:email_address,primary_address:primary_address,mail_phone:email_phone,password:password,created_by:req.cookies.userId,	date_created:new Date().toISOString().slice(0, 20)}, 
    function(error, results) {

        if(error) { res.json({code: 0,message:error}); res.end(); return; }

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
    const {baretoken,bot_id,bots_ac_id,bots_name,medianame,owner_id,media_address,bots_phone,password,api_key,apisecret,access_token,access_secret,description}=req.body;
    let changeOwner,admn;

    if(req.cookies.userType=="admin"){changeOwner=`owner_id='${owner_id}',`;admn=``;}
    else{changeOwner=``;admn=` AND owner_id='${req.cookies.userId}'`;}

    conn.query(`
        UPDATE bots SET ${changeOwner}bot_name='${bots_name}',medianame='${medianame}',
        media_address='${media_address}',description='${description}',bot_phone='${bots_phone}',
        api_key='${api_key}',apisecret='${apisecret}',baretoken='${baretoken}',bots_id='${bots_ac_id}',
        access_token='${access_token}',access_secret='${access_secret}',media_password='${password}'
        WHERE bot_id='${bot_id}'${admn}`,
        (err,resp)=>{
            if(err) {res.json({code: 0,message:err}); res.end(); return;}
            if(resp.affectedRows){res.json({code: 1,message:"Succesfuly!, user deleted"}); res.end();}
            else{res.json({code: 0,message:"Unknown error occurred, user couldn't be deleted!"}); res.end(); }
        });
});

post_route.post("/delete_email",isAuth,(req,res)=>{
    const {mailid} = req.body;
    conn.query(`DELETE FROM emails WHERE mail_id='${mailid}'`,(err,resp)=>{
        if(err) {res.json({code: 0,message:err}); res.end(); return; }
        if(resp.affectedRows){res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, email deleted"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, email couldn't be deleted!"}); res.end();}
    });
});

post_route.post("/edit_email",isAuth,(req,res)=>{
    const {mail_id,email_name, emailtype, owner_id, email_address, primary_address, email_phone, password}=req.body;
    let changeOwner,admn;

    if(req.cookies.userType=="admin"){changeOwner=`owner_id='${owner_id}',`;admn=``;}
    else{changeOwner=``;admn=` AND owner_id='${req.cookies.userId}'`;}

    conn.query(`UPDATE emails SET ${changeOwner}f_name='${email_name}',mailtype='${emailtype}',mail_address='${email_address}',primary_address='${primary_address}',mail_phone='${email_phone}',password='${password}' WHERE mail_id='${mail_id}'${admn}`,
        (err,resp)=>{
            if(err) {  res.json({code: 0,message:err}); res.end(); return;  }
            if(resp.affectedRows){res.json({code: 1,message:"Succesfuly!, user deleted"}); res.end();}
            else{res.json({code: 0,message:"Unknown error occurred, user couldn't be deleted!"}); res.end(); }
        });
});


////////////////////////////////////////////////////////////////////
/////////////////////////AUTOMATION ISSUES/////////////////////////
//////////////////////////////////////////////////////////////////
post_route.post("/add_twitter_new_keyword",isAuth,(req,res)=>{
    const {selected_bot,key_word}=req.body;
    conn.query(`INSERT INTO key_bystander SET ?`,{bot_id:selected_bot, keyword:key_word,owner_id:req.cookies.userId}, 
    function(error, results) {
        if(error) { res.json({code: 0,message:error}); res.end(); return; }
        if(results.affectedRows){
            bystander.start_the_process();
            res.json({code: 1,message:"Succesfuly!, new bystander inserted"});
            res.end();
        }
        else{
            res.json({code: 0,message:"An unknown error occurred, and a new bystander couldn't be saved!"});
            res.end();
        }
    });
});

post_route.post("/delete_automate_key",isAuth,(req,res)=>{
    const {listernerid} = req.body;
    conn.query(`DELETE FROM key_bystander WHERE key_id='${listernerid}'`,(err,resp)=>{
        if(err) {res.json({code: 0,message:err}); res.end(); return; };
        if(resp.affectedRows){res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, listener deleted"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});


post_route.post("/delete_tone_counter_keyword",isAuth,(req,res)=>{
    const {keyword_id} = req.body;
    conn.query(`DELETE FROM daily_tone WHERE key_id='${keyword_id}'`,(err,resp)=>{
        if(err){res.json({code: 0,message:err}); res.end(); return;};
        if(resp.affectedRows){res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, listener deleted"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});

post_route.post("/new_keyword",isAuth,(req,res)=>{
    const {medianame,nkyw} = req.body;
    conn.query(`INSERT INTO daily_tone SET ?`,{key_word:nkyw,media:medianame,user_id:req.cookies.userId,date_created:new Date().toISOString().slice(0, 20)}, 
    function(error, results) {

        if(error) {  res.json({code: 0,message:error}); res.end(); return; }

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

post_route.post("/rt_from_specific_listener",isAuth,(req,res)=>{
    const {listener_bot, author_id,nkyw,from_name} = req.body;
    conn.query(`INSERT INTO retweet_from_specific SET ?`,{user_id:req.cookies.userId,bot_id:listener_bot,from_author_id: author_id,keyword:nkyw,from_author_name:from_name,date_created:new Date().toISOString().slice(0, 20)}, 
    function(error, results) {

        if(error) { res.json({code: 0,message:error}); res.end(); return; }

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
        if(err) {res.json({code: 0,message:err}); res.end(); return;}
        if(resp.affectedRows){rt_fromspecific.start_process(); res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, listener deleted"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});

//handle the request 
post_route.post("/influencers_tracker", isAuth, async (req,res)=>{
    const {pageid,from,to} = req.body;
    let baretoken='AAAAAAAAAAAAAAAAAAAAAHg3UwEAAAAALIWXzb7cRDnaVmSzkznsTX8sWSc%3DOWsm5AEuS7X2ML9imWo7z50YsINcOg3bTDkpbUQMadtuMtRQ05';
    let check=await influencers_tracker.getInfluencersStats(baretoken,pageid,'',from,to);
    if(check){
        conn.query(`SELECT * FROM influencers_stats WHERE owner_id='${pageid}' AND date_created>='${from}' AND  date_created<='${to}'`,(er,re_q)=>{
            if(er) throw err;
            let datas="";
            if(re_q.length){

                for(let i =0; i<re_q.length; i++){
                    datas+=`<tr class='tr_data' id='tr_${re_q[i].stats_id}'> <td>${re_q[i].date_created.toISOString().slice(0, 10)}</td> <td>${re_q[i].text}</td>
                                    <td>${re_q[i].retweets}</td> <td>${re_q[i].replies}</td> <td>${re_q[i].likes}</td>
                                    <td>${re_q[i].quotes}</td>
                                </tr>`;
                }

                let tweets_num=syncSql.mysql(config,`SELECT COUNT(stats_id) AS tweets_num FROM influencers_stats  WHERE post_type='POST' AND date_created>='${from}' AND  date_created<='${to}'`).data.rows[0].tweets_num;
                let retweets_num=syncSql.mysql(config,`SELECT COUNT(stats_id) AS retweets_num FROM influencers_stats  WHERE post_type='RT' AND date_created>='${from}' AND  date_created<='${to}'`).data.rows[0].retweets_num;
                let replies_num=syncSql.mysql(config,`SELECT COUNT(stats_id) AS replies_num FROM influencers_stats  WHERE post_type='REPLY' AND date_created>='${from}' AND  date_created<='${to}'`).data.rows[0].replies_num;

                res.json({code: 1,data:datas,tweet_num:tweets_num,rt_num:retweets_num,replie_num:replies_num}); 
                res.end();
            }
            else{
                res.json({code: 0,data:`<tr id="inf_respose"><td class="text-center" colspan="5"><em>No data found yet</em></td><td></td></tr>`,tweet_num:0,rt_num:0,replie_num:0}); 
                res.end();
            }
        });
    }
});

//csv download file handling
post_route.post("/get_Influencers_Csv",isAuth,(req,res)=>{
    const {from_date,to_date,pageid} = req.body;
    let hedaz=[{id: 'date', title: 'DATE'}, {id: 'caption', title: 'CAPTION'},{id: 'type', title: 'TYPE'}, {id: 'retweet', title: 'RETWEET'},{id: 'replies', title: 'REPLIES'}, {id: 'likes', title: 'LIKES'}, {id: 'quotes', title: 'QUOTES'}];
    let dataz=[]; 
    conn.query(`SELECT * FROM influencers_stats WHERE owner_id='${pageid}' AND date_created>='${from_date}' AND  date_created<='${to_date}'`,(err,q_res)=>{
        if(err) throw err;
        if(q_res.length){
            for(let i=0; i<q_res.length; i++){
                 dataz.push(
                    {
                        date: q_res[i].date_created.toISOString().slice(0, 10),
                        caption:q_res[i].text, type:q_res[i].post_type,retweet:q_res[i].retweets,
                        replies:q_res[i].replies, likes:q_res[i].likes, quotes:q_res[i].quotes
                    }
                ); 
            }
            let dir=__dirname.split('\\');
            var timestamp = new Date().getTime();
            let fname=`influencers_stats_${timestamp}.csv`;
            let filename = `${dir[0]}/${dir[1]}/downloads/influencers_stats_${timestamp}.csv`;
            const csvWriter = createCsvWriter({path: filename,header: hedaz});
            csvWriter.writeRecords(dataz).then(() => { return true; });
            res.json({code: 1,message:"Succesfuly!, find option from the list",filename:fname});
            res.end();
        }
        else{
            res.json({code: 0,message:"Failed!, could not find option from the list"});
            res.end();
        }
    });
});

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//////////////////////END OF AUTOMATION////////////////////////////////////////////
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX


//add new platform
post_route.post("/new_platform_handler",isAuth,(req,res)=>{
    const {platform_name,platform_privilege,platform_address,platform_phone,password,description} = req.body;
    if(platform_name==""||platform_privilege==""||platform_address==""||platform_phone==""||password==""){  res.json({code: 0,message:"Please fill all the form field!"}); res.end();  return; }
    conn.query(`INSERT INTO hub_platform SET ?`,
    {platform_name:platform_name,number_used:platform_phone,email_used:platform_address,privilege:platform_privilege,password:password,description:description,created_by:req.cookies.userId,date_created:new Date().toISOString().slice(0,20)},
    (plt_err,plt_res)=>{
        if(plt_err) throw plt_err;
        if(plt_res.affectedRows){
            res.json({code: 1,message:"Succesfuly!, new platform details inserted"});
            res.end();
        }
        else{
            res.json({code: 0,message:"An unknown error occurred, and a new media couldn't be saved!"});
            res.end();
        }
    });
});

post_route.post("/edit_platform_handler",isAuth,(req,res)=>{
    const {platform_id,platform_name,platform_privilege,platform_address,platform_phone,password,description} = req.body;
    conn.query(`UPDATE hub_platform SET platform_name='${platform_name}',privilege='${platform_privilege}',email_used='${platform_address}',number_used='${platform_phone}',password='${password}',description='${description}' WHERE plat_id='${platform_id}'`,(err,resp)=>{
        if(err) throw err;
        if(err) {res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end(); return;}
        if(resp.affectedRows){res.json({code: 1,message:"Succesfuly!, platform details updated"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});

post_route.post("/delete_platform",isAuth,(req,res)=>{
    const {platform_id} = req.body;
    conn.query(`DELETE FROM hub_platform WHERE plat_id='${platform_id}'`,(err,resp)=>{
        if(err) {res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end(); return;}
        if(resp.affectedRows){res.json({code: 1,message:"Succesfuly!, data removed from the list"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});

post_route.post("/add_stats",isAuth,(req,res)=>{
    const {column,value, post_id} = req.body;

    //check if post exist and update
    conn.query(`SELECT * FROM twitter_stats WHERE post_id='${post_id}'`,(perr,p_res)=>{
        if(perr) throw perr;
        if(p_res.length){
            conn.query(`UPDATE twitter_stats SET ${column}='${value}' WHERE post_id='${post_id}'`,(err,pres)=>{
                if(err) throw err;
                if(pres.affectedRows){
                    res.json({code: 1,message:"Succesfuly!",pid:post_id}); res.end();
                }
            });
        }
        else{
            conn.query(`INSERT INTO twitter_stats SET ?`,{},()=>{});
        }
    });
});

post_route.post("/single_tweet_stats", isAuth, (req,res)=>{
    const {bot_id,date} = req.body;
    //get tweets of that days
    conn.query(`SELECT * FROM twitter_stats WHERE owner_id='${bot_id}' AND date_created='${date}' AND post_type='POST OR COMMENT'`,(err,qres)=>{
        if(err) throw err;
        if(qres.length){
            let result="";
            for(let i=0; i<qres.length; i++){
                result+=`<div id="pid_${qres[i].post_id}" class="col-8 mx-auto border py-3 my-3" style="background:rgba(255,255,255,0.1);">
                            <div>
                                <button type="button" class='btn btn-outlined secondary wipeout' data-closeid='${qres[i].post_id}'>Close</button>
                                <a class='btn btn-outlined secondary' href='https://twitter.com/x/status/${qres[i].post_id}' target="_blank">View Post</a>
                            </div>
                            <div class="col-12 text py-1">Text: ${qres[i].text} <br/> Tags: ${qres[i].key_word}</div>
                            <div class="col-12 text py-1">
                                <button class="btn btn-outline-success datainputs" data-postid="${qres[i].post_id}" data-column="impression">Impression</button>
                                <button class="btn btn-outline-success datainputs" data-postid="${qres[i].post_id}" data-column="engagement">Engagement</button>
                                <button class="btn btn-outline-success datainputs" data-postid="${qres[i].post_id}" data-column="reach">Reach</button>
                                <button class="btn btn-outline-success datainputs" data-postid="${qres[i].post_id}" data-column="expanded">Expanded</button>
                            </div>
                        </div>`;
            }

            res.json({code: 1,message:"Succesfuly!",result:result}); res.end();
        }
        else{
            res.json({code: 0,message:"No result found",result:''}); res.end();
        }
    });
});

post_route.post("/tonality_new_member",isAuth,(req,res)=>{
    let {member_name} = req.body;

    if(member_name==""){ res.json({code: 0,message:"Please supply value in the form field!"});  res.end(); }

    //check if member is already added in the database
    var checkpost = syncSql.mysql(config, `SELECT * FROM tonality_members WHERE member_id='${member_name}'`);
    if(checkpost.data.rows.length){  res.json({code: 0,message:"This user is already added in the database"});  res.end(); return;}

    //get user name from the member table and send back to the response
    var mebers = syncSql.mysql(config, `SELECT * FROM base_members WHERE m_id='${member_name}'`);
    if(!mebers.data.rows.length){ res.json({code: 0,message:"This user does not exist in the database!"});  res.end(); return;}
    let mmbr_name=mebers.data.rows[0].m_name;

    //insert new member in the database since is not exist
    conn.query(`INSERT INTO tonality_members SET ?`, {member_id:member_name,createdby:req.cookies.userId,date_created: new Date().toISOString().slice(0,10)},
    (err,q_res)=>{
        if(err) throw err;
        if(q_res.affectedRows){
            let mid=q_res.insertId;
            res.json({code: 1,message:"Succesfuly!",mid:mid,member_name:mmbr_name}); 
            res.end();
        }
        else{
            res.json({code: 0,message:"Something went wrong! try agin later"}); 
            res.end();
        }
    });
});

post_route.post("/delete_tone_member",isAuth,(req,res)=>{
    const {member_id} = req.body;
    conn.query(`DELETE FROM tonality_members WHERE tonality_mem_id='${member_id}'`,(err,resp)=>{
        if(err) {res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end(); return;}
        if(resp.affectedRows){res.json({code: 1,message:"Succesfuly!, data removed from the list"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});


//////////////////////////////////////////////////////////////////////////
/////////////////////////////TONALITY ISSUES/////////////////////////////
////////////////////////////////////////////////////////////////////////
post_route.post("/delete_tone_media",isAuth,(req,res)=>{
    const {media_id} = req.body;
    conn.query(`DELETE FROM social_media WHERE media_id='${media_id}'`,(err,resp)=>{
        if(err) {res.json({code: 0,message:err}); res.end(); return;};
        if(resp.affectedRows){res.json({code: 1,message:"Succesfuly!, page removed from the list"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});

post_route.post("/delete_msg_trend_item",isAuth,(req,res)=>{
    const {media_id} = req.body;
    conn.query(`DELETE FROM message_trend WHERE messageid='${media_id}'`,(err,resp)=>{
        if(err) {res.json({code: 0,message:err}); res.end(); return;}
        if(resp.affectedRows){res.json({code: 1,message:"Succesfuly!, data removed from the list"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});

post_route.post("/fetch_options",isAuth,(req,res)=>{
    const {selected_media} = req.body;
    conn.query(`SELECT * FROM social_media WHERE media_name='${selected_media}'`, function (error, results) {
        let opt="";

        if(error) { res.json({code: 0,message:error,opt:opt}); res.end(); return; }

        if(results.length){
            for(let i =0; i<results.length; i++){
                let page_name=results[i].page_name.toUpperCase(),media_id=results[i].media_id;
                opt+=`<option value="${media_id}">${page_name}</option>`;
            }
            res.json({code: 1,message:"Succesfuly!, find option from the list",opt:opt});
            res.end();
        }
        else{
            res.json({code: 0,message:"Failed!, could not find option from the list",opt:opt});
            res.end();
        }
    });
});

post_route.post("/add_newtone",isAuth,(req,res)=>{
    const {social_type,selected_page,link,positive,negative,neutral,unrelated} = req.body;
    let today=new Date().toISOString().slice(0, 10);
    conn.query(`INSERT INTO tonality SET ?`,{ u_id:req.cookies.userId, media_type:social_type, page_id:selected_page, link:link, positive:positive, negative:negative, neutral:neutral, unrelated:unrelated, total:(positive+negative+neutral+unrelated),date_created:today}, 
    function(error, results) {
        if(error) {res.json({code: 0,message:error});res.end(); return;}
        if(results.affectedRows){
            let tag=`<tr class="tr_item"><td>${today}</td><td>msemaji mkuu wa serikali</td><td class='positive'>${positive}</td><td class='negative'>${negative}</td><td class='neutral'>${neutral}</td><td class='unrelated'>${unrelated}</td></tr>`;
            res.json({code: 1,message:"Succesfuly!, new data inserted",tag:tag});
            res.end();
        }
        else{
            res.json({code: 0,message:"An unknown error occurred, and a new media couldn't be saved!"});
            res.end();
        }
    });
});

post_route.post("/delete_tonality_item",isAuth,(req,res)=>{
    const {itemId} = req.body;
    conn.query(`DELETE FROM tonality WHERE t_id='${itemId}'`,(err,resp)=>{
        if(err) {res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end(); return;}
        if(resp.affectedRows){res.json({code: 1,message:"Succesfuly!, data removed from the list"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});


//search data for counted note
post_route.post("/counted_tone_search",isAuth,(req,res)=>{
    const {from,to} = req.body; let search;

    if(from&&!to){search=`daily_tonality.date_created>='${from}'`;}
    else if(!from&&to){search=`daily_tonality.date_created<='${to}'`;}
    else if(from&&to){search=`daily_tonality.date_created>='${from}' && daily_tonality.date_created<='${to}'`;}
    else{search=`1 ORDER BY daily_tonality.date_created DESC LIMIT 10`;}

    conn.query(`SELECT * FROM daily_tonality LEFT JOIN daily_tone ON daily_tonality.key_id=daily_tone.key_id WHERE ${search}`,(err,results)=>{
        let tones="";

        if(err) {
            tones=`<tr id="empty_list" class='tr_item'><td colspan='6' style='text-align:center;'>${err}</td></tr>`;
            res.json({code: 0,message:"Failed!, could not find option from the list",tones:tones});
            res.end(); return;
        }

        if(results.length){
            for(let i =0; i<results.length; i++){
                tones+=` <tr class="tr_item" id='tr_item_${results[i].t_id}'>
                            <td class="date_tr">
                                <span class="action_span border">
                                    <i id="delet_btn_${results[i].t_id}" role="button" class="fa fa-trash  fa-1x delet_tr" title="Delete This Item" aria-hidden="true" data-dataid="${results[i].t_id}"></i>
                                </span> 
                                ${results[i].date_created}
                            </td>
                            <td>${results[i].key_word}</td><td class='positive'>${results[i].positive}</td><td class='negative'>${results[i].negative}</td><td class='neutral'>${results[i].neutral}</td><td class='unrelated'>${results[i].unrelated}</td>
                        </tr>`;
            }
            res.json({code: 1,message:"Succesfuly!, find option from the list",tones:tones});
            res.end();
        }
        else{
            tones=`<tr id="empty_list" class='tr_item'><td colspan='6' style='text-align:center;'>No data found</td></tr>`;
            res.json({code: 0,message:"Failed!, could not find option from the list",tones:tones});
            res.end();
        }
    });
});

//search data from viewdata page 
post_route.post("/data_view_search",isAuth,(req,res)=>{
    const {media_selected,from,to} = req.body; let social,search;

    if(media_selected==""){social=``;}else{social=` AND tonality.media_type='${media_selected}'`;}

    if(from&&!to){search=`tonality.date_created>='${from}'${social}`;}
    else if(!from&&to){search=`tonality.date_created<='${to}'${social}`;}
    else if(from&&to){search=`tonality.date_created>='${from}' && tonality.date_created<='${to}'${social}`;}
    else if(!from&&!to){ if(media_selected==""){social="1";}else{social=` tonality.media_type='${media_selected}'`;}
        search=` ${social} ORDER BY tonality.date_created DESC LIMIT 10`;
    }

    conn.query(`SELECT * FROM tonality LEFT JOIN social_media ON tonality.page_id = social_media.media_id WHERE ${search}`,(err,results)=>{
        let tones="";

        if(err) {
            tones=`<tr id="empty_list" class='tr_item'><td colspan='6' style='text-align:center;'>${err}</td></tr>`;
            res.json({code: 0,message:"Failed!, could not find option from the list",tones:tones});
            res.end(); return;
        }

        if(results.length){
            for(let i =0; i<results.length; i++){
                tones+=`<tr class="tr_item" id='tr_item_${results[i].t_id}'>
                            <td class="date_tr">
                                <span class="action_span border">
                                    <i id="delet_btn_${results[i].t_id}" role="button" class="fa fa-trash  fa-1x delet_tr" title="Delete This Item" aria-hidden="true" data-dataid="${results[i].t_id}"></i>
                                </span> 
                                ${results[i].date_created.toISOString().slice(0, 10)}
                            </td>
                            <td>${results[i].page_name}</td><td class='positive'>${results[i].positive}</td><td class='negative'>${results[i].negative}</td><td class='neutral'>${results[i].neutral}</td><td class='unrelated'>${results[i].unrelated}</td>
                        </tr>`;
            }
            res.json({code: 1,message:"Succesfuly!, find option from the list",tones:tones});
            res.end();
        }
        else{
            tones=`<tr id="empty_list" class='tr_item'><td colspan='6' style='text-align:center;'>No data found</td></tr>`;
            res.json({code: 0,message:"Failed!, could not find option from the list",tones:tones});
            res.end();
        }
    });
});

//message trend search data
post_route.post("/search_message_trend",isAuth,(req,res)=>{
    const {from,to} = req.body; let search;

    if(from&&!to){search=`datemade>='${from}'`;}
    else if(!from&&to){search=`datemade<='${to}'`;}
    else if(from&&to){search=`datemade>='${from}' && datemade<='${to}'`;}
    else{search=`1 ORDER BY datemade DESC LIMIT 10`;}

    conn.query(`SELECT * FROM message_trend WHERE ${search}`,(err,results)=>{
        let trends="";

        if(err) {
            trends=`<tr id="empty_list" class='tr_item'><td colspan='4' style='text-align:center;'>${err}</td></tr>`;
            res.json({code: 0,message:"Failed!, could not find option from the list",trends:trends});
            res.end(); return;
        }

        if(results.length){
            for(let i =0; i<results.length; i++){
                trends+=`<tr id='tr_${results[i].messageid}' class='tr_item'>
                            <td class="date_tr">
                                <span class="action_span border"><i id="delet_btn_${results[i].messageid}" role="button" class="fa fa-trash  fa-1x delete_msg" title="Delete This Item" aria-hidden="true" data-id="${results[i].messageid}"></i></span>
                                ${results[i].datemade.toISOString().slice(0, 10)}
                            </td>
                            <td class='dm'>${results[i].dm_message}</td>
                            <td class='messanger'>${results[i].messanger}</td>
                        </tr>`;
            }
            res.json({code: 1,message:"Succesfuly!, find option from the list",trends:trends});
            res.end();
        }
        else{
            trends=`<tr id="empty_list" class='tr_item'><td colspan='4' style='text-align:center;'>No data found</td></tr>`;
            res.json({code: 0,message:"Failed!, could not find option from the list",trends:trends});
            res.end();
        }
    });
});

//add new message trend data
post_route.post("/message_trend_server",isAuth,(req,res)=>{
    const {new_trend_date,new_dms,new_messanger} = req.body;
    conn.query(`INSERT INTO message_trend SET ?`,{user_id:req.cookies.userId,dm_message:new_dms,messanger: new_messanger,datemade:new_trend_date}, 
    function(error, results) {

        if(error) {
            tag=`<tr id="empty_list"><td colspan='2' style='text-align:center;'>${error}</td></tr>`;
            res.json({code: 0,message:"An unknown error occurred, and a new media couldn't be saved!",tag:tag});
            res.end(); return;
        }

        if(results.affectedRows){
            let tags=`<tr id='tr_${results.insertId}'>
                            <td class="date_tr">
                                <span class="action_span border"><i id="delet_btn_${results.insertId}" role="button" class="fa fa-trash  fa-1x delete_msg" title="Delete This Item" aria-hidden="true" data-id="${results.insertId}"></i></span>
                                ${new_trend_date}
                            </td>
                            <td>${new_dms}</td><td>${new_messanger}</td>
                        </tr>`;
            res.json({code: 1,message:"Succesfuly!, new data inserted",tag:tags});
            res.end();
        }
        else{
            tag=`<tr id="empty_list"><td colspan='2' style='text-align:center;'>No data found</td></tr>`;
            res.json({code: 0,message:"An unknown error occurred, and a new media couldn't be saved!",tag:tag});
            res.end();
        }
    });
});
post_route.post("/social_media_handler",isAuth,(req,res)=>{
    const {social_type,new_social_name} = req.body;
    if(req.cookies.userType!="admin" && req.cookies.userType!="operator"){res.json({code: 0,message:"You need admin/operator privilege to perform this action"}); res.end(); return;}
    conn.query(`INSERT INTO social_media SET ?`,{user_id:req.cookies.userId,page_name:new_social_name,media_name: social_type,date_created:new Date().toISOString().slice(0, 20)}, 
    function(error, results) {

        if(error) {res.json({code: 0,message:error}); res.end(); return;}

        if(results.affectedRows){
            let tag=`<tr id='tr_${results.insertId}'>
                        <td class='date_tr'>
                            <span class="action_span"><i id="delet_btn_${results.insertId}" role="button" class="fa fa-trash  fa-1x delete_media" title="Delete This Item" data-name='${new_social_name.toUpperCase()}' data-id='${results.insertId}'></i></span> 
                            ${social_type.toUpperCase()}
                        </td>
                        <td>${new_social_name.toUpperCase()}</td>
                    </tr>`;
            res.json({code: 1,message:"Succesfuly!, new media inserted",tag:tag});
            res.end();
        }
        else{
            res.json({code: 0,message:"An unknown error occurred, and a new media couldn't be saved!"});
            res.end();
        }
    });
});

post_route.post("/tonality_twitter_counter",isAuth,(req,res)=>{
    const {postid,loadmore,page_name,postcaption,mem_id} = req.body;
    let next_token="",item_id="";

    //check if content id is alread counted
    let post_inserted=syncSql.mysql(config,`SELECT * FROM twitter_temp_tone  WHERE post_id='${postid}'`);
    let isrecoded=post_inserted.data.rows.length;

    //next token
    if(loadmore!=""){next_token=`&pagination_token=${loadmore}`}

    if(!isrecoded){
        //insert into the database if is not yet inserted
        conn.query(`INSERT INTO twitter_temp_tone SET ?`,{
            tonality_mem_id:mem_id,media_name:"twitter",page_name:page_name,
            caption:postcaption,post_id:postid,positive:0,negative:0,
            neutral:0,unrelated:0,date_created:new Date().toISOString().slice(0,10)
        },(err,q_res)=>{
            if(err) throw err;
            if(q_res.affectedRows){
                item_id=q_res.insertId;
                getCovo(postid,item_id);
            }
            else{
                res.json({code: 0,message:"Something went wrong! try agin later"}); 
                res.end();
            }
        });
    }
    else{
        getCovo(postid,post_inserted.data.rows[0].temp_tone_id);
    }
    

    //get conversation
    async function getCovo(postid,item_id){
        const url=`https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${postid}&max_results=50&expansions=author_id,referenced_tweets.id,referenced_tweets.id.author_id,entities.mentions.username,attachments.media_keys&tweet.fields=attachments,author_id,id,text,withheld,entities,public_metrics&place.fields=geo&media.fields=preview_image_url,type,url&user.fields=profile_image_url${next_token}`; 
        const response = await needle('get', url, { headers: {Authorization: `Bearer ${baretoken}`,},});

        if("data" in response.body){
            if(response.body.data.length){ res.json({code: 1,message:"Successfully!",item_id:item_id,result:response.body}); res.end();}
            else{ res.json({code: 0,message:"Could not find any comment from this request!"});  res.end(); }
        }
        else{
            res.json({code: 0,message:"An error occured while try to make request to this post!"}); 
            res.end();
        }
    } 
});

post_route.post("/tonality_count_twitter",isAuth,(req,res)=>{
    const {count_type,post_id,row_id,mem_id}=req.body;

    //check if content is already saved in the database
    let post_inserted=syncSql.mysql(config,`SELECT * FROM twitter_temp_tone  WHERE post_id='${post_id}' AND temp_tone_id='${row_id}' AND tonality_mem_id='${mem_id}'`).data.rows.length;
    if(!post_inserted){
        res.json({code: 0,message:"Sorry! this comment is already counted"}); 
        res.end(); return;
    }

    //then update table .data.rows.length
    let update_table=syncSql.mysql(config,`UPDATE twitter_temp_tone SET ${count_type}=${count_type}+1  WHERE post_id='${post_id}' AND temp_tone_id='${row_id}' AND tonality_mem_id='${mem_id}'`);
    if(!update_table.data.rows.affectedRows){
        res.json({code: 0,message:"Something went wrong, please try agin later!"}); 
        res.end(); return;
    }

    res.json({code: 1,message:"Successfuly"}); 
    res.end(); return;
});

//search pending data from viewdata page 
post_route.post("/pending_data_view_search",isAuth,(req,res)=>{
    const {socialname,from,to} = req.body; let social,search;

    if(socialname==""){social=``;}else{social=` AND media_name='${socialname}'`;}

    if(from&&!to){search=`date_created>='${from}'${social}`;}
    else if(!from&&to){search=`date_created<='${to}'${social}`;}
    else if(from&&to){search=`date_created>='${from}' && date_created<='${to}'${social}`;}
    else if(!from&&!to){ if(socialname==""){social="1";}else{social=` media_name='${socialname}'`;} search=` ${social} ORDER BY date_created DESC LIMIT 10`; }

    conn.query(`SELECT * FROM twitter_temp_tone WHERE ${search}`,(err,results)=>{
        let tones="";

        if(err) {
            tones=`<tr id="empty_list" class='tr_item'><td colspan='6' style='text-align:center;'>${err}</td></tr>`;
            res.json({code: 0,message:"Failed!, could not find option from the list",tones:tones});
            res.end(); return;
        }

        if(results.length){
            for(let i =0; i<results.length; i++){
                tones+=`<tr class="tr_item" id='tr_item_${results[i].tonality_mem_id}' title='${results[i].caption}'>
                            <td class="date_tr">
                                <span class="action_span border">
                                    <i id="delet_btn_${results[i].tonality_mem_id}" role="button" class="fa fa-trash  fa-1x delet_tr" title="Delete This Item" aria-hidden="true" data-dataid="${results[i].tonality_mem_id}"></i>
                                </span> 
                                ${results[i].date_created.toISOString().slice(0,10)}
                            </td>
                            <td>${results[i].page_name} / ${results[i].caption}</td><td class='positive'>${results[i].positive}</td><td class='negative'>${results[i].negative}</td><td class='neutral'>${results[i].neutral}</td><td class='unrelated'>${results[i].unrelated}</td>
                        </tr>`;
            }
            res.json({code: 1,message:"Succesfuly!, find option from the list",tones:tones});
            res.end();
        }
        else{
            tones=`<tr id="empty_list" class='tr_item'><td colspan='6' style='text-align:center;'>No data found</td></tr>`;
            res.json({code: 0,message:"Failed!, could not find option from the list",tones:tones});
            res.end();
        }
    });
});

//get csv file
post_route.post("/getCsv",isAuth,(req,res)=>{
    const {from_date,to_date,socialname} = req.body;
    let hedaz=[{id: 'pagename', title: 'PAGE NAME'}, {id: 'media', title: 'MEDIA NAME'}, {id: 'caption', title: 'CAPTION'},{id: 'positive', title: 'POSITIVE'}, {id: 'negative', title: 'NEGATIVE'}, {id: 'neutral', title: 'NEUTRAL'},{id: 'unrelated', title: 'UNRELATED'}];
    let dataz=[];
    if(socialname==""){social=``;}else{social=` AND media_name='${socialname}'`;}
    if(from_date&&!to_date){search=`date_created>='${from_date}'${social}`;}
    else if(!from_date&&to_date){search=`date_created<='${to_date}'${social}`;}
    else if(from_date&&to_date){search=`date_created>='${from_date}' && date_created<='${to_date}'${social}`;}
    else if(!from_date&&!to_date){ if(socialname==""){social="1";}else{social=` media_name='${socialname}'`;} search=` ${social} ORDER BY date_created DESC LIMIT 10`; }
    conn.query(`SELECT * FROM twitter_temp_tone WHERE ${search}`,(err,q_res)=>{
        if(err) throw err;
        if(q_res.length){
            for(let i=0; i<q_res.length; i++){ dataz.push({pagename: q_res[i].page_name, media:q_res[i].media_name,caption:q_res[i].caption, positive:q_res[i].positive, negative:q_res[i].negative, neutral:q_res[i].neutral,unrelated:q_res[i].unrelated}); }
            let dir=__dirname.split('\\');
            var timestamp = new Date().getTime();
            let fname=`pending_tone_${timestamp}.csv`;
            let filename = `${dir[0]}/${dir[1]}/downloads/pending_tone_${timestamp}.csv`;
            const csvWriter = createCsvWriter({path: filename,header: hedaz});
            csvWriter.writeRecords(dataz).then(() => { return true; });
            res.json({code: 1,message:"Succesfuly!, find option from the list",filename:fname});
            res.end();
        }
        else{
            res.json({code: 0,message:"Failed!, could not find option from the list"});
            res.end();
        }
    });
});

post_route.post("/delete_downloads",isAuth,(req,res)=>{
    const {filename} = req.body;
    let dir=__dirname.split('\\');
    try {
        fs.unlinkSync(`${dir[0]}/${dir[1]}/downloads/${filename}`);
        res.json({code: 1,message:"Succesfuly!, find option from the list"});
        res.end();
    } 
    catch(err) {
        res.json({code: 0,message:"Failed!, could not find option from the list"});
        res.end();
    }
});

post_route.post('/youtube_search',isAuth,(req,res)=>{
    const {search_key,from_date,to_date,mem_id,loadmore} = req.body;

    let next_token="",item_id="";
    let today=new Date().toISOString().slice(0, 10);

    //check if content id is alread counted
    let post_inserted=syncSql.mysql(config,`SELECT * FROM twitter_temp_tone  WHERE caption='${search_key}' AND tonality_mem_id='${mem_id}' AND date_created='${today}'`);
    let isrecoded=post_inserted.data.rows.length;

    //next token
    if(loadmore!=""){next_token=`&pageToken=${loadmore}`}
    console.log('New token is: ',loadmore);

    if(!isrecoded){
        //insert into the database if is not yet inserted
        conn.query(`INSERT INTO twitter_temp_tone SET ?`,{
            tonality_mem_id:mem_id,media_name:"ytsearch",page_name:"Youtube Search Scrapper",
            caption:search_key,positive:0,negative:0,neutral:0,unrelated:0,
            date_created:new Date().toISOString().slice(0,10)
        }, (err,q_res)=>{
            if(err) throw err;
            if(q_res.affectedRows){
                item_id=q_res.insertId;
                getResult(search_key,next_token,item_id,from_date,to_date);
            }
            else{
                res.json({code: 0,message:"Failed!, could not find option from the list"});
                res.end();
            }
        });
    }
    else{
        getResult(search_key,next_token,item_id,from_date,to_date);
    }
    
    //get conversation
    async function getResult(search_key,next_token,item_id,from_date,to_date){
        let frm_date="",t_date="";

        if(from_date!=""){frm_date=`&publishedAfter=${from_date}T00:00:00Z`;}
        if(to_date!=""){t_date=`&publishedBefore=${to_date}T00:00:00Z`;}

        try {
            const url = `${youtube_apiUrl}/search?key=${youtube_apiKey}&type=any&part=snippet&q=${search_key}&maxResults=25${frm_date}${t_date}${next_token}`;
            const response = await axios.get(url);
            res.json({code: 1,message:"Successfully!",result:response.data,item_id:item_id}); 
            res.end();
        } 
        catch (err) {
            res.json({code: 0,message:"Failed!, could not find option from the list"});
            res.end();
        }
    }
});

post_route.post("/tonality_count_youtube", isAuth, (req,res)=>{
    const {count_type,mem_id,search_key} = req.body;

    //check if content id is alread counted
    let post_inserted=syncSql.mysql(config,`SELECT * FROM twitter_temp_tone  WHERE media_name='youtube' AND caption='${search_key}' AND tonality_mem_id='${mem_id}'`);
    let isrecoded=post_inserted.data.rows.length;
    if(isrecoded){
        //update the table and send back response
        let update_table=syncSql.mysql(config,`UPDATE twitter_temp_tone SET ${count_type}=${count_type}+1  WHERE media_name='youtube' AND caption='${search_key}' AND tonality_mem_id='${mem_id}'`);
        if(!update_table.data.rows.affectedRows){
            res.json({code: 0,message:"Something went wrong, please try agin later!"}); 
            res.end();
        }
        else{
            res.json({code: 1,message:"Successfuly"}); 
            res.end();
        }
    }
    else{
        res.json({code: 0,message:"Failed!, could not find option from the list"});
        res.end();
    }
});

post_route.post('/youtube_comment_counter',isAuth,(req,res)=>{
    const {video_title,video_id,mem_id,loadmore,page_name} = req.body;
    console.log("The value should be here: ",loadmore);

    let next_token="",item_id="";

    //check if content id is alread counted
    let post_inserted=syncSql.mysql(config,`SELECT * FROM twitter_temp_tone  WHERE post_id='${video_id}' AND tonality_mem_id='${mem_id}'`);
    let isrecoded=post_inserted.data.rows.length;

    //next token
    if(loadmore!=""){next_token=`&pageToken=${loadmore}`;}

    if(!isrecoded){
        //insert into the database if is not yet inserted
        conn.query(`INSERT INTO twitter_temp_tone SET ?`,{
            tonality_mem_id:mem_id,media_name:"youtube",page_name:page_name,
            caption:video_title,post_id:video_id,positive:0,negative:0,neutral:0,unrelated:0,
            date_created:new Date().toISOString().slice(0,10)
        }, (err,q_res)=>{
            if(err) throw err;
            if(q_res.affectedRows){
                //item id mostly used on updating the tonality count rows so in the case of comment api we have an option to use video id
                item_id=q_res.insertId;
                getResult(video_id);
            }
            else{
                res.json({code: 0,message:"Failed!, could not find option from the list"});
                res.end();
            }
        });
    }
    else{
        getResult(video_id);
    }
    
    //get conversation
    async function getResult(video_id){
        try{
            const url = `${youtube_apiUrl}/commentThreads?part=snippet,replies&maxResults=50&textFormat=html&videoId=${video_id}&key=${youtube_apiKey}${next_token}`;
            const response = await axios.get(url);
            console.log(response.data);
            res.json({code: 1,message:"Successfully!",result:response.data,item_id:item_id}); 
            res.end();
        } 
        catch(err){
            res.json({code: 0,message:"Failed!, could not find option from the list"});
            res.end();
        }
    }
});

post_route.post("/tonality_count_youtube_comment", isAuth, (req,res)=>{
    const {count_type,mem_id,video_id} = req.body;

    //check if content id is alread counted
    let post_inserted=syncSql.mysql(config,`SELECT * FROM twitter_temp_tone  WHERE media_name='youtube' AND post_id='${video_id}' AND tonality_mem_id='${mem_id}'`);
    let isrecoded=post_inserted.data.rows.length;
    if(isrecoded){
        //update the table and send back response
        let update_table=syncSql.mysql(config,`UPDATE twitter_temp_tone SET ${count_type}=${count_type}+1  WHERE media_name='youtube' AND post_id='${video_id}' AND tonality_mem_id='${mem_id}'`);
        if(!update_table.data.rows.affectedRows){
            res.json({code: 0,message:"Something went wrong, please try agin later!"}); 
            res.end();
        }
        else{
            res.json({code: 1,message:"Successfuly"}); 
            res.end();
        }
    }
    else{
        res.json({code: 0,message:"Failed!, could not find option from the list"});
        res.end();
    }
});
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
///////////////////////END OF TONALITY ISSUES//////////////////////
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

module.exports= post_route;