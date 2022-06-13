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

$("form#newbystander").submit(function(e){
    e.preventDefault();$("#newbystander_res").fadeIn();
    $("#newbystander_res").html(`<em style='color:#fff;'>processing..</em>`); 
    var formData = $(this);
    $.ajax({
        type:"POST",url:"/newbystander", data:formData.serialize(),
        success:function(rs){
            $("#newbystander_res").fadeOut(5000);
            setTimeout(()=>{$("#newbystander_res").html("");},5000);
            if(rs.code==1){
                $("form#newbystander").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val(''); 
                $("#newbystander_res").html(`<em class='clr_success'>${rs.message}</em>`);
            }
            else{$("#newbystander_res").html(`<em class='clr_fuiler'>${rs.message}</em>`);}
        }
    });
});

$("body").on('click','.delete_bystander',function(){
    let listernerid=$(this).data("id");
    Swal.fire({
        title: 'Are you sure?',html: `You want to delete this listener from the list`, icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
    })
    .then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type:"POST",url:"/delete_bystander", data:{listernerid:listernerid},
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

$("form#new_keyword").submit(function(e){
    e.preventDefault();$("#new_keyword_res").fadeIn();
    $("#new_keyword_res").html(`<em style='color:#fff;'>processing..</em>`); 
    var formData = $(this);
    $.ajax({
        type:"POST",url:"/new_keyword", data:formData.serialize(),
        success:function(rs){
            $("#new_keyword_res").fadeOut(5000);
            setTimeout(()=>{$("#new_keyword_res").html("");},5000);
            if(rs.code==1){
                $("form#new_keyword").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val(''); 
                $("#new_keyword_res").html(`<em class='clr_success'>${rs.message}</em>`);
            }
            else{$("#new_keyword_res").html(`<em class='clr_fuiler'>${rs.message}</em>`);}
        }
    });
});

$("body").on("click","#delete_keyword", function(){
    let keyword_id=$("#keyword_id").val().split("-");
    Swal.fire({
        title: 'Are you sure?',html: `You want to delete current keyword`, icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#3085d6', cancelButtonColor: '#e64033', confirmButtonText: 'Yes, delete!'
    })
    .then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type:"POST",url:"/delete_keyword", data:{keyword_id:keyword_id[1]},
                success:function(rs){
                    if(rs.code==1){
                        $(`#delete_keyword option[value='${keyword_id}']`).remove();
                        Swal.fire('SUCCESS', `${rs.message}`,'success'); location.reload();
                    }
                    else{ Swal.fire('Error', `${rs.message}`,'warning'); }
                }
            });
        }
    });
});

$("form#new_listener").submit(function(e){
    e.preventDefault();$("#new_listener_res").fadeIn();
    $("#new_listener_res").html(`<em style='color:#fff;'>processing..</em>`); 
    var formData = $(this);
    $.ajax({
        type:"POST",url:"/new_listener", data:formData.serialize(),
        success:function(rs){
            $("#new_listener_res").fadeOut(5000);
            setTimeout(()=>{$("#new_listener_res").html("");},5000);
            if(rs.code==1){
                $("form#new_listener").find("input[type=email],input[type=tel],input[type=password],input[type=text],textarea").val(''); 
                $("#new_listener_res").html(`<em class='clr_success'>${rs.message}</em>`);
            }
            else{$("#new_listener_res").html(`<em class='clr_fuiler'>${rs.message}</em>`);}
        }
    });
});

