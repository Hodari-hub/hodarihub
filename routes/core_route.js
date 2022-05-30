const express = require("express");
const route = express.Router();
const conn = require("../modals/connection");

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

//login check
const isLogedIn=(req,res,next)=>{
    if(typeof req.cookies !== 'undefined'){
        //if user is already loged in then redirect them to the dashboard page
        if(req.cookies.userId){res.redirect("/dashboard");}
        //if not then let them access the login page
        else{next();}
    }
    else{res.render("/",{title:"Log In"});}
}

//handle user when comes to the home page
route.get("/",isLogedIn,(req,res)=>{res.render("index",{title:"Log In"});});

//handle dashboard accessor
route.get("/dashboard",isAuth,(req,res)=>{
    conn.query(`SELECT * FROM base_members WHERE m_email='${req.cookies.userEmail}' AND m_pass='${req.cookies.userPass}'`, 
        function (error, results) {
            if(error) throw error
            
            if(results.length){
                let u_name=results[0].m_name;
                let u_loc=results[0].m_location;
                conn.query('SELECT * FROM base_members ORDER BY m_name',(err,rs)=>{
                    if(err) throw err; let users="";
                    if(rs.length){
                        for(let i =0; i<rs.length; i++){
                            users+=`<div class="col-md-3">
                                        <a href='/profile/${rs[i].m_id}'>
                                            <div class="card card-widget widget-user shadow">
                                                <div class="widget-user-header bg-info">
                                                    <h3 class="widget-user-username">${rs[i].m_name}</h3>
                                                    <h5 class="widget-user-desc">${rs[i].m_type.toUpperCase()}</h5>
                                                </div>
                                                <div class="widget-user-image">
                                                    <img class="img-circle elevation-2" src="${rs[i].m_pic}" alt="${rs[i].m_name} profile picture">
                                                </div>
                                                <div class="card-footer">
                                                    <div class="row">
                                                        <div class="col-sm-6 border-right">
                                                            <div class="description-block">
                                                                <h5 class="description-header">0</h5>
                                                                <span class="description-text">POST</span>
                                                            </div>
                                                        </div>
                                                        <div class="col-sm-6">
                                                            <div class="description-block">
                                                                <h5 class="description-header">0</h5>
                                                                <span class="description-text">RETWEET</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>`;
                        }
                        res.render("dashboard",{pageTitle:"DASHBOARD",user_name:u_name,member_list:[users]});
                    }
                    else{ res.render("dashboard",{pageTitle:"DASHBOARD",user_name:u_name,member_list:[users]}); }
                });
            }
            else{
                res.render("logout",{title:"Log Out"});
            }
    });
});

//view user profile
route.get("/profile/:id",isAuth,(req,res)=>{
    conn.query(`SELECT * FROM base_members WHERE m_id='${req.params.id}'`, 
        function (error, results) {
            if(error) { res.redirect("/"); return; }
            if(results.length){
                let m_id=results[0].m_id,m_pic=results[0].m_pic,m_name=results[0].m_name.toUpperCase();
                let m_location=results[0].m_location,m_description=results[0].m_description;
                let m_phone_number=results[0].m_phone_number,m_sec_number=results[0].m_sec_number;
                let m_email=results[0].m_email,m_type=results[0].m_type.toUpperCase();
                let showbtn=0,isAdmin=0; if(req.cookies.userId==m_id){ showbtn=1;}else{ showbtn=0;}
                if(req.cookies.userType=="admin"){isAdmin=1;}else{isAdmin=0;}

                //get all bots owned by this user
                conn.query(`SELECT * FROM bots WHERE owner_id='${m_id}' ORDER BY bot_name`,(err,rs)=>{
                    if(err) throw err; let bots="";
                    if(rs.length){
                        for(let i =0; i<rs.length; i++){bots+=`<tr><td>${i+1}</td><td>${rs[i].bot_name}</td><td>${rs[i].media_password}</td><td>${rs[i].media_address}</td><td>${rs[i].bot_phone}</td></tr>`;}
                        res.render("profile", {pageTitle:"PROFILE",user_name:req.cookies.userName,m_name:m_name,user_location:m_location,m_pic:m_pic,m_description:m_description,m_phone_number:m_phone_number,m_sec_number:m_sec_number,m_email:m_email,m_type:m_type,bots:bots,userid:m_id,showbtn:showbtn,isAdmin:isAdmin});
                    }
                    else{res.render("profile", {pageTitle:"PROFILE",user_name:req.cookies.userName,m_name:m_name,user_location:m_location,m_pic:m_pic,m_description:m_description,m_phone_number:m_phone_number,m_sec_number:m_sec_number,m_email:m_email,m_type:m_type,bots:bots,userid:m_id,showbtn:showbtn,isAdmin:isAdmin});}
                });
            }
            else{ res.render("dashboard", {pageTitle:"DASHBOARD",user_name:req.cookies.userName}); }
    });
});

