/////////////////////////////////////////////////////////////
///////////////////MEMBERS FUNCTIONS////////////////////////
///////////////////////////////////////////////////////////
    
    //function to add new member
    $("form#addnewuser").submit(function(e){
        e.preventDefault();
        $("#newuser_res").html(`<em style='color:#fff;'>processing..</em>`); 
        var formData = $(this);
        $.ajax({
            type:"POST",url:"/addnewmember", data:formData.serialize(),
            success:function(rs){
                $("#newuser_res").fadeOut(5000);
                setTimeout(()=>{$("#newuser_res").html("");},5000);
                if(rs.code==1){
                    $("#newuser_res").html(`<em class='clr_success'>${rs.message}</em>`);
                    $("form#addnewuser").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val(''); 
                }
                else{$("#newuser_res").html(`<em class='clr_fuiler'>${rs.message}</em>`);}
            }
        });
    });

    //function to delete user
    $("button#delete_user").click(function(){
        let userid=$(this).data("userid");
        Swal.fire({title: 'Are you sure?',text: "You want to delete this user", icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
        })
        .then((result) => {
            if (result.isConfirmed) {
            $.ajax({
                    type:"POST",url:"/deletuser", data:{userid:userid},
                    success:function(rs){
                        $("#bot_res").fadeOut(5000)
                        setTimeout(()=>{$("#bot_res").html("");},5000);
                        if(rs.code==1){
                            Swal.fire({title: '',text: `${rs.message}`, icon: 'success',showCancelButton: false, confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Ok'})
                            .then((result) => {if(result.isConfirmed) {window.location='/dashboard'}});
                        }
                        else{ Swal.fire('Error', `${rs.message}`,'warning'); }
                    }
                });
            }
        });
    });

    //function to edit user details
    $("form#edituserForm").submit(function(e){
        e.preventDefault();
        $("#newuser_res").html(`<em style='color:#fff;'>processing..</em>`); 
        var formData = $(this);
        $.ajax({
            type:"POST",url:"/edit_user", data:formData.serialize(),
            success:function(rs){
                $("#newuser_res").fadeOut(5000);
                setTimeout(()=>{$("#newuser_res").html("");},5000);
                if(rs.code==1){
                    $("form#addnewuser").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val(''); 
                    Swal.fire({title: '',text: `${rs.message}`, icon: 'success',showCancelButton: false, confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Ok'})
                        .then((result) => {if(result.isConfirmed) {window.location=`/profile/${rs.userid}`}});
                }
                else{$("#newuser_res").html(`<em class='clr_fuiler'>${rs.message}</em>`);}
            }
        });
    });
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//////////////////////END OF MEMBER ISSUES//////////////////////////
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

/////////////////////////////////////////////////////////////
/////////////////EMAIL & SOCIAL MEDIAS//////////////////////
///////////////////////////////////////////////////////////

    //function to add new mailbot
    $("form#newmailbot").submit(function(e){
        e.preventDefault();$("#email_res").fadeIn();
        $("#email_res").html(`<em style='color:#fff;'>processing..</em>`); 
        var formData = $(this);
        $.ajax({
            type:"POST",url:"/new_email", data:formData.serialize(),
            success:function(rs){
                $("#email_res").fadeOut(5000);
                setTimeout(()=>{$("#email_res").html("");},5000);
                if(rs.code==1){
                    $("form#newmailbot").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val(''); 
                    $("#email_res").html(`<em class='clr_success'>${rs.message}</em>`);
                }
                else{$("#email_res").html(`<em class='clr_fuiler'>${rs.message}</em>`);}
            }
        });
    });

    //function to delete emails
    $("body").on('click','.delete_emails',function(){
        let mailid=$(this).data("id");
        let name=$(this).data("mname");
        Swal.fire({
            title: 'Are you sure?',html: `You want to delete <strong style='color:#e64033;'>${name}</strong> from mail list`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
        })
        .then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type:"POST",url:"/delete_email", data:{mailid:mailid},
                    success:function(rs){
                        if(rs.code==1){Swal.fire('SUCCESS', `${rs.message}`,'success'); $(`#tr_${mailid}`).fadeOut(1000); setTimeout(()=>{$(`#tr_${mailid}`).remove();},1200);}
                        else{ Swal.fire('Error', `${rs.message}`,'warning'); }
                    }
                });
            }
        });
    });

    //function to edit email
    $("form#editEmail").submit(function(e){
        e.preventDefault();$("#email_res").fadeIn();
        $("#email_res").html(`<em style='color:#fff;'>processing..</em>`); 
        var formData = $(this);
        $.ajax({
            type:"POST",url:"/edit_email", data:formData.serialize(),
            success:function(rs){
                $("#email_res").fadeOut(5000);
                setTimeout(()=>{$("#email_res").html("");},5000);
                if(rs.code==1){
                    $("form#editEmail").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val(''); 
                    Swal.fire({title: '',text: `${rs.message}`, icon: 'success',showCancelButton: false, confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Ok'})
                        .then((result) => {if(result.isConfirmed) {window.location=`/email_list`}});
                }
                else{$("#email_res").html(`<em class='clr_fuiler'>${rs.message}</em>`);}
            }
        });
    });

    //function to add new platform
    $("#newPlatform").submit(function(e){
        e.preventDefault(); let form = $(this); 
        $("#platform_res").html(`<em>Processing..</em>`);
        $.ajax({
            type:'POST',url:'/new_platform_handler',
            data:form.serialize(),success:function(rs){
                form.trigger("reset");$("#platform_res").html(``);
                if(rs.code==1){Swal.fire('SUCCESS', `${rs.message}`,'success');}
                else{Swal.fire('Error', `${rs.message}`,'warning');}
            }
        });
    });

    //function to edit platform
    $("#edit_Platform").submit(function(e){
        e.preventDefault(); let form = $(this); 
        $("#platform_res").html(`<em>Processing..</em>`);
        $.ajax({
            type:'POST',url:'/edit_platform_handler',
            data:form.serialize(),success:function(rs){
                form.trigger("reset");$("#platform_res").html(``);
                if(rs.code==1){

                    Swal.fire({title: '',text: `${rs.message}`, icon: 'success',showCancelButton: false, confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Ok'})
                        .then((result) => {if(result.isConfirmed) {window.location='/platforms'}});
                
                }
                else{Swal.fire('Error', `${rs.message}`,'warning');}
            }
        });
    });

    //function to delete platform
    $("body").on('click','.delete_platform',function(){
        let platform_id=$(this).data("id");
        let name=$(this).data("pname");
        Swal.fire({
            title: 'Are you sure?',html: `You want to delete <strong style='color:#e64033;'>${name}</strong> from platform list`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
        })
        .then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type:"POST",url:"/delete_platform", data:{platform_id:platform_id},
                    success:function(rs){
                        if(rs.code==1){Swal.fire('SUCCESS', `${rs.message}`,'success'); $(`#tr_${platform_id}`).fadeOut(1000); setTimeout(()=>{$(`#tr_${platform_id}`).remove();},1200);}
                        else{ Swal.fire('Error', `${rs.message}`,'warning'); }
                    }
                });
            }
        });
    });

    //function to click copy the media bot password
    $("#media_bots").on("click",".copy_pass", function(){
        let pass=$(this).data("password");
        navigator.clipboard.writeText(pass);
    });

    //function to add newbot
    $("form#newbotform").submit(function(e){
        e.preventDefault();$("#bot_res").fadeIn();
        $("#bot_res").html(`<em style='color:#fff;'>processing..</em>`); 
        var formData = $(this);
        $.ajax({
            type:"POST",url:"/addnewbot", data:formData.serialize(),
            success:function(rs){
                $("#bot_res").fadeOut(5000)
                setTimeout(()=>{$("#bot_res").html("");},5000);
                if(rs.code==1){
                    $("#bot_res").html(`<em class='clr_success'>${rs.message}</em>`);
                    $("form#newbotform").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val('');
                }
                else{$("#bot_res").html(`<em class='clr_fuiler'>${rs.message}</em>`);}
            }
        });
    });

    //function to submit bot edition
    $("form#editbotForm").submit(function(e){
        e.preventDefault();$("#editbot_res").fadeIn();
        $("#editbot_res").html(`<em style='color:#fff;'>processing..</em>`); 
        var formData = $(this);
        $.ajax({
            type:"POST",url:"/edit_bot_form", data:formData.serialize(),
            success:function(rs){
                $("#editbot_res").fadeOut(5000);
                setTimeout(()=>{$("#editbot_res").html("");},5000);
                if(rs.code==1){
                    $("form#editbotForm").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val(''); 
                    Swal.fire({title: '',text: `${rs.message}`, icon: 'success',showCancelButton: false, confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Ok'})
                        .then((result) => {if(result.isConfirmed) {window.location=`/socialmedia`}});
                }
                else{Swal.fire('ERROR', `${rs.message}`,'warning');}
            }
        });
    });

    //function to delete social media
    $("body").on('click','.deletesocial',function(){
        let mediaid=$(this).data("id");
        let name=$(this).data("myname");
        Swal.fire({
            title: 'Are you sure?',html: `You want to delete <strong style='color:#e64033;'>${name}</strong> from media list`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
        })
        .then((result) => {
            if (result.isConfirmed) {
              $.ajax({
                    type:"POST",url:"/delete_media", data:{mediaid:mediaid},
                    success:function(rs){
                        if(rs.code==1){Swal.fire('SUCCESS', `${rs.message}`,'success'); $(`#tr_${mediaid}`).fadeOut(1000); setTimeout(()=>{$(`#tr_${mediaid}`).remove()},1200)}
                        else{ Swal.fire('Error', `${rs.message}`,'warning'); }
                    }
                });
            }
        });
    });

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//////////////////END OF EMAIL AND SOCIAL MEDIA ISSUES//////////////
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX



//////////////////////////////////////////////////////////////////////
//////////////////////////TWITTER AUTOMATION ISSUES//////////////////
////////////////////////////////////////////////////////////////////

    //function to set new automation
    $("form#twitter_automation").submit(function(e){
        e.preventDefault();$("#twitter_automation_res").fadeIn();
        $("#twitter_automation_res").html(`<em style='color:#fff;'>processing..</em>`); 
        var formData = $(this);
        $.ajax({
            type:"POST",url:"/add_twitter_new_keyword", data:formData.serialize(),
            success:function(rs){
                $("#twitter_automation_res").fadeOut(5000);
                setTimeout(()=>{$("#twitter_automation_res").html("");},5000);
                if(rs.code==1){
                    $("form#twitter_automation").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val(''); 
                    $("#twitter_automation_res").html(`<em class='clr_success'>${rs.message}</em>`);
                }
                else{$("#twitter_automation_res").html(`<em class='clr_fuiler'>${rs.message}</em>`);}
            }
        });
    });

    //function to delete automated key
    $("body").on('click','.delete_automate_key',function(){
        let listernerid=$(this).data("id");
        Swal.fire({
            title: 'Are you sure?',html: `You want to delete this listener from the list`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
        })
        .then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type:"POST",url:"/delete_automate_key", data:{listernerid:listernerid},
                    success:function(rs){
                        if(rs.code==1){
                            Swal.fire('SUCCESS', `${rs.message}`,'success'); 
                            $(`#tr_${listernerid}`).fadeOut(1000); 
                            setTimeout(()=>{$(`#tr_${listernerid}`).remove();},1200);
                        }
                        else{ Swal.fire('Error', `${rs.message}`,'warning'); }
                    }
                });
            }
        });
    });

    //function to set tone keyword
    $("form#new_tone_keyword").submit(function(e){
        e.preventDefault();$("#new_keyword_res").fadeIn();
        $("#new_keyword_res").html(`<em style='color:#fff;'>processing..</em>`); 
        var formData = $(this);
        $.ajax({
            type:"POST",url:"/new_keyword", data:formData.serialize(),
            success:function(rs){
                $("#new_keyword_res").fadeOut(5000);
                setTimeout(()=>{$("#new_keyword_res").html("");},5000);
                if(rs.code==1){
                    $("form#new_tone_keyword").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val(''); 
                    $("#new_tone_keyword_res").html(`<em class='clr_success'>${rs.message}</em>`);
                }
                else{$("#new_tone_keyword_res").html(`<em class='clr_fuiler'>${rs.message}</em>`);}
            }
        });
    });

    //function to delete keyword
    $("body").on("click","#delete_tone_counter_keyword", function(){
        let keyword_id=$("#keyword_id").val().split("-");
        Swal.fire({
            title: 'Are you sure?',html: `You want to delete current keyword`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
        })
        .then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type:"POST",url:"/delete_tone_counter_keyword", data:{keyword_id:keyword_id[1]},
                    success:function(rs){
                        console.log(rs)
                        if(rs.code==1){
                            $(`#delete_keyword option[value='${keyword_id}']`).remove();
                            Swal.fire('SUCCESS', `${rs.message}`,'success'); location.reload();
                        }
                        else{ Swal.fire('Error', `${rs.message.sqlMessage}`,'warning'); }
                    }
                });
            }
        });
    });

    //create auto retweet from a specific user
    $("form#new_rt_listener").submit(function(e){
        e.preventDefault();$("#new_rt_listener_res").fadeIn();
        $("#new_rt_listener_res").html(`<em style='color:#fff;'>processing..</em>`); 
        var formData = $(this);
        $.ajax({
            type:"POST",url:"/rt_from_specific_listener", data:formData.serialize(),
            success:function(rs){
                $("#new_rt_listener_res").fadeOut(5000);
                setTimeout(()=>{$("#new_rt_listener_res").html("");},5000);
                if(rs.code==1){
                    $("form#new_rt_listener").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val(''); 
                    $("#new_rt_listener_res").html(`<em class='clr_success'>${rs.message}</em>`);
                }
                else{$("#new_rt_listener_res").html(`<em class='clr_fuiler'>${rs.message}</em>`);}
            }
        });
    });

    $("body").on("click",".delete_rt_keywords", function(){
        let keyword_id=$(this).data("id");
        Swal.fire({
            title: 'Are you sure?',html: `You want to delete current keyword`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
        })
        .then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type:"POST",url:"/delete_rt_keywords", data:{keyword_id:keyword_id},
                    success:function(rs){
                        if(rs.code==1){
                            $(`#tr_${keyword_id}`).fadeOut(1000); setTimeout(()=>{$(`#tr_${keyword_id}`).remove();},1200);
                            Swal.fire('SUCCESS', `${rs.message}`,'success'); 
                        }
                        else{ Swal.fire('Error', `${rs.message}`,'warning'); }
                    }
                });
            }
        });
    });

    //get single twitt startistc of the bot
    $("#get_statistic").click(function(){
        let user_names = $("#user_names").val(),start_date = $("#start_date").val();
        $("#twets_result").html(`<em style='color:green;'>Processing...</em>`);
        $.ajax({
            type:"POST",url:"/single_tweet_stats",data:{bot_id:user_names,date:start_date},
            success:function(res){
                $("#twets_result").html(res.result);
            }
        });
    });

    //select bot to view statistic
    $("#user_names").change(function(){
        let uname = $(this).find(':selected').data('uname');
        let pass = $(this).find(':selected').data('pass');
        $("#uname").html(uname);
        $("#pass").html(pass);
    });

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//////////////////END OF TWITTER AUTOMATION ISSUES//////////////////
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX


