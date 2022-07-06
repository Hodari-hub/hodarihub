const express = require("express");
const reg_route = express.Router();
const conn=require("../modals/connection");
var bcrypt = require('bcryptjs');

//handle login request
reg_route.post('/login',async (req,res)=>{
    const {m_email,m_pass} = req.body;
    let url="";
    if(!m_email || !m_pass){res.json({code: "0",message:"Please fill all the form data!"}); res.end();}
    else{
        conn.query(`SELECT * FROM base_members WHERE m_email='${m_email}'`,function (error, results) {
            if(error) throw error;
            if(bcrypt.compareSync(m_pass, results[0].m_pass)){
                res.cookie('isToneMember',false);res.cookie('toneMemId',0);
                res.cookie('userId',results[0].m_id); res.cookie('userEmail',results[0].m_email);
                res.cookie('userName',results[0].m_name);res.cookie('userType',results[0].m_type);
                res.cookie('userPass',results[0].m_pass);res.cookie('userPic',results[0].m_pic);

                if(results[0].m_type=="operator"||results[0].m_type=="admin"){ url="/dashboard"; }
                else{ url=`/profile/${results[0].m_id}`; }

                res.json({code: 1,message:"Succesfuly logged in",url:url});
                res.end();
            }
            else{
                res.json({code: 0,message:"Login failed!"}); res.end();
            }
        });
    }
});

module.exports=reg_route;