//add new member
route.get("/member",isAuth,(req,res)=>{res.render("forms",{pageTitle:"ADD NEW MEMBER", user_name:req.cookies.userName, form:"newuserform" });});

//add new media
route.get("/media",isAuth,(req,res)=>{
    conn.query('SELECT * FROM base_members ORDER BY m_name',(err,rs)=>{
        if(err) throw err; let usersoption="";
        if(rs.length){
            for(let i =0; i<rs.length; i++){
                let isSelected;
                if(req.cookies.userId==rs[i].m_id){ isSelected="selected";}else{ isSelected="";}
                usersoption+=`<option value="${rs[i].m_id}" ${isSelected}>${rs[i].m_name.toUpperCase()}</option>`;
            }
            res.render("forms",{pageTitle:"ADD NEW MEDIA",user_name:req.cookies.userName, form:"newbot",usersoption:[usersoption]});
        }
        else{res.render("forms",{pageTitle:"ADD NEW MEDIA",user_name:req.cookies.userName, form:"newbot",usersoption:["<option value=''>No user found</option>"]});}
    })
});

//view media list
route.get("/socialmedia",isAuth,(req,res)=>{
    let checker;
    if(req.cookies.userType=="admin"){checker=`1`;}else{checker=` bots.owner_id='${req.cookies.userId}' `;}
    conn.query(`SELECT * FROM bots LEFT JOIN base_members ON bots.owner_id=base_members.m_id WHERE ${checker} ORDER BY bots.bot_name`,(err,rs)=>{
        if(err) throw err; let bots="";
        if(rs.length){
            for(let i =0; i<rs.length; i++){
                bots+=`<tr id='tr_${rs[i].bot_id}'>
                        <td>${i+1}</td> <td>${rs[i].medianame}</td>
                        <td>${rs[i].bot_name}</td> <td>${rs[i].media_password}</td>
                        <td>${rs[i].media_address}</td> <td>${rs[i].bot_phone}</td>
                        <td>${rs[i].m_name}</td>
                        <td>
                            <span class="badge badge-danger deletesocial" role='button' data-id='${rs[i].bot_id}' data-myname='${rs[i].bot_name}'>Delete</span>
                            <a href='/edit_bot/${rs[i].bot_id}'><span class="badge badge-success editsocial" role='button'>Edit</span></a>
                        </td>
                    </tr>`;
            }
            res.render("media_list",{pageTitle:"SOCIAL MEDIAS",user_name:req.cookies.userName,medianame:"ALL",bots:[bots]});
        }
        else{
            bots=`<tr><td colspan='9' style='text-align:center;'>No details found</td></tr>`;
            res.render("media_list",{pageTitle:"SOCIAL MEDIAS",user_name:req.cookies.userName,medianame:"ALL",bots:[bots]});
        }
    });
});

//handle social media with variable front of it
route.get("/socialmedia/:medianame",isAuth,(req,res)=>{
    let checker;
    if(req.cookies.userType=="admin"){checker=`1 AND bots.medianame='${req.params.medianame}'`;}else{checker=` bots.owner_id='${req.cookies.userId}' AND bots.medianame='${req.params.medianame}' `;}
    conn.query(`SELECT * FROM bots LEFT JOIN base_members ON bots.owner_id=base_members.m_id WHERE ${checker} ORDER BY bots.bot_name`,(err,rs)=>{
        if(err) throw err; let bots="";
        if(rs.length){
            for(let i =0; i<rs.length; i++){
                bots+=`<tr id='tr_${rs[i].bot_id}'>
                        <td>${i+1}</td><td>${rs[i].medianame}</td><td>${rs[i].bot_name}</td>
                        <td>${rs[i].media_password}</td><td>${rs[i].media_address}</td>
                        <td>${rs[i].bot_phone}</td><td>${rs[i].m_name}</td>
                        <td>
                            <span class="badge badge-danger deletesocial" role='button' data-id='${rs[i].bot_id}' data-myname='${rs[i].bot_name}'>Delete</span>
                            <a href='/edit_bot/${rs[i].bot_id}'><span class="badge badge-success editsocial" role='button'>Edit</span></a>
                        </td>
                    </tr>`;
            }
            res.render("media_list",{pageTitle:"SOCIAL MEDIAS",user_name:req.cookies.userName,medianame:req.params.medianame.toLocaleUpperCase(),bots:[bots]});
        }
        else{
            bots=`<tr><td colspan='9' style='text-align:center;'>No details found</td></tr>`;
            res.render("media_list",{pageTitle:"SOCIAL MEDIAS",user_name:req.cookies.userName,medianame:req.params.medianame.toLocaleUpperCase(),bots:[bots]});
        }
    });
});