//////////////////////////////////////////////////////////////////////
//////////////////////////TWITTER TONALITY ISSUES////////////////////
////////////////////////////////////////////////////////////////////

    //function delete social media
    $("body").on("click",".delete_media", function(){
        let media_id=$(this).data("id");
        let name=$(this).data("name");
        Swal.fire({
            title: 'Are you sure?',html: `You want to delete <strong>${name}</strong> from the page list`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
        })
        .then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type:"POST",url:"/delete_tone_media", data:{media_id:media_id},
                    success:function(rs){
                        if(rs.code==1){
                            $(`#tr_${media_id}`).fadeOut(1000); setTimeout(()=>{$(`#tr_${media_id}`).remove();},1200);
                            Swal.fire('SUCCESS', `${rs.message}`,'success'); 
                        }
                        else{ Swal.fire('Error', `${rs.message}`,'warning'); }
                    }
                });
            }
        });
    });

    //message tonality
    $("body").on("click",".delete_msg", function(){
        let media_id=$(this).data("id");
        Swal.fire({
            title: 'Are you sure?',html: `You want to delete this data from the list`, icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
        })
        .then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type:"POST",url:"/delete_msg_trend_item", data:{media_id:media_id},
                    success:function(rs){
                        if(rs.code==1){
                            $(`#tr_${media_id}`).fadeOut(1000); setTimeout(()=>{$(`#tr_${media_id}`).remove();},1200);
                            Swal.fire('SUCCESS', `${rs.message}`,'success'); 
                        }
                        else{ Swal.fire('Error', `${rs.message}`,'warning'); }
                    }
                });
            }
        });
    });
    
    $("body").on("change","#social_type", function(){
        let selected_media=$(this).val();
        $("#selected_page").html(`<option selected disabled>Fetching option...</option>`);
        $.ajax({
            type:"POST",url:"/fetch_options", data:{selected_media:selected_media},
            success:function(rs){
                if(rs.code==1){$("#selected_page").html(rs.opt);}
                else{$("#selected_page").html(`<option selected disabled>No Option found</option>`); Swal.fire('Error', `${rs.message}`,'warning'); }
            }
        });
    });
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//////////////////END OF TWITTER TONALITY ISSUES////////////////////
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

$("#tone_item_form").submit(function(e){
    e.preventDefault(); let form = $(this); $("#response").html(`<em>Processing..</em>`);
    $.ajax({
        type:"POST",url:"/add_newtone",data:form.serialize(),
        success:function(res){
            console.log(res)
            $("#form").modal("toggle"); 
            if(res.code==1){
                Swal.fire('SUCCESS', `${res.message}`,'success');
                $("#tr_total").before(res.tag);
            }
            else{
                Swal.fire('Error', `${res.message.sqlMessage}`,'warning');
            }
        }
    });
});

$("body").on("click",".delet_tr", function(){
    let itemId=$(this).data("dataid");
    Swal.fire({
        title: 'Are you sure?',html: `You want to delete this Item from the list`, icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
    })
    .then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type:"POST",url:"/delete_tonality_item", data:{itemId:itemId},
                success:function(rs){
                    if(rs.code==1){
                        $(`#tr_item_${itemId}`).fadeOut(1000); 
                        setTimeout(()=>{$(`#tr_item_${itemId}`).remove();},1200);
                        Swal.fire('SUCCESS', `${rs.message}`,'success'); 
                    }
                    else{ Swal.fire('Error', `${rs.message}`,'warning'); }
                }
            });
        }
    });
});

function calculate_total(){
    if($("#tr_total").length){
        let total_positive=0, total_negative=0, total_neutral=0, total_unrelated=0,dm=0,messanger=0;
        $("table").find(".positive").each(function(){let vl=Number($(this).html());total_positive+=vl;});
        $("table").find(".negative").each(function(){let vl=Number($(this).html());total_negative+=vl;});
        $("table").find(".neutral").each(function(){let vl=Number($(this).html());total_neutral+=vl;});
        $("table").find(".unrelated").each(function(){let vl=Number($(this).html());total_unrelated+=vl;});
        $("table").find(".dm").each(function(){let vl=Number($(this).html());dm+=vl;});
        $("table").find(".messanger").each(function(){let vl=Number($(this).html());messanger+=vl;});

        $("#total_positive").html(total_positive); $("#total_negative").html(total_negative);
        $("#total_neutral").html(total_neutral); $("#total_unrelated").html(total_unrelated);
        $("#total_dm").html(dm); $("#total_messanger").html(messanger);
    }
}
$(document).ready(function() { calculate_total(); });
$("#counted_tone_search").submit(function(e){
    e.preventDefault();let form=$(this); 
    $("#counted_tone_list").find(".tr_item").remove();
    $("#counted_tone_list").prepend(`<tr class='tr_item'><td colspan='6' style='text-align:center;'><em>Processing..</em></td></tr>`);
    $.ajax({
        type:"POST", url:"/counted_tone_search", data:form.serialize(),
        success:function(res){
            $("#counted_tone_list").find(".tr_item").remove();
            if(res.code==1){
                $("#tr_total").before(res.tones); calculate_total();}
            else{$("#tr_total").before(res.tones); calculate_total();}
        }
    });
});

//view data search
$("#dataSearch").on("click",".opt_selectd", function(){
    $(".opt_selectd").each(function(){ $(this).removeClass("active");})
    let selection=$(this).data("opt");
    $("#media_selected").val(selection);
    $(this).addClass("active");
});

$("#dataSearch").submit(function(e){
    e.preventDefault();let form=$(this); 
    $("#tonality_list").find(".tr_item").remove();
    $("#tonality_list").prepend(`<tr class='tr_item'><td colspan='6' style='text-align:center;'><em>Processing..</em></td></tr>`);
    $.ajax({
        type:"POST", url:"/data_view_search", data:form.serialize(),
        success:function(res){
            $("#tonality_list").find(".tr_item").remove();
            if(res.code==1){$("#tr_total").before(res.tones); calculate_total();}
            else{$("#tr_total").before(res.tones); calculate_total();}
        }
    });
});

//search data on message trend
$("#dataSearch_social_message").submit(function(e){
    e.preventDefault();let form=$(this); 
    $("#trendList").find(".tr_item").remove();
    $("#trendList").prepend(`<tr class='tr_item'><td colspan='6' style='text-align:center;'><em>Processing..</em></td></tr>`);
    $.ajax({
        type:"POST", url:"/search_message_trend", data:form.serialize(),
        success:function(res){
            $("#trendList").find(".tr_item").remove();
            if(res.code==1){$("#tr_total").before(res.trends); calculate_total();}
            else{$("#tr_total").before(res.trends); calculate_total();}
        }
    });
});

//add direct tone message
$("#message_trend").submit(function(e){
    e.preventDefault();let form=$(this); $("#mediaresp").html(`<em>Processing..</em>`);
    $.ajax({
        type:"POST", url:"/message_trend_server", data:form.serialize(),
        success:function(res){
            $(this).trigger("reset"); $("#mediaresp").html(``);
            $("#message_trend_form").modal("toggle");
            if(res.code==1){
                if($("#trendList").find(`#empty_list`).length){ $("#trendList").find(`#empty_list`).remove(); }
                $("#tr_total").before(res.tag); calculate_total();
            }
            else{$("#tr_total").before(res.tag); calculate_total();}
        }
    });
});

//add socialmedia group
$("#new_social_group").submit(function(e){
    e.preventDefault(); let form = $(this); 
    $("#mediaresp").html(`<em>Processing..</em>`);
    $.ajax({
        type:'POST',url:'/social_media_handler',
        data:form.serialize(),success:function(rs){
            form.trigger("reset"); $("#new_tone_form").modal("toggle");
            if(rs.code==1){
                $("#mediaresp").html(``); $("#pageList").append(rs.tag);
                $("#pageList").find(".tr_item").remove();
                if($("#pageList").find(`#empty_list`).length){$("#pageList").find(`#empty_list`).remove();}
                Swal.fire('SUCCESS', `${rs.message}`,'success'); 
            }
            else{Swal.fire('Error', `${rs.message}`,'warning');}
        }
    });
});






$("body").on('click','.datainputs',function(){
    let pid=$(this).data("postid");
    let column=$(this).data("column");
    Swal.fire({
        title: 'IMPRESSION',
        html: `<input type="number" id="impression" class="swal2-input" placeholder="Enter number of impression">`,
        confirmButtonText: 'Add Impression',focusConfirm: false,
        preConfirm: () => {
            let impression = Swal.getPopup().querySelector('#impression').value;
            if (!impression) {Swal.showValidationMessage(`Suppy number of impression!`);}
            return {impression:impression }
        }
    })
    .then((result) => {
        if(result.isConfirmed){
            $.ajax({
                type:"POST",url:"/add_stats", data:{column:column,post_id:pid,value:result.value.impression},
                success:function(rs){
                    if(rs.code==1){
                        $(`#pid_${rs.pid}`).fadeOut();
                        Swal.fire({title: '',html: rs.message,icon: 'success',confirmButtonText: 'Ok'});
                    }
                    else{Swal.fire({title: '',text: rs.message,icon: 'info',confirmButtonText: 'Ok'});}
                }
            });
        }
    });
});

