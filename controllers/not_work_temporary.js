const needle = require('needle');
const conn=require("../modals/connection");
let bots_id=[];

//guselya ngwandu credentials
let baretoken='AAAAAAAAAAAAAAAAAAAAANtXUwEAAAAAalFD6lrI94r%2Byzx9tOFEFkJo1AY%3DtNGOWbrWZjda6TYyRNeyUzYJ9R7rpDxav6AIQTlyzdLbCOF6xS';

//fetch bots profile listener
conn.query(`SELECT * FROM bots WHERE 1`,  (error, results) =>{
  if(error){console.log(error);}
  if(results.length){
    for(let i =0; i<results.length; i++){
        if(results[i].bots_id){bots_id.push(results[i].bots_id);}
    }
    p_check_effort();
  } 
});

//get user only tweets
async function p_getTweets(BareToken,botid,next_token) {
  let myDate = new Date(),year = myDate.getFullYear();
  let month = myDate.getMonth() + 1;
  if(month <= 9){month = '0'+month;}
  let day= myDate.getDate();
  if(day <= 9){day = '0'+day;}
  let date = "2022-06-05";

  if(next_token!=""){next_token=`&pagination_token=${next_token}`}

  const bothTweetandRetweet=`https://api.twitter.com/2/users/${botid}/tweets?exclude=replies&max_results=100&start_time=${date}T00:00:00Z&end_time=${date}T23:59:59Z&expansions=author_id,referenced_tweets.id,referenced_tweets.id.author_id,entities.mentions.username,in_reply_to_user_id,attachments.media_keys&tweet.fields=attachments,author_id,id,text,withheld,entities,public_metrics&place.fields=geo&media.fields=preview_image_url,type,url${next_token}`;
  const bothTR = await needle('get', bothTweetandRetweet, { headers: {Authorization: `Bearer ${BareToken}`,},});

  //check if there is a meta object 
  if("meta" in bothTR.body){
    let check_next_token= "next_token" in bothTR.body.meta;
    //if you find the next token then make the next request
    if(check_next_token){ p_getTweets(BareToken,botid,bothTR.body.meta.next_token);}
  }
  else{ return; }

  //loop through result and find rt and tweet and if contain tags we want
  for(let i =0; i<bothTR.body.meta.result_count; i++){
    let getIncludes=bothTR.body.includes;
    let data=bothTR.body.data[i];
    let isMamaYukoKazin=data.text.toLowerCase().includes('#mamayukokazini');
    let isSamiaSuluhuHassan=data.text.toLowerCase().includes('samia suluhu hassan');
    let isSamiaSuluhu=data.text.toLowerCase().includes('samia suluhu');
    let isAuthorMember=bots_id.includes(data.author_id);
    let isRetweet=0,ptype="POST";
    let twitt_text=data.text;

    //check is retweet or not
    if(data.text.substring(0,2).toString()=="RT"){
      let pr_id=getIncludes.tweets.findIndex(obj=>{ return obj.id === bothTR.body.data[i].referenced_tweets[0].id; });
      isRetweet=true;ptype="RT"
      isMamaYukoKazin=getIncludes.tweets[pr_id].text.toLowerCase().includes('#mamayukokazini');
      isSamiaSuluhuHassan=getIncludes.tweets[pr_id].text.toLowerCase().includes('samia suluhu hassan');
      isSamiaSuluhu=getIncludes.tweets[pr_id].text.toLowerCase().includes('samia suluhu');
      twitt_text=getIncludes.tweets[pr_id].text;
    }

    //check if this is the post
    if("in_reply_to_user_id" in bothTR.body.data[i]){ptype="REPLY";}

    //check which keyword is carried from the tweet
    if(isMamaYukoKazin&&!isSamiaSuluhu){keyword='#mamayukokazini';}
    else if(!isMamaYukoKazin&&isSamiaSuluhu){keyword='samia suluhu hassan';}
    else{keyword='samia suluhu';}

    //check if the text contain our keywords and the author is ours
    if((isMamaYukoKazin == true || isSamiaSuluhu == true || isSamiaSuluhuHassan==true)&&isAuthorMember){
      conn.query(`SELECT * FROM twitter_stats WHERE post_id='${data.id}'`,(er,rs)=>{
        if(er) throw er;
        if(!rs.length){
          conn.query(`INSERT INTO twitter_stats SET ?`,{
            owner_id:data.author_id,post_type:ptype,post_id:data.id,key_word:keyword,impression:0,engagement:0,
            detailed_expand:0,followers:0,profile_views:0,retweets:data.public_metrics.retweet_count,
            replies:data.public_metrics.reply_count,likes:data.public_metrics.like_count,text:twitt_text,
            quotes:data.public_metrics.quote_count,date_created:date,reach:0
          }, 
          function(error, results) { if(error) {console.log(`${error}`);} });
        }
      });
    }
  }
}

//endless watching man is here for test?
let p_check_status = setInterval(() => { for(let i=0; i<bots_id.length; i++){  p_getTweets(baretoken,bots_id[i],''); }},60000);

//start query now 
var p_check_effort=()=>{for(let i=0; i<bots_id.length; i++){ p_getTweets(baretoken,bots_id[i],''); } p_check_status;}
p_check_effort();


