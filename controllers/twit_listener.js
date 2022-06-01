const needle = require('needle');
const conn=require("../modals/connection");

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL ='https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id';
let bots_id=[];

//fetch bots profile listener
conn.query(`SELECT * FROM bots WHERE 1`,  (error, results) =>{
    if(error){console.log(error);}
    if(results.length){
        for(let i =0; i<results.length; i++){
            if(results[i].bots_id){bots_id.push(results[i].bots_id);}
        }
    } 
});

// Get stream rules
async function getRules(BareToken) {
  const response = await needle('get', rulesURL, { headers: {Authorization: `Bearer ${BareToken}`,},})
  return response.body;
}

// Set stream rules
async function setRules(BareToken) {
  const data = { add: [{ value: '#MamaYukoKazini' },{value: 'Samia Suluhu Hassan'}],}
  const response = await needle('post', rulesURL, data, {
    headers: {'content-type': 'application/json', Authorization: `Bearer ${BareToken}`,},
  });
  return response.body;
}

// Delete stream rules
async function deleteRules(BareToken,previusrule) {
    if (!Array.isArray(previusrule.data)) {return null}
    const ids = previusrule.data.map((rule) => rule.id);
    const data = {delete: {ids: ids,},}
    const response = await needle('post', rulesURL, data, {headers: {'content-type': 'application/json',Authorization: `Bearer ${BareToken}`,},});
    return response.body
}

function streamTweets(BareToken) {
  const stream = needle.get(streamURL, {headers: {Authorization: `Bearer ${BareToken}`,},})
  stream.on('data', (data) => {
    try {
        if(data){
            const json = JSON.parse(data); let keyword;

            //test if the content is real contain the selected tags
            let isMamaYukoKazin=json.data.text.toLowerCase().includes('#mamayukokazini');
            let isSamiaSuluhu=json.data.text.toLowerCase().includes('samia suluhu hassan');
            let isAuthorMember=bots_id.includes(json.data.author_id);
            let isRetweet=false,ptype="POST OR COMMENT";

            //check is retweet or not
            if(json.data.text.substring(0,2).toString()=="RT"){isRetweet=true;ptype="RT"}

            //check which keyword is carried from the tweet
            if(isMamaYukoKazin&&!isSamiaSuluhu){keyword='#mamayukokazini';}
            else if(!isMamaYukoKazin&&isSamiaSuluhu){keyword='samia suluhu hassan';}
            else{keyword='samia suluhu hassan  #mamayukokazini';}

            //check if the text contain our keywords and the author is ours
            if((isMamaYukoKazin == true || isSamiaSuluhu == true)&&!isAuthorMember){
                conn.query(`INSERT INTO twitter_stats SET ?`,{
                    owner_id:json.data.author_id,post_type:ptype,post_id:json.data.id,key_word:keyword,impression:0,engagement:0,
                    detailed_expand:0,followers:0,profile_views:0,retweets:json.data.public_metrics.retweet_count,
                    replies:json.data.public_metrics.reply_count,likes:json.data.public_metrics.like_count,
                    quotes:json.data.public_metrics.quote_count,date_created:new Date().toISOString().slice(0, 20)
                  }, 
                  function(error, results) {
                        if(error) {console.log(`${error}`);}
                        else{console.log(results);}
                  });
            }
        }
    }
    catch(error){console.log(`error found ${error}`)}
  });

  return stream;
}

var start_listening=()=>{
    var initialize_rules= async (BareToken)=>{
        console.log("start listening..");
      let currentRules;
        try {
            //Get all stream rules
            currentRules = await getRules(BareToken);
            // Delete all stream rules
            await deleteRules(BareToken,currentRules);
            // Set rules based on array above
            await setRules(BareToken);
            //then call the stream function
            streamTweets(BareToken);
        } catch (error) {
            process.exit(1);
        }
    }

    //guselya ngwandu credentials
    let baretoken='AAAAAAAAAAAAAAAAAAAAANtXUwEAAAAAalFD6lrI94r%2Byzx9tOFEFkJo1AY%3DtNGOWbrWZjda6TYyRNeyUzYJ9R7rpDxav6AIQTlyzdLbCOF6xS';

  initialize_rules(baretoken);
}

module.exports={start_listening};