$("body").on('click','.wipeout',function(){
    let closeid=$(this).data("closeid");
    if($(`#pid_${closeid}`).remove()){
        Swal.fire({title: '',html: "Element removed!",icon: 'success',confirmButtonText: 'Ok'});
    }
});

$("body").on('submit','#new_member_tonolity',function(e){
    e.preventDefault();
    let form = $(this);
    $.ajax({
        type:"POST",url:"/tonality_new_member",
        data:form.serialize(),
        success:function(res){
            if(res.code){
                Swal.fire('SUCCESS', `${res.message}`,'success'); 
                let ele_num=$("#tonality_member").find("tr").length;
                $("#tonality_member").append(`<tr class='tr' id='tr_${res.mid}'>
                                                <td>${ele_num+1}</td> <td>${res.member_name}</td>
                                                <td> <span class="badge badge-danger delete_member" role='button' data-mname='${res.member_name}' data-id='${res.mid}'>Delete</span>
                                                </td>
                                            </tr>`);
            }
            else{Swal.fire({title: '',text: res.message,icon: 'info',confirmButtonText: 'Ok'});}
        }
    });
});

$("body").on('click','.delete_member',function(){
    let trid=$(this).data("id");
    let mname=$(this).data("mname");
    Swal.fire({
        title: 'Are you sure?',html: `You want to delete <strong style='color:#e64033;'>${mname}</strong> from member list`, icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
    })
    .then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type:"POST",url:"/delete_tone_member", data:{member_id:trid},
                success:function(rs){
                    if(rs.code==1){Swal.fire('SUCCESS', `${rs.message}`,'success'); $(`#tr_${trid}`).fadeOut(1000); setTimeout(()=>{$(`#tr_${trid}`).remove();},1200);}
                    else{ Swal.fire('Error', `${rs.message}`,'warning'); }
                }
            });
        }
    });
});

/* PROFILE SCRIPT */
$("#get_data").click(function(){
    let start_date, end_date, platform;
    start_date=$("#start_date").val();end_date=$("#end_date").val();
    uid=$("#uid").val(); platform=$("#platform").val();
    //set loaders to the divs
    $("#post_result").html("<small><em>processing...</em></small>"); $("#retweet_result").html("<small><em>processing...</em></small>");
    $("#impression_result").html("<small><em>processing...</em></small>"); $("#reach_result").html("<small><em>processing...</em></small>");
    $.ajax({ type:"POST", url:"/single_user_data", data:{start:start_date,end:end_date,platform:platform,m_id:uid},success:function(res){ $("#post_result").html(res.numpost);  $("#retweet_result").html(res.numrt); $("#impression_result").html(res.impres); $("#reach_result").html(res.reach);}});
});
/* END */

$(".get_twitt_statistic").click(function(){
    let postid = $('#postid').val();
    let page_name = $('#page_name').val();
    let postcaption = $('#postcaption').val();
    let loadmore=$("#loadmore_input").val();
    let mem_id=$("#mem_id").val();

    $.ajax({
        type:"POST", url:"/tonality_twitter_counter",
        data:{postid:postid,loadmore:loadmore,page_name:page_name,postcaption:postcaption,mem_id:mem_id},
        success:function(res){
            let data=res.result,next_token="";

            //if something went wrong
            if(!res.code){Swal.fire({title: '',text: res.message,icon: 'info',confirmButtonText: 'Ok'}); return;}

            //check if there is a meta object 
            if("meta" in data){
                //check if next token is available
                next_token= "next_token" in data.meta;
                //if you find the next token then make the next request
                if(next_token){ next_token=data.meta.next_token;}
            }

            //if we find next token in the result
            if(next_token!=""){ $("#loadmore_input").val(next_token); }
            else{ $("#loadbtn_div").fadeOut(); }

            //set item value
            $("#item_id").val(res.item_id);

            //append values
            for(let i=0; i<data.data.length;i++){
                console.log(data);
                if(data.includes.hasOwnProperty('media')){
                    $("#results").append(`<div class="border rounded col-9 col-lg-6 mx-auto row p-1 my-3" id="twt_${data.data[i].id}">
                                <div class="col-2 profilepic">
                                <img src="/static/images/user.png" alt="avatar" style="width:50px;height:50px;" srcset="${data.includes.users[i].profile_image_url}">
                            </div>
                            <div class="col-10">
                                <div class="username text-left border-bottom p-1 m-0">${data.includes.users[i].name} <br> @${data.includes.users[i].username}</div>
                                <div class="tweet py-3">
                                    ${data.data[i].text} &nbsp; <a href='#' class='openUrl' data-target='https://twitter.com/x/status/${data.data[i].id}' target="_blank">view tweet</a>
                                    <div class="img my-1"><img src="${data.includes.media[i].url}" class="rounded" style="max-width:100%" alt=""></div>
                                </div>
                                <div class="engagement row py-1 border-top">
                                    <div class="col text-center">Likes ${data.data[i].public_metrics.like_count}</div>
                                    <div class="col text-center">Reply ${data.data[i].public_metrics.reply_count}</div>
                                    <div class="col text-center">Retweet ${data.data[i].public_metrics.retweet_count}</div>
                                </div>
                                <div class="buttons py-3 text-center">
                                    <button class="btn btn-outline-primary tone_iobtn" data-type='unrelated' data-content='${data.data[i].id}'>Unrelated</button>
                                    <button class="btn btn-outline-secondary tone_iobtn" data-type='neutral' data-content='${data.data[i].id}'>Neutral</button>
                                    <button class="btn btn-outline-danger tone_iobtn" data-type='negative' data-content='${data.data[i].id}'>Negative</button>
                                    <button class="btn btn-outline-success tone_iobtn" data-type='positive' data-content='${data.data[i].id}'>Positive</button>
                                </div>
                            </div>
                        </div>`);
                }
                else{
                    $("#results").append(`<div class="border rounded col-9 col-lg-6 mx-auto row p-1 my-3" id="twt_${data.data[i].id}">
                                <div class="col-2 profilepic">
                                <img src="/static/images/user.png" alt="avatar" style="width:50px;height:50px;" srcset="${data.includes.users[i].profile_image_url}">
                            </div>
                            <div class="col-10">
                            <div class="username text-left border-bottom p-1 m-0">${data.includes.users[i].name} <br> @${data.includes.users[i].username}</div>
                                <div class="tweet py-3">
                                    ${data.data[i].text}  &nbsp; <a href='#' class='openUrl' data-target='https://twitter.com/x/status/${data.data[i].id}' target="_blank">view tweet</a>
                                </div>
                                <div class="engagement row py-2 border-top">
                                    <div class="col text-center">Likes ${data.data[i].public_metrics.like_count}</div>
                                    <div class="col text-center">Reply ${data.data[i].public_metrics.reply_count}</div>
                                    <div class="col text-center">Retweet ${data.data[i].public_metrics.retweet_count}</div>
                                </div>
                                <div class="buttons py-3 text-center">
                                    <button class="btn btn-outline-primary tone_iobtn" data-type='unrelated' data-content='${data.data[i].id}'>Unrelated</button>
                                    <button class="btn btn-outline-secondary tone_iobtn" data-type='neutral' data-content='${data.data[i].id}'>Neutral</button>
                                    <button class="btn btn-outline-danger tone_iobtn" data-type='negative' data-content='${data.data[i].id}'>Negative</button>
                                    <button class="btn btn-outline-success tone_iobtn" data-type='positive' data-content='${data.data[i].id}'>Positive</button>
                                </div>
                            </div>
                        </div>`);
                }
            }
        }
    });
});

