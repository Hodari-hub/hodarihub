const needle = require('needle');
const conn=require("../modals/connection");

//bare token to be used (kamchalabot bare token from kinoko's bot @KamchalaBoto)
const BareToken='AAAAAAAAAAAAAAAAAAAAAHg3UwEAAAAA7TREuZXt1V%2B560Jg3KtWjxUUxVo%3DKpiMpXkFhEgfCCl0LxiExBijgM4b4ubJ7nVf2sXeuTKIE4IbOJ';

//influencers checking tracker function
var getInfluencersStats = async (botid,next_token,fromdate,todate)=>{

  //handle pegination token 
  if(next_token!=""){next_token=`&pagination_token=${next_token}`}

  //run twitter api request with bare token
  const bothTweetandRetweet=`https://api.twitter.com/2/users/${botid}/tweets?max_results=50&start_time=${fromdate}T00:00:00Z&end_time=${todate}T23:59:59Z&expansions=author_id,referenced_tweets.id,referenced_tweets.id.author_id,entities.mentions.username,in_reply_to_user_id,attachments.media_keys&tweet.fields=attachments,author_id,id,text,withheld,entities,public_metrics,created_at&place.fields=geo&media.fields=preview_image_url,type,url${next_token}`;
  const bothTR = await needle('get', bothTweetandRetweet, { headers: {Authorization: `Bearer ${BareToken}`,},});

  //check if there is a meta object 
  try{
    if("meta" in bothTR.body){
      //if meta is available then check the next token
      let check_next_token= "next_token" in bothTR.body.meta;

      //if you find the next token then make the next request
      if(check_next_token){getInfluencersStats(BareToken,botid,bothTR.body.meta.next_token,fromdate,todate);}
    }
  }
  catch(e){ return 0; }

  try{
    //loop through the result and save to the database
    for(let i =0; i<bothTR.body.meta.result_count; i++){
      let getIncludes=bothTR.body.includes;
      let data=bothTR.body.data[i];
      let isMamaYukoKazin=data.text.toLowerCase().includes('#mamayukokazini');
      let isSamiaSuluhuHassan=data.text.toLowerCase().includes('samia suluhu hassan');
      let isSamiaSuluhu=data.text.toLowerCase().includes('samia suluhu');
      let isRaisiSamia=data.text.toLowerCase().includes('rais samia');
      let ptype="POST";
      let twitt_text=data.text;
      let _created=data.created_at.slice(0, 10);
      
      //check is retweet or not
      if(data.text.substring(0,2).toString()=="RT"){
        let pr_id=getIncludes.tweets.findIndex(obj=>{ return obj.id === bothTR.body.data[i].referenced_tweets[0].id; });ptype="RT";
        isMamaYukoKazin=getIncludes.tweets[pr_id].text.toLowerCase().includes('#mamayukokazini');
        isSamiaSuluhuHassan=getIncludes.tweets[pr_id].text.toLowerCase().includes('samia suluhu hassan');
        isSamiaSuluhu=getIncludes.tweets[pr_id].text.toLowerCase().includes('samia suluhu');
        isRaisiSamia=getIncludes.tweets[pr_id].text.toLowerCase().includes('rais samia');
        twitt_text=getIncludes.tweets[pr_id].text;
      }

      //check if this is the post
      if("in_reply_to_user_id" in bothTR.body.data[i]){ptype="REPLY";}

      //check which keyword is carried from the tweet
      if(isSamiaSuluhuHassan){keyword='samia suluhu hassan';}
      else if(isSamiaSuluhu){keyword='samia suluhu';}
      else if(isMamaYukoKazin){keyword='#mamayukokazini';}
      else if(isRaisiSamia){keyword='rais samia';}
      else{keyword='undetected keyword';}

      //check if the text contain our keywords and the author is ours
      if(isMamaYukoKazin === true || isSamiaSuluhuHassan === true || isSamiaSuluhu=== true || isRaisiSamia==true){

        //check if the data have already inserted
        conn.query(`SELECT * FROM influencers_stats WHERE post_id='${data.id}'`,(er,rs)=>{
          if(er){return 0;}
          else{
            if(!rs.length){

              //insert into the database
              conn.query(`INSERT INTO influencers_stats SET ?`,{
                owner_id:data.author_id,post_type:ptype,post_id:data.id,key_word:keyword,impression:0,engagement:0,
                detailed_expand:0,followers:0,profile_views:0,retweets:data.public_metrics.retweet_count,
                replies:data.public_metrics.reply_count,likes:data.public_metrics.like_count,text:twitt_text,
                quotes:data.public_metrics.quote_count,date_created:_created,reach:0
              }, 
              function(error, results) { if(error) {return 0; } });
            }
          }
        });
      }
    }
  }
  catch(e){return 0; }
  
  return true;
}

module.exports={getInfluencersStats}


