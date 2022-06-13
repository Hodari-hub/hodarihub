const express = require("express");
const post_route = express.Router();
const conn=require("../modals/connection");
var bcrypt = require('bcryptjs');
const rt_fromspecific=require("./retweet_from_specific");
const bystander=require("./bystanders");

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
                
                if(error) { res.json({code: 0,message:error}); res.end(); return; }

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

post_route.post("/deletuser",isAuth,(req,res)=>{
    const {userid} = req.body;
    conn.query(`DELETE FROM base_members WHERE m_id='${userid}' AND m_type!='${userid}'`,(err,resp)=>{

        if(err) {res.json({code: 0,message:err}); res.end(); return; }

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
    const {fname, uaddress, phone1, phone2, utype, location, description, password,user_id}=req.body;
    let hashpassword = bcrypt.hashSync(password, 8);
    conn.query(`UPDATE base_members SET m_name='${fname}',m_email='${uaddress}',m_phone_number='${phone1}',m_sec_number='${phone2}',m_pass='${hashpassword}',m_type='${utype}',m_description='${description}',m_location='${location}',m_pass='${hashpassword}' WHERE m_id='${user_id}'`,(err,resp)=>{
        if(err) { res.json({code: 0,message:err}); res.end(); return; }
        if(resp.affectedRows){ res.cookie('userPass',hashpassword); res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, user deleted"}); res.end(); }
        else{res.json({code: 0,message:"Unknown error occurred, user couldn't be deleted!"}); res.end(); }
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

post_route.post("/newbystander",isAuth,(req,res)=>{
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

post_route.post("/delete_bystander",isAuth,(req,res)=>{
    const {listernerid} = req.body;
    conn.query(`DELETE FROM key_bystander WHERE key_id='${listernerid}'`,(err,resp)=>{
        if(err) {res.json({code: 0,message:err}); res.end(); return; };
        if(resp.affectedRows){res.json({code: 1,userid:req.cookies.userId,message:"Succesfuly!, listener deleted"}); res.end();}
        else{res.json({code: 0,message:"Unknown error occurred, listener couldn't be deleted!"}); res.end();}
    });
});


post_route.post("/delete_keyword",isAuth,(req,res)=>{
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

post_route.post("/new_listener",isAuth,(req,res)=>{
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
    let today=new Date().toISOString().slice(0, 20);
    conn.query(`INSERT INTO tonality SET ?`,{ u_id:req.cookies.userId, media_type:social_type, page_id:selected_page, link:link, positive:positive, negative:negative, neutral:neutral, unrelated:unrelated, total:(positive+negative+neutral+unrelated),date_created:today}, 
    function(error, results) {

        if(error) {res.json({code: 0,message:error});res.end(); return;}

        if(results.affectedRows){
            let tag=`<tr class="tr_item"><td>1</td><td>${today}</td><td>msemaji mkuu wa serikali</td><td class='positive'>${positive}</td><td class='negative'>${negative}</td><td class='neutral'>${neutral}</td><td class='unrelated'>${unrelated}</td></tr>`;
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
                                ${results[i].date_created}
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
                                ${results[i].datemade}
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

post_route.post("/get_twitts", isAuth, (req,res)=>{
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
    let {member_name,password} = req.body;

    if(member_name==""||password==""){
        res.json({code: 0,message:"Please supply value in the form field!",member_name:member_name}); 
        res.end();
    }

    conn.query(`INSERT INTO tonality_members SET ?`,
    {tonality_mem_name:member_name,tonality_mem_password:password,createdby:req.cookies.userId,date_created: new Date().toISOString().slice(0,10)},
    (err,q_res)=>{
        if(err) throw err;
        if(q_res.affectedRows){
            let mid=q_res.insertId;
            res.json({code: 1,message:"Succesfuly!",member_name:member_name,mid:mid}); 
            res.end();
        }
        else{
            res.json({code: 0,message:"Something went wrong! try agin later",member_name:member_name}); 
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

post_route.post("/reset_tone_pass",isAuth,(req,res)=>{
    const {mname,memberid,new_pass} = req.body;
    let hashpassword = bcrypt.hashSync(new_pass, 8);
    conn.query(`UPDATE tonality_members SET tonality_mem_password='${hashpassword}' WHERE tonality_mem_id='${memberid}'`,(err,q_res)=>{
        if(err) throw err;
        if(q_res.affectedRows){
            res.json({code: 1,message:"Succesfuly!",member_name:mname}); 
            res.end();
        }
        else{
            res.json({code: 0,message:"Something went wrong! try agin later",member_name:mname}); 
            res.end();
        }
    });
});

module.exports= post_route;