//open url in the external window
$("#results").on("click",".openUrl", function(e){
    e.preventDefault();
    let url=$(this).data("target");
    window.open(url,"","width=600,height=700");
});

//view data on the seperate window
$("table").on("dblclick",".viewTweet", function(){
    let url=$(this).data("target");
    let width=5
    let l=window.innerWidth-width;
    window.open(url,"customWindow",`width=600,height=700,left=${l},right=10`);
});


//save the positive btn
$("#results").on("click",".tone_iobtn",function(){
    let type=$(this).data("type"),content_id=$("#item_id").val(),member_id=$("#mem_id").val(),post_id=$("#postid").val();
    let div_id=$(this).data("content");
    $.ajax({
        type:"POST",url:"/tonality_count_twitter",data:{count_type:type,row_id:content_id,mem_id:member_id,post_id:post_id},
        success:function(res){
            if(res.code){
                $(`#twt_${div_id}`).fadeOut(); $(`#${type}`).html(Number($(`#${type}`).html())+1);
                setTimeout(()=>{$(`#twt_${div_id}`).remove();},1000);
            }
            else{
                Swal.fire({title: '',text: res.message,icon: 'info',confirmButtonText: 'Ok'});
            }
        }
    });
});

//pending data search
$("#pendigdataSearch").submit(function(e){
    e.preventDefault();let form=$(this); 
    $("#tonality_list").find(".tr_item").remove();
    $("#tonality_list").prepend(`<tr class='tr_item'><td colspan='6' style='text-align:center;'><em>Processing..</em></td></tr>`);
    $.ajax({
        type:"POST", url:"/pending_data_view_search", data:form.serialize(),
        success:function(res){
            $("#tonality_list").find(".tr_item").remove();
            if(res.code==1){$("#tr_total").before(res.tones); calculate_total();}
            else{$("#tr_total").before(res.tones); calculate_total();}
        }
    });
});

