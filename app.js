const express= require("express");
const path = require("path");
const app= express();
const _tables=require("./controllers/create_tables");
const _new_user=require("./controllers/new_user");
const auth_route=require("./routes/auth_route");
const core_route=require("./routes/core_route");
const post_route=require("./controllers/posthandler");
const cookieParser = require('cookie-parser');
const bystander=require("./controllers/bystanders");
const rt_fromspecific=require("./controllers/retweet_from_specific");
const tone_counter=require("./controllers/tone_counter");
const socket= require("socket.io");
const needle = require('needle');
const twitt_listener=require("./controllers/twit_listener");

//SOCKET HANDLER
const io_rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const io_streamURL ='https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id,attachments.media_keys&media.fields=preview_image_url,url&user.fields=profile_image_url';

//establish express ejs
app.set("view engine","ejs");
//listern to the end point
const server=app.listen(3000);

//passcookies to the browser
app.use(cookieParser());

//create tables
_tables.create_tables();

//start tweet streaming
bystander.start_the_process();

//retweet from the specific 
rt_fromspecific.start_process();

//initial core admin
_new_user.new_user('Deogratius Mabima', 'deogratius@umojasystems.com', '0756935683', '0658913666', 'Upanga', 'No description', 0, '#Ushindi@123','admin');

//set static file to be public
app.use("/static",express.static(path.join(__dirname,'public')));

//handle incoming form post
app.use(express.urlencoded({extended: true}));

//registraion route
app.use(auth_route);

//All core route
app.use(core_route);

//handle all incoming post
app.use(post_route);

//return 404 page
app.use((req, res)=>{res.status(404).sendFile("./views/404.html",{root: __dirname});});


//MANAGE SOCKET FUNCTIONAL
const  io=socket(server);

// send all stream data found from twitter
function sendData(data){io.sockets.emit("Tweet",data);}

// get available stream
async function getRules(BareToken) {const response = await needle('get', io_rulesURL, { headers: {Authorization: `Bearer ${BareToken}`,},}); return response.body;}

// set new rule to stream
async function setRules(BareToken,newrule) {
    const data = { add: [{ value: newrule }],}
    const response = await needle('post', io_rulesURL, data, {headers: {'content-type': 'application/json', Authorization: `Bearer ${BareToken}`,},});
    return response.body;
}

// delete previus stream to set new stream
async function deleteRules(BareToken,previusrule) {
    if (!Array.isArray(previusrule.data)) {return null}
    const ids = previusrule.data.map((rule) => rule.id); const data = {delete: {ids: ids,},}
    const response = await needle('post', io_rulesURL, data, {headers: {'content-type': 'application/json',Authorization: `Bearer ${BareToken}`,},});
    return response.body;
}

//stream tweet arcording to the new rule
function streamTweets(BareToken) {
    const stream = needle.get(io_streamURL, {headers: {Authorization: `Bearer ${BareToken}`,},})
    stream.on('data', (data) => { try{const json = JSON.parse(data); sendData(json);} catch (error) {} });
    return stream;
}

//initializing streaming
var initialize_rules = async (BareToken,newrule)=>{
    let currentRules;
    try {
        //Get all stream rules
        currentRules = await getRules(BareToken);
        // Delete all stream rules
        await deleteRules(BareToken,currentRules);
        // Set rules based on array above
        await setRules(BareToken,newrule);
        //then call the stream function
        streamTweets(BareToken);
    } 
    catch (error) {process.exit(1);}
}

//GEORGE MLAWA bot (here has to be set the default bare code)
let bare="AAAAAAAAAAAAAAAAAAAAAPs3UwEAAAAA4A8wV5DdD0sKMqeYYaYyJ00%2Bc3U%3D1xyvw5zev4IRhfQXX17PAh84FtJbJiRXuyDwwZPicpFkQH9WWX";

//check if the socket is connnected
io.on("connection",(sockets)=>{
    io.sockets.emit("handshakes",{message:"<em>You have successfully connected to the server, select key word to stream</em>"});
    sockets.on("tone",(data)=>{if(tone_counter.savetone(data.contanteid,data.type,data.keyid)){io.sockets.emit("tonefeedback",{content_id:data.contanteid, type:data.type});}});
    sockets.on("keyword",(data)=>{
        initialize_rules(bare,data.new_key);
        io.sockets.emit("streaming_started",{message:`<em>Streaming on '<strong>${data.new_key}</strong>' keyword has started just wait for the response!</em>`});
    });
    
});
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX