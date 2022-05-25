$("form#loginform").submit(function(e){
    e.preventDefault();
    $("#login_res").html(`<em style='color:#fff;'>Progress response..</em>`); 
    var formData = $(this);
    $.ajax({
        type:"POST",url:"/login", data:formData.serialize(),
        success:function(rs){
            if(rs.code==1){
                $("#login_res").html(`<em class='clr_success'>Success Logged In wait..</em>`);
                $("form#loginform").find("input[type=text], input[type=file],textarea").val('');
                window.location="/dashboard";
            }
        }
    });
});