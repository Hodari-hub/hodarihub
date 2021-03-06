const needle = require('needle');
const conn=require("../modals/connection");
const twit = require('twit');


const rt_rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const rt_streamURL ='https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id';

// Get stream rules
async function getRules(BareToken) {
  const response = await needle('get', rt_rulesURL, { headers: {Authorization: `Bearer ${BareToken}`,},})
  return response.body;
}

// Set stream rules
async function setRules(BareToken,newrule) {
  const data = { add: [{ value: newrule }],}
  const response = await needle('post', rt_rulesURL, data, { headers: {'content-type': 'application/json', Authorization: `Bearer ${BareToken}`,},});
  return response.body;
}

//retweet the content
var retweet=(rt_Id,consumerKey,consumerSecret,accessToken,accessSecret)=>{
  let T = new twit({consumer_key:consumerKey,consumer_secret:consumerSecret,access_token:accessToken,access_token_secret:accessSecret});
  T.post('statuses/retweet/:id', { id: rt_Id }, function (error, data, response) { if(error){} });
}

// Delete stream rules
async function deleteRules(BareToken,previusrule) {
    if (!Array.isArray(previusrule.data)) {return null}
    const ids = previusrule.data.map((rule) => rule.id);
    const data = {delete: {ids: ids,},}
    const response = await needle('post', rt_rulesURL, data, {headers: {'content-type': 'application/json',Authorization: `Bearer ${BareToken}`,},});
    return response.body
}

function streamTweets(APIKey,APISecrete,Atoken,Tsecrete,BareToken,from_author) {
  const stream = needle.get(rt_streamURL, {headers: {Authorization: `Bearer ${BareToken}`,},})
  stream.on('data', (data) => {
    try {
      if(data){
        const json = JSON.parse(data);
        let isRt= json.data.text.substring(0,2).toString()=="RT"; let isReply= "in_reply_to_user_id" in json.data;
        if(json.data.author_id==from_author){if(!isReply && !isRt){retweet(json.data.id,APIKey,APISecrete,Atoken,Tsecrete);}}
      }
    } catch (error) {
      console.log(`This is the error on line no 47/ rewteet_from_specific.js : ${error}`);
    }
  });
  return stream;
}

var start_process=()=>{
  var initialize_rules= async (APIKey,APISecrete,Atoken,Tsecrete,BareToken,newrule,from_author)=>{
      let currentRules;
      try {
        //Get all stream rules
        currentRules = await getRules(BareToken);
        // Delete all stream rules
        await deleteRules(BareToken,currentRules);
        // Set rules based on array above
        await setRules(BareToken,newrule);
        //then call the stream function
        streamTweets(APIKey,APISecrete,Atoken,Tsecrete,BareToken,from_author);
      } 
      catch (error) { process.exit(1); }
    }

  //fetch data from the databse and make a request
  conn.query(`SELECT * FROM retweet_from_specific LEFT JOIN bots ON retweet_from_specific.bot_id=bots.bot_id WHERE 1`,async (err,resp)=>{
    if(err) throw err;
    if(resp.length){
      for(let i =0; i<resp.length; i++){
        await initialize_rules(resp[i].api_key,resp[i].apisecret,resp[i].access_token,resp[i].access_secret,resp[i].baretoken,resp[i].keyword,resp[i].from_author_id);
      }
    }
  });
}

module.exports={start_process};