$("#download_csv").click(function(){
    let from,to,socialname;
    from=$("#from").val();to=$("#to").val();socialname=$("#socialname").val();
    $.ajax({
        type:"POST", url:"/getCsv", data:{from_date:from,to_date:to,socialname:socialname},
        success:function(res){
            if(res.code){
                Swal.fire({ title: '',html: `Your File is ready for download`, icon: 'success', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Download Now' })
                .then((result) => { 
                    if (result.isConfirmed) { window.location=`/downloads/${res.filename.split(".")[0]}`;} 
                    else{
                        $.ajax({
                            type:"POST",url:"/delete_downloads",data:{filename:res.filename},
                            success:function(dt){
                                if(!dt.code){Swal.fire({title:'',html: dt.message,icon:'warning',confirmButtonText:'Ok'});}
                            }
                        });
                    }
                });
            }
            else{Swal.fire({title:'',text: rs.message,icon:'info',confirmButtonText:'Ok'});}
        }
    });
});

//get youtube search result
$("#youtube_search").submit(function(e){
    e.preventDefault();
    let form=$(this); 
    $("#results").html(`<em>Search..</em>`);
    $.ajax({
        type:"POST", url:"/youtube_search", data:form.serialize(),
        success:function(res){
            if(res.code==1){
                let result=res.result.items;

                if(res.result.nextPageToken!=""){ $("#loadmore_input").val(res.result.nextPageToken); }
                else{ $("#loadbtn_div").fadeOut(); }
                $("#results").html(``);

                for(let i =0; i<result.length; i++){
                    
                    $("#results").append(`<div class="col-6 mx-auto row my-3" id='yt_${i}'>
                                                <div class="col-6"><img src='${result[i].snippet.thumbnails.high.url}' style='max-width:100%;'></div>
                                                <div class="col-6">
                                                    <h3>${result[i].snippet.title}</h3> 
                                                    <small>${result[i].snippet.publishedAt}</small>
                                                    <p>${result[i].snippet.description}</p>
                                                </div>
                                                <div class="buttons py-3 text-center">
                                                    <button class="btn btn-outline-secondary yt_tone_iobtn" data-type='unrelated' data-content='${i}'>Unrelated</button>
                                                    <button class="btn btn-outline-secondary yt_tone_iobtn" data-type='neutral' data-content='${i}'>Neutral</button>
                                                    <button class="btn btn-outline-danger yt_tone_iobtn" data-type='negative' data-content='${i}'>Negative</button>
                                                    <button class="btn btn-outline-success yt_tone_iobtn" data-type='positive' data-content='${i}'>Positive</button>
                                                </div>
                                            </div>`);
                }
            }
            else{Swal.fire({title:'',text: res.message,icon:'info',confirmButtonText:'Ok'});}
        }
    });
});

$("#get_more_result").click(function(){
    let search_key = $("#search_key").val(); let from_date = $("#from_date").val();
    let to_date = $("#to_date").val(); let loadmore_input = $("#loadmore_input").val();
    let mem_id = $("#mem_id").val(); let item_id = $("#item_id").val();
    $("#results").append(`<em>Search..</em>`);
    $.ajax({
        type:"POST", url:"/youtube_search", 
        data:{search_key:search_key,from_date:from_date,to_date:to_date,loadmore:loadmore_input,mem_id:mem_id,item_id:item_id},
        success:function(res){
            if(res.code==1){
                let result=res.result.items;

                if($("#results").find("em").length){$("#results").find("em").remove();}

                if(res.result.nextPageToken!=""){ $("#loadmore_input").val(res.result.nextPageToken); }
                else{ $("#loadbtn_div").fadeOut(); }
                $("#results").html(``);

                for(let i =0; i<result.length; i++){
                    
                    $("#results").append(`<div class="col-6 mx-auto row my-3" id='yt_${i}'>
                                                <div class="col-6"><img src='${result[i].snippet.thumbnails.high.url}' style='max-width:100%;'></div>
                                                <div class="col-6">
                                                    <h3>${result[i].snippet.title}</h3> 
                                                    <small>${result[i].snippet.publishedAt}</small>
                                                    <p>${result[i].snippet.description}</p>
                                                </div>
                                                <div class="buttons py-3 text-center">
                                                    <button class="btn btn-outline-secondary yt_tone_iobtn" data-type='unrelated' data-content='${i}'>Unrelated</button>
                                                    <button class="btn btn-outline-secondary yt_tone_iobtn" data-type='neutral' data-content='${i}'>Neutral</button>
                                                    <button class="btn btn-outline-danger yt_tone_iobtn" data-type='negative' data-content='${i}'>Negative</button>
                                                    <button class="btn btn-outline-success yt_tone_iobtn" data-type='positive' data-content='${i}'>Positive</button>
                                                </div>
                                            </div>`);
                }
            }
            else{Swal.fire({title:'',text: res.message,icon:'info',confirmButtonText:'Ok'});}
        }
    });
});

$("#results").on("click",".yt_tone_iobtn",function(){
    let type=$(this).data("type"),
    member_id=$("#mem_id").val(),
    search_key=$("#search_key").val();
    let div_id=$(this).data("content");
    $.ajax({
        type:"POST",url:"/tonality_count_youtube",data:{count_type:type,mem_id:member_id,search_key:search_key},
        success:function(res){
            console.log(res);
            if(res.code){
                $(`#yt_${div_id}`).fadeOut(); $(`#${type}`).html(Number($(`#${type}`).html())+1);
                setTimeout(()=>{$(`#yt_${div_id}`).remove();},1000);
            }
            else{
                Swal.fire({title: '',text: res.message,icon: 'info',confirmButtonText: 'Ok'});
            }
        }
    });
});

$("#youtube_comment_tone").submit(function(e){
    e.preventDefault();
    let form=$(this); 
    $("#results").html(`<em>Search..</em>`);
    $.ajax({
        type:"POST", url:"/youtube_comment_counter", data:form.serialize(),
        success:function(res){

            if("nextPageToken" in res.result){if(res.result.nextPageToken!=""){$("#loadmore_input").val(res.result.nextPageToken);}}
            else{$("#loadmore_input").val(""); $("#more_youtube_comment_tone").fadeOut();}

            //console.log(res.result.nextPageToken);
            //console.log(res.result.items[0].snippet.topLevelComment.snippet);

            if(res.code==1){
                let result=res.result.items;
                $("#results").html(``);
                for(let i =0; i<result.length; i++){
                    $("#results").append(`<div class='col-6 mx-auto my-3 border p-1' id='yt_${i}'>
                                                <div class='text-center p-4'>${res.result.items[i].snippet.topLevelComment.snippet.textOriginal}</div>
                                                <div class="buttons py-3 text-center">
                                                    <button class="btn btn-outline-secondary yt_com_tone_iobtn" data-type='unrelated' data-content='${i}'>Unrelated</button>
                                                    <button class="btn btn-outline-secondary yt_com_tone_iobtn" data-type='neutral' data-content='${i}'>Neutral</button>
                                                    <button class="btn btn-outline-danger yt_com_tone_iobtn" data-type='negative' data-content='${i}'>Negative</button>
                                                    <button class="btn btn-outline-success yt_com_tone_iobtn" data-type='positive' data-content='${i}'>Positive</button>
                                                </div>
                                            </div>`);
                }
            }
            else{
                $("#loadmore_input").val(""); $("#loadbtn_div").fadeOut(); 
                Swal.fire({title:'',text: res.message,icon:'info',confirmButtonText:'Ok'});
            }
        }
    });
});

$("#results").on("click",".yt_com_tone_iobtn",function(){
    let type=$(this).data("type"),member_id=$("#mem_id").val(),video_id=$("#video_id").val();
    let div_id=$(this).data("content");
    $.ajax({
        type:"POST",url:"/tonality_count_youtube_comment",
        data:{count_type:type,mem_id:member_id,video_id:video_id},
        success:function(res){
            if(res.code){
                $(`#yt_${div_id}`).fadeOut(); $(`#${type}`).html(Number($(`#${type}`).html())+1);
                setTimeout(()=>{$(`#yt_${div_id}`).remove();},1000);
            }
            else{
                Swal.fire({title: '',text: res.message,icon: 'info',confirmButtonText: 'Ok'});
            }
        }
    });
});

$("#more_youtube_comment_tone").click(function(){
    let video_title=$("#video_title").val(),page_name=$("#page_name").val(),
    video_id=$("#video_id").val(),token=$("#loadmore_input").val(),
    mem_id=$("#mem_id").val();
    if(video_title==""||page_name==""||video_id==""){return;}
    $("#results").html(`<em>Search..</em>`);
    alert(token);
    $.ajax({
        type:"POST", url:"/youtube_comment_counter", data:{video_title:video_title,video_id:video_id,mem_id:mem_id,loadmore:token,page_name:page_name},
        success:function(res){

            console.log(res);
            //console.log(res.result.items[0].snippet.topLevelComment.snippet);

            if(res.code==1){
                let result=res.result.items;

                if(res.result.nextPageToken!=""){$("#loadmore_input").val(res.result.nextPageToken);}
                else{$("#loadbtn_div").fadeOut();}

                $("#results").html(``);

                for(let i =0; i<result.length; i++){
                    
                    $("#results").append(` <div class='col-6 mx-auto my-3 border p-1' id='yt_${i}'>
                                                <div class='text-center p-4'>${res.result.items[i].snippet.topLevelComment.snippet.textOriginal}</div>
                                                <div class="buttons py-3 text-center">
                                                    <button class="btn btn-outline-secondary yt_com_tone_iobtn" data-type='unrelated' data-content='${i}'>Unrelated</button>
                                                    <button class="btn btn-outline-secondary yt_com_tone_iobtn" data-type='neutral' data-content='${i}'>Neutral</button>
                                                    <button class="btn btn-outline-danger yt_com_tone_iobtn" data-type='negative' data-content='${i}'>Negative</button>
                                                    <button class="btn btn-outline-success yt_com_tone_iobtn" data-type='positive' data-content='${i}'>Positive</button>
                                                </div>
                                            </div>`);
                }
            }
            else{Swal.fire({title:'',text: res.message,icon:'info',confirmButtonText:'Ok'});}
        }
    });
});

//get influensor statistics
$("#influensor_stats").submit(function(e){
    e.preventDefault();
    let form=$(this);
    let res_tr=`<tr id="inf_respose"><td class="text-center" colspan="4"><em>Processing, wait..</em></td><td></td></tr>`;
    $("#data_results").find(".tr_data").remove();  $("#tweets_counters").html("..");  $("#replies_counters").html("..."); 
    $("#retweets_counters").html(".."); $("#data_results").find("#inf_respose").remove(); $("#data_results").append(res_tr);
    $.post({
        type:"POST",url:"/influencers_tracker", data:form.serialize(),
        success:function(res){
            $("#tweets_counters").html(res.tweet_num);  $("#replies_counters").html(res.replie_num); 
            $("#retweets_counters").html(res.rt_num); $("#data_results").find("#inf_respose").remove(); 
            $("#data_results").append(res.data);
            if(res.code==0){$("#data_results").find("#inf_respose").fadeOut(5000);}
        }
    })
});

$("#download_influencers_csv").click(function(){
    let from,to,pageid;
    from=$("#from").val();to=$("#to").val();pageid=$("#pageid").val();
    $.ajax({
        type:"POST", url:"/get_Influencers_Csv", data:{from_date:from,to_date:to,pageid:pageid},
        success:function(res){
            if(res.code){
                Swal.fire({ title: '',html: `Your File is ready for download`, icon: 'success', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Download Now' })
                .then((result) => { 
                    if (result.isConfirmed) { window.location=`/downloads/${res.filename.split(".")[0]}`;} 
                    else{
                        $.ajax({    
                            type:"POST",url:"/delete_downloads",data:{filename:res.filename},
                            success:function(dt){
                                if(!dt.code){Swal.fire({title:'',html: dt.message,icon:'warning',confirmButtonText:'Ok'});}
                            }
                        });
                    }
                });
            }
            else{Swal.fire({title:'',text: res.message,icon:'info',confirmButtonText:'Ok'});}
        }
    });
});

$("#download_dailtone_csv").click(function(){
    let from,to,keyword_id;
    from=$("#from").val();to=$("#to").val();keyword_id=$("#keyword_id").val();
    $.ajax({
        type:"POST", url:"/get_dailtonality_csv", data:{from:from,to:to,keyword_id:keyword_id},
        success:function(res){
            if(res.code){
                Swal.fire({ title: '',html: `Your File is ready for download`, icon: 'success', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Download Now' })
                .then((result) => { 
                    if (result.isConfirmed) { window.location=`/downloads/${res.filename.split(".")[0]}`;} 
                    else{
                        $.ajax({    
                            type:"POST",url:"/delete_downloads",data:{filename:res.filename},
                            success:function(dt){
                                if(!dt.code){Swal.fire({title:'',html: dt.message,icon:'warning',confirmButtonText:'Ok'});}
                            }
                        });
                    }
                });
            }
            else{Swal.fire({title:'',text: res.message,icon:'info',confirmButtonText:'Ok'});}
        }
    });
});

$("#download_tonality_csv").click(function(){
    let media_selected,from,to;
    media_selected=$("#media_selected").val(),from=$("#from").val(),$("#to").val();
    $.ajax({
        type:"POST", url:"/download_tonality_csv", data:{media_type:media_selected,fromdate:from,todate:to},
        success:function(res){
            if(res.code){
                Swal.fire({ title: '',html: `Your File is ready for download`, icon: 'success', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Download Now' })
                .then((result) => { 
                    if (result.isConfirmed) { window.location=`/downloads/${res.filename.split(".")[0]}`;} 
                    else{
                        $.ajax({
                            type:"POST",url:"/delete_downloads",data:{filename:res.filename},
                            success:function(dt){
                                if(!dt.code){Swal.fire({title:'',html: dt.message,icon:'warning',confirmButtonText:'Ok'});}
                            }
                        });
                    }
                });
            }
            else{Swal.fire({title:'',text: res.message,icon:'info',confirmButtonText:'Ok'});}
        }
    });
});

//create messages csv and download them
$("#download_messages_csv").click(function(){
    let from,to;
    from=$("#from").val(),$("#to").val();
    $.ajax({
        type:"POST", url:"/download_messages_csv", data:{fromdate:from,todate:to},
        success:function(res){
            if(res.code){
                Swal.fire({ title: '',html: `Your File is ready for download`, icon: 'success', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Download Now' })
                .then((result) => { 
                    if (result.isConfirmed) { window.location=`/downloads/${res.filename.split(".")[0]}`;} 
                    else{
                        $.ajax({
                            type:"POST",url:"/delete_downloads",data:{filename:res.filename},
                            success:function(dt){
                                if(!dt.code){Swal.fire({title:'',html: dt.message,icon:'warning',confirmButtonText:'Ok'});}
                            }
                        });
                    }
                });
            }
            else{Swal.fire({title:'',text: res.message,icon:'info',confirmButtonText:'Ok'});}
        }
    });
});