//Edit user details 
route.get("/edit_user/:userid",isAuth,(req,res)=>{
    conn.query(`SELECT * FROM base_members WHERE m_id='${req.params.userid}'`, 
        function (error, results) {
            if(error) throw error
            if(results.length){
                let m_name=results[0].m_name,m_location=results[0].m_location,m_description=results[0].m_description;
                let m_phone_number=results[0].m_phone_number,m_sec_number=results[0].m_sec_number;
                let m_email=results[0].m_email,m_type=results[0].m_type,media_password=results[0].media_password;
                res.render("forms",{pageTitle:"EDIT USER DETAILS",user_name:req.cookies.userName,
                    form:"edituser", userid:req.params.userid,m_name:m_name,m_location:m_location,m_description:m_description,
                    m_phone_number:m_phone_number,m_sec_number:m_sec_number,m_email:m_email,m_type:m_type,media_password:media_password});
            }
            else{ res.render("dashboard", {pageTitle:"DASHBOARD",user_name:req.cookies.userName}); }
    });
});

//add new member
route.get("/member",isAuth,(req,res)=>{res.render("forms",{pageTitle:"ADD NEW MEMBER", user_name:req.cookies.userName, form:"newuserform" });});

//add new emial in the db
route.get("/email",isAuth,(req,res)=>{
    conn.query('SELECT * FROM base_members ORDER BY m_name',(err,rs)=>{
        if(err) throw err; let usersoption="";
        if(rs.length){
            for(let i =0; i<rs.length; i++){
                let isSelected;
                if(req.cookies.userId==rs[i].m_id){ isSelected="selected";}else{ isSelected="";}
                usersoption+=`<option value="${rs[i].m_id}" ${isSelected}>${rs[i].m_name.toUpperCase()}</option>`;
            }
            res.render("forms",{pageTitle:"ADD NEW EMAIL",user_name:req.cookies.userName, form:"newemail",usersoption:[usersoption]});
        }
        else{res.render("forms",{pageTitle:"ADD NEW EMAIL",user_name:req.cookies.userName, form:"newemail",usersoption:["<option value=''>No user found</option>"]});}
    })
});

//view email list
route.get("/email_list",isAuth,(req,res)=>{
    let checker;
    if(req.cookies.userType=="admin"){checker=`1`;}else{checker=` emails.owner_id='${req.cookies.userId}' `;}
    conn.query(`SELECT * FROM emails LEFT JOIN base_members ON emails.owner_id=base_members.m_id WHERE ${checker} ORDER BY emails.mail_address`,(err,rs)=>{
        if(err) throw err; let emails="";
        if(rs.length){
            for(let i =0; i<rs.length; i++){
                emails+=`<tr id='tr_${rs[i].mail_id}'><td>${i+1}</td><td>${rs[i].f_name}</td><td>${rs[i].mailtype}</td>
                            <td>${rs[i].mail_address}</td><td>${rs[i].primary_address}</td>
                            <td>${rs[i].mail_phone}</td><td>${rs[i].password}</td><td>${rs[i].m_name}</td>
                            <td>
                                <span class="badge badge-danger delete_emails" role='button' data-mname='${rs[i].mail_address}' data-id='${rs[i].mail_id}'>Delete</span>
                                <a href='mail_edit/${rs[i].mail_id}'><span class="badge badge-success editemail">Edit</span></a>
                            </td>
                        </tr>`;
            }
            res.render("email_list",{pageTitle:"EMAILS",user_name:req.cookies.userName,medianame:"ALL",emails:[emails]});
        }
        else{
            emails=`<tr><td colspan='9' style='text-align:center;'>No details found</td></tr>`;
            res.render("email_list",{pageTitle:"EMAILS",user_name:req.cookies.userName,medianame:"ALL",emails:[emails]});
        }
    });
});

