const conn=require("../modals/connection");
const tweet_handler=require("../controllers/tweet_handler");
const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

//store obtained tags 
var tags=[];

//function to fetch new tags
var getTag=(dayname)=>{
    tags=[];tags.push({"lastupdate":`${dayname}`});
    conn.query(`SELECT * FROM retweets LEFT JOIN botapp ON botapp.app_id=retweets.app_id WHERE retweets.day_name='${dayname}' GROUP BY retweets.rt_id`,(err,results)=>{
        if(err) throw err;
        tags=[{"lastupdate":`${dayname}`}];
        if(results.length){ for(let i=0; i<results.length;i++){tags.push({"rt_id": results[i].rt_id,"time_interval": results[i].time_interval,'app_id': results[i].app_id,'tag_name': results[i].tag_name,'day_name': results[i].day_name,'app_name': results[i].app_name,'api_key': results[i].api_key,'api_secrete': results[i].api_secrete,'access_token': results[i].access_token,'access_secret': results[i].access_secret,"numofretweet":results[i].numofretweet});}}
    });
}

//get specific time of tanzania
function calcTime(offset,req) {
    var d = new Date(),utc = d.getTime() + (d.getTimezoneOffset() * 60000),nd = new Date(utc + (3600000*offset));

    let h=nd.getHours(),m=nd.getMinutes(),sec=nd.getSeconds();
    if(h<=9){ h=`0${h}`; }else{ h=`${h}`;}
    if(m<=9){m=`0${m}`;}else{m=`${m}`;}
    if(sec<=9){sec=`0${sec}`;}else{sec=`${sec}`;}

    if(req=="time"){return `${h}:${m}`;}
    else if(req=="minutes"){return m;}
    else if(req=="seconds"){return sec;}
    else{return days[Number(nd.getDay())-1];}
}

//store the current time acordingly
let current_min = ()=>{ return calcTime('+3',"minutes"); }
let current_sec = ()=>{ return calcTime('+3',"seconds"); }

//store the current day
var current_day=""; 

//get the current day fucntion
let get_day=()=>{return calcTime("+3","day");}

//watch man to run the check every tim
var retweet_timer=()=>{
    //set date in the variable and keep cheking
    if(current_day!=get_day()){current_day=get_day(); getTag(current_day);}
    if(tags.length>1){
        for(let i=1;i<tags.length;i++){
            //find the module
            let isNotaTimeTorun=(Number(current_min())%Number(tags[i].time_interval));
            if(!isNotaTimeTorun&&Number(current_sec())==0){tweet_handler.serch_tweet(tags[i].rt_id,tags[i].app_id,tags[i].tag_name,tags[i].day_name,tags[i].app_name,tags[i].api_key,tags[i].api_secrete,tags[i].access_token,tags[i].access_secret,tags[i].numofretweet);}
        }
    }
}

//update tags for the new update
var updateTags=()=>{getTag(current_day);}

//start the watchman
var watchman=()=>{setInterval(retweet_timer, 1000);}

module.exports={watchman,updateTags}