var socket=io.connect("http://localhost:3000/");
socket.on("Tweet",function(data){
    $("#tweets").find("#empty").fadeOut();
    if(data.data.includes.hasOwnProperty('media')){
        $("#tweets").append(`<div class="border rounded col-9 col-lg-6 mx-auto row p-1 my-3" id="twt_${data.data.data.id}">
                    <div class="col-2 profilepic">
                    <img src="/static/images/user.png" alt="avatar" style="width:50px;height:50px;" srcset="${data.data.includes.users[0].profile_image_url}">
                </div>
                <div class="col-10">
                    <div class="username text-left border-bottom p-1 m-0">${data.data.includes.users[0].name} <br> @${data.data.includes.users[0].username}</div>
                    <div class="tweet py-3">
                        ${data.data.data.text} &nbsp; <a href='#' class='openTweetWindow' data-url='https://twitter.com/x/status/${data.data.data.id}'>view tweet</a>
                        <div class="img my-1"><img src="${data.data.includes.media[0].url}" class="rounded" style="max-width:100%" alt=""></div>
                    </div>
                    <div class="engagement row py-1 border-top">
                        <div class="col text-center">Likes ${data.data.data.public_metrics.like_count}</div>
                        <div class="col text-center">Reply ${data.data.data.public_metrics.reply_count}</div>
                        <div class="col text-center">Retweet ${data.data.data.public_metrics.retweet_count}</div>
                    </div>
                    <div class="buttons py-3 text-center">
                        <button class="btn btn-outline-primary iobtn" data-keyid='${data.keyid}' data-type='unrelated' data-content='${data.data.data.id}'>Unrelated</button>
                        <button class="btn btn-outline-secondary iobtn" data-keyid='${data.keyid}' data-type='neutral' data-content='${data.data.data.id}'>Neutral</button>
                        <button class="btn btn-outline-danger iobtn" data-keyid='${data.keyid}' data-type='negative' data-content='${data.data.data.id}'>Negative</button>
                        <button class="btn btn-outline-success iobtn" data-keyid='${data.keyid}' data-type='positive' data-content='${data.data.data.id}'>Positive</button>
                    </div>
                </div>
            </div>`);
    }
    else{
        $("#tweets").append(`<div class="border rounded col-9 col-lg-6 mx-auto row p-1 my-3" id="twt_${data.data.data.id}">
                    <div class="col-2 profilepic">
                    <img src="/static/images/user.png" alt="avatar" style="width:50px;height:50px;" srcset="${data.data.includes.users[0].profile_image_url}">
                </div>
                <div class="col-10">
                <div class="username text-left border-bottom p-1 m-0">${data.data.includes.users[0].name} <br> @${data.data.includes.users[0].username}</div>
                    <div class="tweet py-3">
                        ${data.data.data.text}  &nbsp; <a href='#' class='openTweetWindow' data-url='https://twitter.com/x/status/${data.data.data.id}'>view tweet</a>
                    </div>
                    <div class="engagement row py-2 border-top">
                        <div class="col text-center">Likes ${data.data.data.public_metrics.like_count}</div>
                        <div class="col text-center">Reply ${data.data.data.public_metrics.reply_count}</div>
                        <div class="col text-center">Retweet ${data.data.data.public_metrics.retweet_count}</div>
                    </div>
                    <div class="buttons py-3 text-center">
                        <button class="btn btn-outline-primary iobtn" data-keyid='${data.keyid}' data-type='unrelated' data-content='${data.data.data.id}'>Unrelated</button>
                        <button class="btn btn-outline-secondary iobtn" data-keyid='${data.keyid}' data-type='neutral' data-content='${data.data.data.id}'>Neutral</button>
                        <button class="btn btn-outline-danger iobtn" data-keyid='${data.keyid}' data-type='negative' data-content='${data.data.data.id}'>Negative</button>
                        <button class="btn btn-outline-success iobtn" data-keyid='${data.keyid}' data-type='positive' data-content='${data.data.data.id}'>Positive</button>
                    </div>
                </div>
            </div>`);
    }
});

socket.on("handshakes", function(data){$("#tweets").html(`<div class=" rounded col-9 col-lg-6 mx-auto row p-1 my-3" style="text-align:center !important;" id="empty">${data.message}</div>`);});
socket.on("streaming_started", function(data){$("#tweets").html(`<div class=" rounded col-9 col-lg-6 mx-auto row p-1 my-3" style="text-align:center !important;" id="empty">${data.message}</div>`);});
socket.on("tonefeedback", function(data){ $(`#${data.type}`).html(Number($(`#${data.type}`).html())+1); $(`#twt_${data.content_id}`).fadeOut(); });

//save the positive btn
$("#tweets").on("click",".iobtn",function(){
    let type=$(this).data("type"),contanteid=$(this).data("content"),keysid=$(this).data("keyid");
    socket.emit("tone",{type:type,contanteid:contanteid,keyid:keysid});
});

$("body").on("click","#listen_to", function(){
    let keyword=$("#keyword_id").val().split("-");
    $("#tweets").html(`<div class=" rounded col-9 col-lg-6 mx-auto row p-1 my-3" style="text-align:center !important;" id="empty"><em>Processing...</em></div>`);
    socket.emit("keyword",{new_key:keyword[0],key_id:keyword[1]});
});

//stop streaming
$("body").on("click","#stop_streaming", function(){ let keyword=$("#keyword_id").val().split("-"); socket.emit("stop_streaming",{current_stream:keyword[0]});});
socket.on("streaming_stoped", function(data){$("#tweets").html(`<div class=" rounded col-9 col-lg-6 mx-auto row p-1 my-3" style="text-align:center !important;" id="empty">${data.message}</div>`);});

$("#tweets").on("click",".openTweetWindow", function(e){ e.preventDefault(); let url=$(this).data("url"); window.open(url,"","width=600,height=700");});