//Edit user details 
route.get("/edit_bot/:botid",isAuth,(req,res)=>{
    conn.query(`SELECT * FROM bots WHERE bot_id='${req.params.botid}'`, 
        function (error, results) {
            if(error) throw error
            if(results.length){
                let bot_name=results[0].bot_name,medianame=results[0].medianame,
                media_address=results[0].media_address, description=results[0].description,
                bot_phone=results[0].bot_phone, api_key=results[0].api_key,
                apisecret=results[0].apisecret, access_token=results[0].access_token,
                access_secret=results[0].access_secret, media_password=results[0].media_password,
                owner_id=results[0].owner_id,baretoken=results[0].baretoken;


                conn.query('SELECT * FROM base_members ORDER BY m_name',(err,rs)=>{
                    if(err) throw err; let member_list="";
                    if(rs.length){
                        for(let i =0; i<rs.length; i++){
                            let isSelected;
                            if(owner_id==rs[i].m_id){ isSelected="selected";}else{ isSelected="";}
                            member_list+=`<option value="${rs[i].m_id}" ${isSelected}>${rs[i].m_name.toUpperCase()}</option>`;
                        }

                        res.render("forms",{pageTitle:"EDIT BOT DETAILS",
                            user_name:req.cookies.userName,form:"editbot", botid:req.params.botid,
                            bot_name:bot_name,medianame:medianame,media_address:media_address,
                            description:description,bot_phone:bot_phone,api_key:api_key,
                            apisecret:apisecret,access_token:access_token,access_secret:access_secret,
                            media_password:media_password,baretoken:baretoken,memberlist:[member_list]
                        });
                    }
                    else{ res.render("dashboard", {pageTitle:"DASHBOARD",user_name:req.cookies.userName});}
                });
            }
            else{ res.render("dashboard", {pageTitle:"DASHBOARD",user_name:req.cookies.userName}); }
    });
});

route.get("/mail_edit/:mailid", isAuth, (req,res)=>{
    let mailid=req.params.mailid;
    conn.query(`SELECT * FROM emails WHERE mail_id='${mailid}'`,(err,resp)=>{
        if(err) throw err;
        if(resp.length){
            let owner_id=resp[0].owner_id,f_name=resp[0].f_name,mailtype=resp[0].mailtype,
            mail_address=resp[0].mail_address,primary_address=resp[0].primary_address,
            mail_phone=resp[0].mail_phone,password=resp[0].password;

            conn.query('SELECT * FROM base_members ORDER BY m_name',(er,rs)=>{
                if(er) throw er; let member_list="";
                if(rs.length){
                    for(let i =0; i<rs.length; i++){
                        let isSelected;
                        if(owner_id==rs[i].m_id){ isSelected="selected";}else{ isSelected="";}
                        member_list+=`<option value="${rs[i].m_id}" ${isSelected}>${rs[i].m_name.toUpperCase()}</option>`;
                    }

                    res.render("forms",{pageTitle:"EDIT EMAIL DETAILS",
                        user_name:req.cookies.userName,form:"editemail", mail_id:req.params.mailid,owner_id:owner_id,
                        f_name:f_name,mailtype:mailtype,mail_address:mail_address,primary_address:primary_address,
                        memberlist:[member_list],mail_phone:mail_phone,password:password
                    });
                }
                else{ res.render("dashboard", {pageTitle:"DASHBOARD",user_name:req.cookies.userName});}
            });
        }
        else{ res.render("dashboard", {pageTitle:"DASHBOARD",user_name:req.cookies.userName});}
    });
});

