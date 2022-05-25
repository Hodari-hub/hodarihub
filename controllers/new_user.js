const _conn=require("../modals/connection");
var bcrypt = require('bcryptjs');
const new_user=async(uname, email, number1, number2, location, description, user, password,utype)=>{
    let hashpassword = bcrypt.hashSync(password, 8);let response= false;
    //check if user exist first
    await _conn.query(`SELECT * FROM base_members WHERE m_name='${uname}' AND m_email='${email}' AND m_phone_number='${number1}' AND m_sec_number='${number2}'`,(err,results)=>{
        if(err) throw err;
        if(!results.length){
            //if user is not exist then insert the new user to the database
            _conn.query(`INSERT INTO base_members SET ?`,
            {m_pic:'/static/images/user.png',m_name:uname,m_pass:hashpassword,m_email:email,m_phone_number:number1,m_sec_number:number2,m_type:utype,m_location:location,m_description:description,created_by:user,date_created:new Date().toISOString().slice(0, 20),last_log:new Date().toISOString().slice(0, 20),}, 
            function(error, results) {
                if(error) throw error;
                if(results.affectedRows){response=true;}else{response=false;}
            });
        }
    });
}
module.exports={new_user}