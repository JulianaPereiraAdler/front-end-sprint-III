/*
  --------------------------------------------------------------------------------------------------------------------------------------------------
  Funções Login 
  --------------------------------------------------------------------------------------------------------------------------------------------------
*/

// Função para validar o CPF
function velifica_cpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '') return false;
    if (cpf.length != 11 ||
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999")
        return false;
    add = 0;
    for (i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9)))
        return false;
    add = 0;
    for (i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10)))
        return false;
    return true;
}

// Função para enviar o código de verificação
function enviar_codigo_verificacao(cpf){

    $.ajax({
       url:"http://127.0.0.1:5000/send_confirmation_code",
       type: "POST",
       data:{
            CPF:cpf
       },
       success: function(result){
           console.log(result)
            if (result['status']) {
                $("#btn_send_code").hide()
                $("#btn_login").show()
                $(".cpf_invalido").hide()
                $("#input_codigo_verificacao").prop("disabled",false)
                $("#cpf").prop("disabled",true)
            }else{
                $(".cpf_invalido").find(".text_msg").text(result['message'])
                $(".cpf_invalido").show()
                $("#input_codigo_verificacao").prop("disabled",true)
            }
       },
   
       complete: function(){
            $(".loader_btn_verificacao").hide()
            $("#btn_send_code").prop("disabled",false)
       },
   
       beforeSend: function(){
            $(".loader_btn_verificacao").show()
            $("#btn_send_code").prop("disabled",true)
       }
   
     });
}

// Função para fazer o login
function fazer_login(cpf, codigo){
    $.ajax({
       url:"http://127.0.0.1:5000/login",
       type: "POST",
       data:{
            CPF: cpf,
            codigo: codigo
       },
   
       success: function(result){
           if (result['message']=="wrong_code") {
                $(".codigo_invalido").show()
            }else{
                const token = result['token']
                localStorage.setItem('authToken', token)
                window.location.href = "index.html" 
                $(".codigo_invalido").hide()
            }
       },
   
       complete: function(){
            $(".loader_btn_login").hide()
            $("#btn_login").prop("disabled",false)
       },
   
       beforeSend: function(){
            $(".loader_btn_login").show()
            $("#btn_login").prop("disabled",true)
       }
     });
}

// Função para validar o email
function validateEmail(email_val) {
    var emailRegex = /^([a-zA-Z0-9_\.\+\-])+\@(([a-zA-z0-9\-])+\.)+([a-zA-Z0-9]{2,4})$/;
    return emailRegex.test(email_val);
}

// Função para conferir se o CPF já cadastrado
function conferir_se_cpf_existe(cpf, nome_usuario, data_nascimento, email) {
    $.ajax({
        url:"http://127.0.0.1:5000/conferir_se_cpf_existe",
        type: "POST",
        data:{
            CPF: cpf
        },
    
        success: function(result){
            console.log(result)
            if (result['status']==true) {
                $(".cpf_novo_invalido").find(".text_msg").text(result['message'])
                $(".cpf_novo_invalido").show()
                $(".loader_btn_cadastrar_usuario").hide()
                $("#btn_cadastrar_usuario").prop("disabled",false)
            }else{
                $(".cpf_novo_invalido").find(".text_msg").text("")
                $(".cpf_novo_invalido").hide()
                cadastrar_novo_usuario(cpf, nome_usuario, data_nascimento, email)
            }
        },
    
        beforeSend: function(){
             $(".loader_btn_cadastrar_usuario").show()
             $("#btn_cadastrar_usuario").prop("disabled",true)
        }
      });
 }

// Função para cadastrar um novo usuário
function cadastrar_novo_usuario(cpf, nome_usuario, data_nascimento, email) {
    $.ajax({
        url:"http://127.0.0.1:5000/cadastrar_novo_usuario",
        type: "POST",
        data:{
            cpf: cpf,
            nome_usuario: nome_usuario,
            data_nascimento: data_nascimento,
            email: email
        },
    
        success: function(result){
            if (result== "success") {
                $(".campos_cadastro_usuario").hide()
                $(".campos_usuario_cadastrado").show()
                $(".cpf").val(cpf)
            }
        },
    
        complete: function(){
             $(".loader_btn_cadastrar_usuario").hide()
             $("#btn_cadastrar_usuario").prop("disabled",false)
        }
      });
 }


// -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
$(document).ready(function($){

	$("#cpf").mask("999.999.999-99")
    $("#cpf_novo").mask("999.999.999-99")

});

//__________________________________________________________________________________________________________________________________________________

$(document).on("blur", "#cpf", function(){
    var cpf = $("#cpf").val()
    if(velifica_cpf(cpf) == false){
        $("#cpf").removeClass("is-valid")
        $("#cpf").addClass("is-invalid")
        $(".cpf_invalido").show()
    }
    else{
        $(".cpf_invalido").hide()
        $("#cpf").removeClass("is-invalid")
        //$("#cpf").addClass("is-valid")
    }
}) 