route.get("/bystanders",isAuth,(req,res)=>{
    if(req.cookies.userType=="admin"){checker=`1`;}else{checker=`key_bystander.owner_id='${req.cookies.userId}' `;}
    conn.query(`SELECT * FROM key_bystander LEFT JOIN bots ON key_bystander.bot_id=bots.bot_id JOIN base_members ON key_bystander.owner_id=base_members.m_id WHERE ${checker}`, 
        function (error, results) {
            let bystanders="";
            if(error) {res.render("key_bystander", {pageTitle:"BYSTANDERS",user_name:req.cookies.userName,bystanders:[bystanders]});}; 
            if(results.length){
                for(let i =0; i<results.length; i++){
                    bystanders+=`<tr id='tr_${results[i].key_id}'> <td>${i+1}</td><td>${results[i].bot_name}</td><td>${results[i].keyword}</td><td>${results[i].m_name}</td>
                                    <td><span class="badge badge-danger delete_bystander" role='button' data-id='${results[i].key_id}'>Delete</span></td>
                                </tr>`;
                }
                res.render("key_bystander", {pageTitle:"BYSTANDERS",user_name:req.cookies.userName,bystanders:[bystanders]});
            }
            else{
                res.render("key_bystander", {pageTitle:"BYSTANDERS",user_name:req.cookies.userName,bystanders:[bystanders]});
            }
        });
});

route.get("/bystander",isAuth,(req,res)=>{
    if(req.cookies.userType=="admin"){checker=`1`;}else{checker=`owner_id='${req.cookies.userId}' `;}
    conn.query(`SELECT * FROM bots WHERE ${checker}`, 
        function (error, results) {
            let bots="";
            if(error) { res.render("forms",{pageTitle:"ADD NEW BYSTANDER",user_name:req.cookies.userName, form:"bystander", bots:[bots]});}
            if(results.length){
                for(let i =0; i<results.length; i++){
                    let bot_name=results[i].bot_name,bot_id=results[i].bot_id;
                    let isSelected; if(i==0){ isSelected="selected";}else{ isSelected="";}
                    bots+=`<option value="${bot_id}" ${isSelected}>${bot_name.toUpperCase()}</option>`;
                }
                res.render("forms",{pageTitle:"ADD NEW BYSTANDER",user_name:req.cookies.userName, form:"bystander", bots:[bots]});
            }
            else{res.render("forms",{pageTitle:"ADD NEW BYSTANDER",user_name:req.cookies.userName, form:"bystander", bots:[bots]});}
        });
});

route.get("/tone_counter",isAuth,(req,res)=>{
    if(req.cookies.userType=="admin"){checker=`1`;}else{checker=`user_id='${req.cookies.userId}' `;}
    conn.query(`SELECT * FROM daily_tone WHERE ${checker}`, 
        function (error, results) {
            let words="";

            if(error) {res.render("tone_counter",{pageTitle:"TONE COUNTER",user_name:req.cookies.userName,words:[words]});}

            if(results.length){
                for(let i =0; i<results.length; i++){
                    let key_word=results[i].key_word,key_id=results[i].key_id;
                    words+=`<option value="${key_word}-${key_id}">${key_word.toUpperCase()}</option>`;
                }

                res.render("tone_counter",{pageTitle:"TONE COUNTER",user_name:req.cookies.userName,words:[words]});
            }
            else{
                res.render("tone_counter",{pageTitle:"TONE COUNTER",user_name:req.cookies.userName,words:[words]});
            }
        });
});

route.get("/new_keywords",isAuth,(req,res)=>{res.render("forms",{pageTitle:"ADD NEW KEYWORD", user_name:req.cookies.userName, form:"newkeyword" });});

route.get("/new_listener",isAuth,(req,res)=>{
    if(req.cookies.userType=="admin"){checker=`1`;}else{checker=`owner_id='${req.cookies.userId}' `;}
    conn.query(`SELECT * FROM bots WHERE ${checker}`, 
    function (error, results) {
        let bots="";

        if(error) { res.render("forms",{pageTitle:"ADD NEW LISTENER", user_name:req.cookies.userName, form:"listener", bots:[bots]});}

        if(results.length){
            for(let i =0; i<results.length; i++){
                let bot_name=results[i].bot_name,bot_id=results[i].bot_id;
                let isSelected; if(i==0){ isSelected="selected";}else{ isSelected="";}
                bots+=`<option value="${bot_id}" ${isSelected}>${bot_name.toUpperCase()}</option>`;
            }
            res.render("forms",{pageTitle:"ADD NEW LISTENER", user_name:req.cookies.userName, form:"listener", bots:[bots]});
        }
        else{res.render("forms",{pageTitle:"ADD NEW LISTENER", user_name:req.cookies.userName, form:"listener", bots:[bots]});}
    });
});