$("body").on("click",".delete_keywords", function(){
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

$("#tone_item_form").submit(function(e){
    e.preventDefault(); let form = $(this); $("#response").html(`<em>Processing..</em>`);
    $.ajax({
        type:"POST",url:"/add_newtone",data:form.serialize(),
        success:function(res){
            $("#form").modal("toggle"); 
            if(res.code==1){
                Swal.fire('SUCCESS', `${res.message}`,'success');
                $("#tr_total").before(res.tag);
            }
            else{
                Swal.fire('Error', `${res.message}`,'warning');
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
        $("table").find(".positive").each(function(){let vl=Number($(this).html());total_negative+=vl;});
        $("table").find(".positive").each(function(){let vl=Number($(this).html());total_neutral+=vl;});
        $("table").find(".positive").each(function(){let vl=Number($(this).html());total_unrelated+=vl;});
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


//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

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

//media bot
$("#media_bots").on("click",".copy_pass", function(){
    let pass=$(this).data("password");
    navigator.clipboard.writeText(pass);
    alert("password is coppied!");
});

//new platform
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

//edit platform
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

//delete platform
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
            alert(result.value.impression)
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

$("#user_names").change(function(){
    let uname = $(this).find(':selected').data('uname');
    let pass = $(this).find(':selected').data('pass');
    $("#uname").html(uname);
    $("#pass").html(pass);
});

//get search result
$("#get_statistic").click(function(){
    let user_names = $("#user_names").val();
    let start_date = $("#start_date").val();
    $.ajax({
        type:"POST",url:"./get_twitts",data:{bot_id:user_names,date:start_date},
        success:function(res){
            alert(res);
            $("#twets_result").html(res.result);
        }
    });
});

/* $("#get_statistic").click(function(){
    let  user_names,start_date,end_date,type;
    user_names=$("#user_names").val(); start_date=$("#start_date").val();
    end_date=$("#end_date").val(); type=$("#type").val();
    $.ajax({
        type:"POST",url:"./get_twitts", data:{user_names:user_names,start_date:start_date,end_date:end_date,type:type},
        success:function(rs){
            alert(rs);
            if(rs.code==1){
                Swal.fire('SUCCESS', `${rs.message}`,'success'); 
                $(`#tr_${platform_id}`).fadeOut(1000); setTimeout(()=>{$(`#tr_${platform_id}`).remove();},1200);
            }
            else{ Swal.fire('Error', `${rs.message}`,'warning'); }
        }
    });
}); */

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
                Swal.fire('SUCCESS', `${rs.message}`,'success'); 
                let ele_num=$("#tonality_member").find("tr").length;
                $("#tonality_member").append(`<tr class='tr' id='tr_${res.mid}'>
                                            <td>${ele_num+1}</td> <td>${res.member_name}</td>
                                            <td>
                                                <span class="badge badge-danger delete_member" role='button' data-mname='${res.member_name}' data-id='${res.mid}'>Delete</span>
                                                <span class="badge badge-primary reset_password" role='button' data-mname='${res.member_name}' data-id='${res.mid}'>Reseat Password</span>
                                            </td>
                                        </tr>`);
            }
            else{
                Swal.fire('ERROR', `${rs.message}`,'error'); 
            }
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



$("body").on('click','.reset_password',function(){
    let trid=$(this).data("id");
    let mname=$(this).data("mname");
    Swal.fire({
        title: 'RESET PASSWORD',
        html: `<input type="text" id="new_pass" class="swal2-input" placeholder="Enter new password">`,
        confirmButtonText: 'CHANGE PASSWORD',focusConfirm: false,
        preConfirm: () => {
            let new_pass = Swal.getPopup().querySelector('#new_pass').value;
            if (!new_pass) {Swal.showValidationMessage(`Suppy new password!`);}
            return {new_pass:new_pass}
        }
    })
    .then((result) => {
        if(result.isConfirmed){
            $.ajax({
                type:"POST",url:"/reset_tone_pass", data:{mname:mname,memberid:trid,new_pass:result.value.new_pass},
                success:function(rs){
                    if(rs.code==1){
                        Swal.fire({title: '',html: rs.message,icon: 'success',confirmButtonText: 'Ok'});
                    }
                    else{Swal.fire({title: '',text: rs.message,icon: 'info',confirmButtonText: 'Ok'});}
                }
            });
        }
    });
});