$(document).on("blur", "#cpf_novo", function(){
    var cpf = $("#cpf_novo").val()
    if(velifica_cpf(cpf) == false){
        msg_text = "CPF inválido."
        $("#cpf_novo").removeClass("is-valid")
        $("#cpf_novo").addClass("is-invalid")
        $(".cpf_novo_invalido").find(".text_msg").text(msg_text)
        $(".cpf_novo_invalido").show()
    }
    else{
        $(".cpf_novo_invalido").hide()
        $("#cpf_novo").removeClass("is-invalid")
        //$("#cpf").addClass("is-valid")
    }
}) 

$(document).on("click", "#btn_send_code", function(e){
    e.preventDefault();
    e.stopPropagation();

    var cpf = $("#cpf").val()
    if (velifica_cpf(cpf)){
        $("#cpf_invalido").hide()
        enviar_codigo_verificacao(cpf)
    }else{
        msg_text = "CPF inválido."
        $("#cpf_invalido").find(".text_msg").text(msg_text)
        $("#cpf_invalido").show()
    }
})

$(document).on("click", "#btn_login", function(e){
    e.preventDefault();
    e.stopPropagation();

    var cpf = $("#cpf").val()
    var codigo = $("#input_codigo_verificacao").val()

    if(cpf != '' && codigo != ''){
        fazer_login(cpf, codigo)
    }
})

$(document).on("click", ".btn_fazer_cadastro", function(e){
    e.preventDefault()
    e.stopPropagation()

    var cpf = $("#cpf").val()
    $("#cpf_novo").val(cpf)

    $(".campos_cadastro_usuario").show()
    $(".campos_usuario_cadastrado").hide()
    $(".cpf_invalido").hide()
})

$(document).on("click", ".btn_voltar_login", function(e){
    e.preventDefault()
    e.stopPropagation()

    var cpf_novo = $("#cpf_novo").val()
    $("#cpf").val(cpf_novo)

    $(".campos_cadastro_usuario").hide()
    $(".campos_usuario_cadastrado").show()
})

$(document).on("blur", "#email, #email_verify", function(){

    var email1 = $("#email").val();
    var email2 = $("#email_verify").val();

    $(".erro_email").hide()
    $(".erro_verify_email").hide()
    $("#btn_cadastrar_usuario").prop("disabled",false)

    if (!validateEmail(email1)) {
        msg_erro = "O e-mail não é válido."
        $(".erro_email").find('.text_msg').text(msg_erro)
        $(".erro_email").show()
        $("#btn_cadastrar_usuario").prop("disabled",true)
    }

    if ( email1 !== email2) {
        msg_erro = "Os e-mails não são iguais."
        $(".erro_email").find('.text_msg').text(msg_erro)
        $(".erro_email").show()
        $("#btn_cadastrar_usuario").prop("disabled",true)
    }

})

$(document).on("click", "#btn_cadastrar_usuario", function(e){
    e.preventDefault();
    e.stopPropagation();

    $(".cpf_novo_invalido").hide()
    $(".data_nascimento_invalido").hide()
    $(".nome_usuario_invalido").hide()

    var cpf = $("#cpf_novo").val()
    var nome_usuario = $("#nome_usuario").val()
    var data_nascimento = $("#data_nascimento").val()
    var email = $("#email").val()
    var email_verify = $("#email_verify").val()

    if (cpf == ""){
        msg_text = "Preencha este campo."
        $(".cpf_novo_invalido").find(".text_msg").text(msg_text)
        $(".cpf_novo_invalido").show()
        return false
    }

    if (!velifica_cpf(cpf)){
        msg_text = "CPF inválido"
        $(".cpf_novo_invalido").find(".text_msg").text(msg_text)
        $(".cpf_novo_invalido").show()
        return false
    }

        if (nome_usuario == ""){
        msg_text = "Preencha este campo."
        $(".nome_usuario_invalido").find(".text_msg").text(msg_text)
        $(".nome_usuario_invalido").show()
        return false
    }

    if (data_nascimento == ""){
        msg_text = "Preencha este campo."
        $(".data_nascimento_invalido").find(".text_msg").text(msg_text)
        $(".data_nascimento_invalido").show()
        return false
    }

    if (email == ""){
        msg_text = "Preencha este campo."
        $(".erro_email").find(".text_msg").text(msg_text)
        $(".erro_email").show()
        return false
    }
    
    if (email_verify == ""){
        msg_text = "Preencha este campo."
        $(".erro_verify_email").find(".text_msg").text(msg_text)
        $(".erro_verify_email").show()
        return false
    }

    conferir_se_cpf_existe(cpf, nome_usuario, data_nascimento, email)
})

$(document).on("click", ".btn_cancelar", function(){
    $("#cpf").val("")
    $("#cpf").prop("disabled",false)
    $("#input_codigo_verificacao").val("")
    $("#input_codigo_verificacao").prop("disabled",true)
    $("#cpf_novo").val("")
    $("#data_nascimento").val("")
    $("#nome_usuario").val("")
    $("email").val("")
    $("email_verify").val("")
})