//view counted note
route.get("/view_counted_tone",isAuth,(req,res)=>{
    conn.query(`SELECT * FROM daily_tone WHERE 1`, function (error, results) {
        let opt="",isSelected="",countedtone="";

        if(error) {
            opt=`<option value="" selected>${error}</option>`;
            res.render("view_counted_tone",{pageTitle:"TWITTER TONE", user_name:req.cookies.userName,opt:opt,countedtone: countedtone});
        }

        if(results.length){
            for(let i=0; i<results.length; i++){
                let key_word=results[i].key_word,media=results[i].media,key_id=results[i].key_id;
                if(i==0){isSelected="selected";}
                opt+=`<option value="${key_id}" ${isSelected}>${key_word.toUpperCase()} (${media})</option>`;
            }
            countedtone=`<tr class="tr_item"><td colspan='6' style='text-align:center;'>No data found</td></tr>`;
            res.render("view_counted_tone",{pageTitle:"TWITTER TONE", user_name:req.cookies.userName,opt:opt,countedtone: countedtone});
        }
        else{
            countedtone=`<tr class="tr_item"><td colspan='6' style='text-align:center;'>No data found</td></tr>`;
            opt=`<option value="" selected>No Key Found</option>`;
            res.render("view_counted_tone",{pageTitle:"TWITTER TONE", user_name:req.cookies.userName,opt:opt,countedtone: countedtone});
        }
    });
});

//retweet from specific user
route.get("/fromspecific",isAuth,(req,res)=>{
    if(req.cookies.userType=="admin"){checker=`1`;}else{checker=` retweet_from_specific.user_id='${req.cookies.userId}' `;}
    conn.query(`SELECT * FROM retweet_from_specific LEFT JOIN bots ON retweet_from_specific.bot_id=bots.bot_id WHERE ${checker}`,(err,rs)=>{
        let listeners="";

        if(err) {
            listeners=`<tr><td colspan='9' style='text-align:center;'>${err}</td></tr>`;
            res.render("retweet_from_specific",{pageTitle:"LISTENERS", user_name:req.cookies.userName,listener:[listeners]});
        }
        
        if(rs.length){
            for(let i =0; i<rs.length; i++){
                listeners+=`<tr id='tr_${rs[i].ky_id}'><td>${i+1}</td><td>${rs[i].bot_name}</td><td>${rs[i].keyword}</td><td>${rs[i].from_author_name}</td><td>${rs[i].from_author_id}</td>
                                <td><span class="badge badge-danger delete_keywords" role='button' data-name='${rs[i].keyword}' data-id='${rs[i].ky_id}'>Delete</span></td>
                            </tr>`;
            }
            res.render("retweet_from_specific",{pageTitle:"LISTENERS", user_name:req.cookies.userName,listener:[listeners]});
        }
        else{
            listeners=`<tr><td colspan='9' style='text-align:center;'>No details found</td></tr>`;
            res.render("retweet_from_specific",{pageTitle:"LISTENERS", user_name:req.cookies.userName,listener:[listeners]});
        }
    });
});

//view all data
route.get("/viewdata",isAuth,(req,res)=>{
    conn.query(`SELECT * FROM tonality LEFT JOIN social_media ON tonality.page_id=social_media.media_id WHERE 1 LIMIT 10`, 
    function (error, results) {
        let tones=""; 

        if(error) {
            tones=`<tr><td colspan='3' style='text-align:center;' id="empty_list">${error}</td></tr>`;
            res.render("tonality_datatable",{pageTitle:"SOCIAL MEDIA TONE", user_name:req.cookies.userName,tones:tones});
        } 
        
        if(results.length){
            for(let i =0; i<results.length; i++){
                let t_id=results[i].t_id,page_name=results[i].page_name, positive=results[i].positive, negative=results[i].negative,
                neautral=results[i].neautral, unrelated=results[i].unrelated,date_created=results[i].date_created.toISOString().slice(0, 10);
                if(i==0){ isSelected="selected";}else{ isSelected="";}
                tones+=`<tr class="tr_item" id='tr_item_${t_id}'>
                            <td class="date_tr">
                                <span class="action_span border"><i id="delet_btn_${t_id}" role="button" class="fa fa-trash  fa-1x delet_tr" title="Delete This Item" aria-hidden="true" data-dataid="${t_id}"></i></span> 
                                ${date_created}
                            </td>
                            <td>${page_name}</td><td class='positive'>${positive}</td><td class='negative'>${negative}</td><td class='neutral'>${neautral}</td><td class='unrelated'>${unrelated}</td>
                        </tr>`;
            }
            res.render("tonality_datatable",{pageTitle:"SOCIAL MEDIA TONE", user_name:req.cookies.userName,tones:tones});
        }
        else{
            tones=`<tr><td colspan='3' style='text-align:center;' id="empty_list">No data found</td></tr>`;
            res.render("tonality_datatable",{pageTitle:"SOCIAL MEDIA TONE", user_name:req.cookies.userName,tones:tones});
        }
    });
});

