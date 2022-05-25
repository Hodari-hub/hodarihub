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