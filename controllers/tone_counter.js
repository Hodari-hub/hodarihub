const conn=require("../modals/connection");
var savetone =  (contanteid,type,keyid)=>{
    let ps=0,neg=0,neu=0,unr=0, result=1;

    if(type=="urelated"){unr=1;}else if(type=="positive"){ps=1;}
    else if(type=="negative"){neg=1;}else if(type=="neutral"){neu=1;}

    conn.query("INSERT INTO daily_tonality SET ?",{key_id:keyid,content_id:contanteid,positive:ps,negative:neg,neutral:neu,unrelated:unr,date_created:new Date().toISOString().slice(0, 20)},
    (error, results)=>{
        if(error) throw error;
        if(results.affectedRows){result= 1;}else{result= 0;}
    });

    return result;
}
module.exports={savetone}