//view social message trends
route.get("/social_messages",isAuth,(req,res)=>{
    conn.query(`SELECT * FROM message_trend WHERE 1`, function (error, results) {
        let table_data="";

        if(error) { 
            table_data=`<tr class="tr_item" id='empty_list'><td colspan='3' style='text-align:center;'>${error}</td></tr>`;
            res.render("tonality_message",{pageTitle:"SOCIAL MEDIA MESSAGES TREND", user_name:req.cookies.userName, table_data:table_data});
        }

        if(results.length){
            for(let i =0; i<results.length; i++){
                let messageid=results[i].messageid,dm_message=results[i].dm_message,
                messanger=results[i].messanger, datemade=results[i].datemade;
                table_data+=`<tr id='tr_${messageid}' class="tr_item">
                                <td class="date_tr">
                                    <span class="action_span border"><i id="delet_btn_${messageid}" role="button" class="fa fa-trash  fa-1x delete_msg" title="Delete This Item" aria-hidden="true" data-id="${messageid}"></i></span> 
                                    ${datemade}
                                </td>
                                <td class='dm'>${dm_message}</td><td class='messanger'>${messanger}</td>
                            </tr>`;
            }
            res.render("tonality_message",{pageTitle:"SOCIAL MEDIA MESSAGES TREND", user_name:req.cookies.userName, table_data:table_data});
        }
        else{
            table_data=`<tr class="tr_item" id='empty_list'><td colspan='3' style='text-align:center;'>No data found</td></tr>`;
            res.render("tonality_message",{pageTitle:"SOCIAL MEDIA MESSAGES TREND", user_name:req.cookies.userName, table_data:table_data});
        }
    });
});

//load media list to the user
route.get("/media_list",isAuth,(req,res)=>{
    conn.query(`SELECT * FROM social_media WHERE 1`, function (error, results) {

        let table_data="";

        //handle error
        if(error){
            table_data=`<tr class='tr_item' id="empty_list"><td colspan='2' style='text-align:center;'>${error}</td></tr>`;
            res.render("tonality_medialist",{pageTitle:"MEDIA LIST", user_name:req.cookies.userName, table_data:table_data});
        }
        
        if(results.length){
            for(let i =0; i<results.length; i++){
                let page_name=results[i].page_name.toUpperCase(),media_name=results[i].media_name.toUpperCase();
                table_data+=`<tr class='tr_item' id='tr_${results[i].media_id}'>
                                <td class="date_tr">
                                    <span class="action_span"><i id="delet_btn_${results[i].media_id}" role="button" class="fa fa-trash  fa-1x delete_media" title="Delete This Item" data-name='${page_name}' data-id='${results[i].media_id}'></i></span> 
                                    ${media_name}
                                </td>
                                <td>${page_name}</td>
                            </tr>`;
            }
            res.render("tonality_medialist",{pageTitle:"MEDIA LIST", user_name:req.cookies.userName, table_data:table_data});
        }
        else{
            table_data=`<tr class='tr_item' id="empty_list"><td colspan='2' style='text-align:center;'>No data found</td></tr>`;
            res.render("tonality_medialist",{pageTitle:"MEDIA LIST", user_name:req.cookies.userName, table_data:table_data});
        }
    });
});

//logout
route.get("/logout",(req,res)=>{
    res.clearCookie("userId"); res.clearCookie("userEmail");
    res.clearCookie("userPass"); res.clearCookie("userName");
    res.clearCookie("userType"); res.clearCookie("userPic");
    res.render("index",{title:"Log In"}); res.end();
});

module.exports= route;