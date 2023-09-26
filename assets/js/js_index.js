var cadastro_preenchido = 0
var itis = []
var iti_number = 0
var IDCadastro = 0
var IDUsuario = 0
var NomeUsuario = 0 
var perfil_risco_preenchido = 0
var progressoFicha = 0
var progressoDiq = 0
var progressoRisco = 0
var status_cadastro = ""

const token = localStorage.getItem('authToken')

var api_key = "eyJzYWx0IjogIldHWkdMWnVYTnExRERkV0JDclZkYUE9PSIsICJpdiI6ICJEVDZzbU1SNFQrdWVjZWl4bkMrdjZ3PT0iLCAiY2lwaGVydGV4dCI6ICJrVnN3Tk9JNkRGdW1tL0JQZm1kcTNSV2E2ZXVXT3c0aU14U0FrNEQ5M1l0akcrQVVUalNkIn0="
var email_aml = "jpereira@atmoscapital.com.br"
var key_api_externa_countrystatecity = "Tldqa0ZhMWs1VzhaT0FqcFpJNlZZSVQwdGZya21uZkszQ3ZkZjAzRA=="

/*
  --------------------------------------------------------------------------------------------------------------------------------------------------
  Funções 
  --------------------------------------------------------------------------------------------------------------------------------------------------
*/

function verificar_login_realizado(){
  //verifica se login foi realizado
  $.ajax({
    url: "http://127.0.0.1:5000/verificar_login_realizado",
    type: "GET",
    headers: {
        'Authorization': 'Bearer ' + token 
    },
    success: function(result){
      IDUsuario = result['IDusuario']
      NomeUsuario = result['nome']	
      $(".resumo_cotista").data("id_usuario", IDUsuario)	
      $(".resumo_cotista").text(NomeUsuario)

      conferir_status_cadastro(IDUsuario)
    },
    statusCode: {
      401: function() {
        logout()
      }
    },
    complete: function(){
    },
    beforeSend: function(){
    }
  })

}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function inserir_log_atividade(IDUsuario,atividade){
  //busca logs das atividades e preenche a card 'Histórico de Atividades'

  $.ajax({
  url: "http://127.0.0.1:5000/inserir_log_atividade",
  type: "POST",
  headers: {
    'Authorization': 'Bearer ' + token 
  },
  data:{
    IDUsuario:parseInt(IDUsuario),
    Atividade:atividade,
  },
  success: function(result){
  },
  complete: function(){
    preencher_historico_atividades(IDUsuario)
  }})

}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function preencher_historico_atividades(IDUsuario){
  //busca logs das atividades e preenche a card 'Histórico de Atividades'

  $.ajax({
  url: "http://127.0.0.1:5000/busca_log_atividade",
  type: "POST",
  headers: {
    'Authorization': 'Bearer ' + token 
  },
  data:{
      IDUsuario:parseInt(IDUsuario),
  },
  success: function(result){
    $("#tabela_historico_atividades").DataTable({
      destroy: true,
      "pageLength": 25,
      searching: false,
      data : result,
      columns: [
        { data: 'Status', width: "80%"},
        { data: 'Timestamp', width: "20%"},
        ],
        order: [[1, "desc"]],
    })
  },
  complete: function(){
  }, 

  beforeSend: function(){
  }
  })

}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function conferir_status_cadastro(IDUsuario){
  //confere status do cadastro do usuário e preenche a card 'Resumo do Cotista'

  $.ajax({
    url: "http://127.0.0.1:5000/conferir_status_cadastro",
    type: "POST",
    headers: {
      'Authorization': 'Bearer ' + token 
    },
    data:{
        IDUsuario:parseInt(IDUsuario),
    },
    success: function(result){
      if (result['Status'] == "Sem Cadastro"){
        $(".sem_cadastro").show()
        $(".resumo_status").text("Sem Cadastro")
        $(".resumo_status").show()
        $(".card_info_cadastro").hide()
        status_cadastro = "Sem Cadastro"
      }if (result['Status'] == "Cadastro Inicializado") {
        $(".status_cadastro_inicializado").show()
        $(".resumo_status").text("Cadastro Inicializado")
        $(".resumo_status").show()
        $(".resumo_cotista").data("id_cadastro", result['IDCadastro'])

        if (result['Cotitular']==0) {
          $(".tipo_conta").trigger("change").val("Individual")
          $(".div_cotitular").hide()
        }else if (result['Cotitular']==1) {
          $(".tipo_conta").trigger("change").val("Conjunta")
          $(".div_cotitular").show()
        }
        IDCadastro = result['IDCadastro']
        $(".card_info_cadastro").show()
      } if (result['Status'] == "Em Aprovação") {
        $(".cadastro_em_aprovacao").show()
        $(".resumo_status").text("Em Aprovação")
        $(".resumo_status").show()
        $(".resumo_cotista").data("id_cadastro", result['IDCadastro'])

        if (result['Cotitular']==0) {
          $(".tipo_conta").trigger("change").val("Individual")
          $(".div_cotitular").hide()
        }else if (result['Cotitular']==1) {
          $(".tipo_conta").trigger("change").val("Conjunta")
          $(".div_cotitular").show()
        }
        IDCadastro = result['IDCadastro']
        $(".card_info_cadastro").hide()
      }
    },
    complete: function(){
      $(".obrigatorio_vazio").attr("disabled", true)
      $(".dados_cotista").attr("disabled", true)
      $(".option_perfil_risco").attr("disabled", true)
      preencher_historico_atividades(IDUsuario)
      fill_select_pais("select_pais", IDCadastro)
      $(".spinner_status").hide()
    }, 

    beforeSend: function(){
      $(".status_cadastro").hide()
      iniciar_campo_telefone()
      $(".progress_ficha_cadastral").css("width", "0%")
      $(".porcentagem_ficha_cadastral").text("0")
      $(".spinner_status").show()
    }
  })

}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function buscar_info_cadastro(IDCadastro){
  //confere status do cadastro do usuário e preenche a card 'Resumo do Cotista'

  lista_pula = [74,75,8,7,9]
  endereco = {}

  $.ajax({
  url: "http://127.0.0.1:5000/buscar_info_cadastro",
  type: "POST",
  headers: {
    'Authorization': 'Bearer ' + token 
  },
  data:{
    IDCadastro:parseInt(IDCadastro),
  },
  success: function(result){

    $.each(result, function (i, info_cadastro){
      cotitular = info_cadastro['Cotitular']
      IDAtributo = info_cadastro['IDAtributo']  
      Valor = info_cadastro['Valor']
      Tipo = info_cadastro['Tipo']
      TipoFicha = info_cadastro['TipoFicha']

      card = $(".card_"+TipoFicha)
      div = ".div_ficha_cadastral"
      if (cotitular == "1"){
        div = ".div_ficha_cadastral_cotitular"
      }

      if(lista_pula.includes(IDAtributo)){
        if (!endereco.hasOwnProperty(cotitular)) {
          endereco[cotitular] = {};
        }
        endereco[cotitular][IDAtributo] = Valor;
        return true;
      }

      if(Tipo == "input"){	
        card.find(div).find(".dados_cotista[data-id_atributo="+IDAtributo+"]").val(Valor)
      }else if (Tipo == "input_telefone"){
        n_iti = card.find(div).find(".dados_cotista[data-id_atributo="+IDAtributo+"]").data("iti_number")
        itis[n_iti].setNumber(Valor)
      }else if (Tipo == "select"){
        card.find(div).find(".dados_cotista[data-id_atributo="+IDAtributo+"]").trigger("change").val(Valor)
      }else if(Tipo == "checkbox"){
        if (Valor == "true"){
          Valor = true
        }else{
          Valor = false
        }
        if(TipoFicha=="ficha_cadastral"){
          card.find(div).find(".dados_cotista[data-id_atributo="+IDAtributo+"]").prop('checked', Valor)
        }
        if(TipoFicha=="diq"){
          card.find(".dados_diq[data-id_atributo="+IDAtributo+"]").prop('checked', Valor)
        }
        
      }else if(Tipo=="radio"){
        if(TipoFicha=="ficha_cadastral"){
          card.find(div).find(".dados_cotista[data-id_atributo="+IDAtributo+"][value='"+Valor+"']").prop('checked', true)
        }
        if(TipoFicha=="perfil_risco"){
          card.find(".tab-pr[data-id_atributo="+IDAtributo+"] input[value='"+Valor+"']").prop('checked', true)
        }
        if(TipoFicha=="diq"){
          card.find(".dados_diq[data-id_atributo="+IDAtributo+"] input[value='"+Valor+"']").prop('checked', true)
        }
      }

      if (IDAtributo == 4) {
        if (Valor == "Solteiro"){
          $(div).find(".div_casado").hide()
        }else{
          $(div).find(".div_casado").show()
        }
      }

      if (IDAtributo == 10) {
        if (Valor == "Sim"){
          $(div).find(".div_outras_cidadanias").show()
        }else{
          $(div).find(".div_outras_cidadanias").hide()
        }
      }

      if (IDAtributo == 17) {
        if (Valor != ""){
          $(div).find(".div_DomicílioFiscal2").show()
          $(div).find(".div_DomicílioFiscal2").addClass("ativo")
          $(div).find(".div_btn_DomicílioFiscal2").show()
          $(div).find(".div_btn_DomicílioFiscal1").hide()
        }else{
          $(div).find(".div_DomicílioFiscal2").hide()
          $(div).find(".div_btn_DomicílioFiscal2").hide()
          $(div).find(".div_btn_DomicílioFiscal1").show()
        }
      }

      if (IDAtributo == 20) {
        if (Valor != ""){
          $(div).find(".div_DomicílioFiscal3").show()
          $(div).find(".div_btn_DomicílioFiscal2").hide()
          $(div).find(".div_btn_DomicílioFiscal3").show()
        }else{
          $(div).find(".div_DomicílioFiscal3").hide()
          $(div).find(".div_btn_DomicílioFiscal3").hide()
          if ($(div).find(".div_DomicílioFiscal2").hasClass("ativo")){
            $(div).find(".div_btn_DomicílioFiscal2").show()
          }else{
            $(div).find(".div_btn_DomicílioFiscal2").hide()
          }
        }
      }
       
      if (IDAtributo == 42) {
        if (Valor == true){
          $(div).find(".div_OcupacaoProfissional").hide()
          $(div).find(".div_ResponsavelFinanceiro").show()
        }else{
          $(div).find(".div_OcupacaoProfissional").show()
          $(div).find(".div_ResponsavelFinanceiro").hide()
        }
      }

      if (IDAtributo == 54) {
        if (Valor == true){
          $(div).find(".div_NaoResidentes").show()
        }else{
          $(div).find(".div_NaoResidentes").hide()
        }
      }

      if(IDAtributo == 32){ 
        div_end = ".div_ficha_cadastral"
        if (cotitular == "1"){
          div_end = ".div_ficha_cadastral_cotitular"
        }
        if(Valor == "Brasil"){
            $(div_end).find(".div_end").find(".end_localizado_br").show()
            $(div_end).find(".div_end").find(".end_localizado_fora").hide()
            $(div_end).find(".div_end").find(".localizacao_end").trigger("change").val("BR")
          }else{
            $(div_end).find(".div_end").find(".div_cotitular").show()
            $(div_end).find(".div_end").find(".end_localizado_br").hide()
            $(div_end).find(".div_end").find(".end_localizado_fora").show()
            $(div_end).find(".div_end").find(".localizacao_end").trigger("change").val("fora")
        }
      }

      if(IDAtributo == 40){ 
        div_end = ".div_ficha_cadastral"
        if (cotitular == "1"){
          div_end = ".div_ficha_cadastral_cotitular"
        }
        if (Valor!="") {
          $(div_end).find(".div_outro_endereco").show()
          $(div_end).find(".btn_outro_endereco").hide()
          if(Valor == "Brasil"){
              $(div_end).find(".div_end_2").find(".end_localizado_br").show()
              $(div_end).find(".div_end_2").find(".end_localizado_fora").hide()
              $(div_end).find(".div_end_2").find(".localizacao_end").trigger("change").val("BR")
            }else{
              $(div_end).find(".div_end_2").find(".div_cotitular").show()
              $(div_end).find(".div_end_2").find(".end_localizado_br").hide()
              $(div_end).find(".div_end_2").find(".end_localizado_fora").show()
              $(div_end).find(".div_end_2").find(".localizacao_end").trigger("change").val("fora")
          }
        }
      }

      
    })

  },
  complete: function(){
    if(endereco!=null){
      $.each(endereco, function (cotitular, info_end){

        card = $(".card_ficha_cadastral")
        div = ".div_ficha_cadastral"
        if (cotitular == "1"){
          div = ".div_ficha_cadastral_cotitular"
        }

        if(info_end[7] != null && info_end[74] != null){
          if (card.find(div).find(".select_pais").find("option").length == 0) {
            $(card.find(div).find(".select_pais")).append($('<option>', {
              value: info_end[7],
              text: info_end[7], 
              countryCode: info_end[74]
            }))
          }else{
            $(card.find(div).find(".select_pais").trigger("change").val(info_end[7]))
          }
        }

        if(info_end[8] != null && info_end[74] != null){
          if (card.find(div).find(".select_estado").find("option").length == 0) {
            $(card.find(div).find(".select_estado")).append($('<option>', {
              value: info_end[8],
              text: info_end[8], 
              statecode: info_end[75],
              countryCode: info_end[74],
            }))
            fill_select_estado(info_end[74], 8, cotitular, info_end[8])
          }else{
            $(card.find(div).find(".select_estado").trigger("change").val(info_end[8]))
          }
        }

        if(info_end[9] != null && info_end[74] != null && info_end[75] != null){
          if (card.find(div).find(".select_cidade").find("option").length == 0) {
            $(card.find(div).find(".select_cidade")).append($('<option>', {
              value: info_end[9],
              text: info_end[9], 
            }))
            fill_select_cidade(info_end[74], info_end[75], 9, cotitular, info_end[9])
          }else{
            $(card.find(div).find(".select_cidade").trigger("change").val(info_end[9]))
          }
        }
      })
    }
    progresso_ficha_cadastral()
    progresso_perfil_risco()
    progresso_diq()

  }, 
  beforeSend: function(){
  }
  })

}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function atualizar_info_cadastro(id_cadastro, id_atributo, cotitular, valor){
  //atualiza informações do cadastro do usuário no banco

  if(cadastro_preenchido == 1){
    if(id_atributo != "" || id_atributo != null){
      $.ajax({
        url: "http://127.0.0.1:5000/atualizar_info_cadastro",
        type: "POST",
        headers: {
          'Authorization': 'Bearer ' + token 
        },
        data:{
          IDCadastro:parseInt(id_cadastro),
          IDAtributo:parseInt(id_atributo),
          Cotitular:parseInt(cotitular),
          Valor:valor,
        },
        success: function(result){
        },
        complete: function(){
          progresso_ficha_cadastral()
        }, 
    
        beforeSend: function(){
        }
      })
    }
  }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function atualizar_perfil_risco(id_cadastro, id_atributo, cotitular, valor){
  //atualiza informações do cadastro do usuário no banco

  if(perfil_risco_preenchido == 1){
    if(id_atributo != "" || id_atributo != null){
      $.ajax({
        url: "http://127.0.0.1:5000/atualizar_info_cadastro",
        type: "POST",
        headers: {
          'Authorization': 'Bearer ' + token 
        },
        data:{
          IDCadastro:parseInt(id_cadastro),
          IDAtributo:parseInt(id_atributo),
          Cotitular:parseInt(cotitular),
          Valor:valor,
        },
        success: function(result){
        },
        complete: function(){
          progresso_perfil_risco()
        }, 
    
        beforeSend: function(){
        }
      })
    }
  }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function atualizar_diq(id_cadastro, id_atributo, cotitular, valor){
  //atualiza informações do cadastro do usuário no banco

  if(id_atributo != "" || id_atributo != null){
    $.ajax({
      url: "http://127.0.0.1:5000/atualizar_info_cadastro",
      type: "POST",
      headers: {
        'Authorization': 'Bearer ' + token 
      },
      data:{
        IDCadastro:parseInt(id_cadastro),
        IDAtributo:parseInt(id_atributo),
        Cotitular:parseInt(cotitular),
        Valor:valor,
      },
      success: function(result){
      },
      complete: function(){
        progresso_diq()
      }, 
  
      beforeSend: function(){
      }
    })
  }

}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function atualizar_cotitular_cadastro(id_cadastro, cotitular){
  //atualiza cotitular do cadastro do usuário no banco
  
  $.ajax({
  url: "http://127.0.0.1:5000/atualizar_cotitular_cadastro",
  type: "POST",
  headers: {
    'Authorization': 'Bearer ' + token 
  },
  data:{
    IDCadastro:parseInt(id_cadastro),
    Cotitular:parseInt(cotitular)
  },
  success: function(result){
  },
  complete: function(){
  }, 

  beforeSend: function(){
  }
  })

}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function voltar_login(){
  
  $.ajax({
  url: "http://127.0.0.1:5000/atualizar_cotitular_cadastro",
  type: "POST",
  data:{
    IDCadastro:parseInt(id_cadastro),
    Cotitular:parseInt(cotitular)
  },
  success: function(result){
  },
  complete: function(){
  }, 

  beforeSend: function(){
  }
  })

}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function validateEmail(email_val) {
  // Função para validar o email
  var emailRegex = /^([a-zA-Z0-9_\.\+\-])+\@(([a-zA-z0-9\-])+\.)+([a-zA-Z0-9]{2,4})$/;
  return emailRegex.test(email_val);
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function iniciar_campo_telefone(){
  $(".campo_telefone").each(function() {
    $(this).attr("data-iti_number",iti_number).data("iti_number",iti_number);
    var itiInstance = window.intlTelInput(this, {
        formatOnDisplay: true,
        allowDropdown: true,
        separateDialCode: true,
        preferredCountries: ['BR', 'US', 'GB', 'PT'],
    });
    itis.push(itiInstance)
    iti_number = iti_number + 1
  })

  $(".campo_telefone").each(function() {
    code = "+" + $(this).closest('.iti').find('.iti__active').data('dial-code')
    masks = {
        '+55': '(00) 00000-0000',
        '+1': '(000) 000-0000',
        '+44': '00000 000000',
        '+54': '000 00-0000-0000',
        '+965': '000 000000',
        '+351': '000 000 000',
        '+35': '000 000 000',
        '+96': '000 000000', 
        '+41': '000 000 00 00',
        '+56': '(0) 0000 0000',
        '+47': '000 00 000',
        '+45': '00 00 00 00',
        '+49': '00000 0000000',
        '+33': '00 00 00 00 00'
    }
    
    if (code in masks){
        $(this).mask(masks[code])
    } else {
        $(this).unmask()
    }
  })
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function roundToTwoDecimalPlaces(number) {
  return Math.round((number + Number.EPSILON) * 100) / 100;
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function progresso_ficha_cadastral() {

  campos_obrigatorios = $(".card_ficha_cadastral").find(".campo_obrigatorio:visible").length 
  campos_vazios = 0

  $(".card_ficha_cadastral").find(".campo_obrigatorio:visible").each(function() {
    tipo = $(this).data("tipo")
    input = $(this)

    if (tipo == "input"){
      valor = input.val()
    }if (tipo == "input_telefone"){
      telefone = input.val()
      valor = telefone
    }if (tipo == "radio") {
      id_atributo = $(this).data("id_atributo")
      name_radio = "atributo_"+id_atributo
      input = $("input[name="+name_radio+"]")
      valor = $("input[name="+name_radio+"]:checked").val()
    } if (tipo == "select") {
      valor = $(this).val()
    }if (tipo == "checkbox") {
      valor = $(this).is(':checked')
    }

    if (valor == "" || valor == null){
      campos_vazios = campos_vazios + 1
      input.addClass("obrigatorio_vazio")
    }else{
      input.removeClass("obrigatorio_vazio")
    }

    // id_atributo = $(this).data("id_atributo")
    // console.log("id_atributo", id_atributo, valor, "perc", ((campos_obrigatorios-campos_vazios) / campos_obrigatorios)*100)
  });

  perc_preenchida = ((campos_obrigatorios-campos_vazios) / campos_obrigatorios)*100
  $(".progress_ficha_cadastral").css("width",  perc_preenchida + "%");
  $(".porcentagem_ficha_cadastral").text(roundToTwoDecimalPlaces(perc_preenchida))

  progressoFicha = perc_preenchida

  if (perc_preenchida == 100) {
    $(".btn_status_ficha_cadastral").text("Finalizada")
    $(".btn_status_ficha_cadastral").addClass("finalizada_ativa")

    $(".bnt_pendencias").removeClass("text-danger")
    $(".bg-ficha_cadastral").removeClass("bg-warning")
    $(".bg-ficha_cadastral").addClass("bg-success")
    $(".bg-ficha_cadastral").removeClass("bg-danger")
    
  }else{
    $(".btn_status_ficha_cadastral").text("Incompleta")
    $(".btn_status_ficha_cadastral").removeClass("finalizada_ativa")
    $(".bnt_pendencias").addClass("text-danger")

    if (perc_preenchida == 0) {
      $(".bg-ficha_cadastral").removeClass("bg-warning")
      $(".bg-ficha_cadastral").removeClass("bg-success")
      $(".bg-ficha_cadastral").addClass("bg-danger")
    }else{
      $(".bg-ficha_cadastral").addClass("bg-warning")
      $(".bg-ficha_cadastral").removeClass("bg-success")
      $(".bg-ficha_cadastral").removeClass("bg-danger")
    }
  }
  progresso_completo()
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function progresso_diq() {

  campos_obrigatorios = $(".card_diq").find(".dados_diq:visible").length
  campos_vazios = 0

  $(".card_diq").find(".dados_diq:visible").each(function() {
    tipo = $(this).data("tipo")
    input = $(this)

    if (tipo == "radio") {
      id_atributo = $(this).data("id_atributo")
      name_radio = "atributo_"+id_atributo
      input = $("input[name="+name_radio+"]")
      valor = $("input[name="+name_radio+"]:checked").val()
    } if (tipo == "checkbox") {
      valor = $(this).is(':checked')
    }

    if (valor == "" || valor == null){
      campos_vazios = campos_vazios + 1
      input.addClass("diq_obrigatorio_vazio")
    }else{
      input.removeClass("diq_obrigatorio_vazio")
    }
  });

  perc_preenchida = ((campos_obrigatorios-campos_vazios) / campos_obrigatorios)*100
  $(".porcentagem_diq").text(roundToTwoDecimalPlaces(perc_preenchida))

  progressoDiq = perc_preenchida

  if (perc_preenchida == 100) {
    $(".btn_status_diq").text("Finalizada")
    $(".btn_status_diq").addClass("finalizada_ativa")

    $(".bg-diq").removeClass("bg-warning")
    $(".bg-diq").addClass("bg-success")
    $(".bg-diq").removeClass("bg-danger")
  }else{
    $(".btn_status_diq").text("Incompleta")
    $(".btn_status_diq").removeClass("finalizada_ativa")

    if (perc_preenchida == 0) {
      $(".bg-diq").removeClass("bg-warning")
      $(".bg-diq").removeClass("bg-success")
      $(".bg-diq").addClass("bg-danger")
    }else{
      $(".bg-diq").addClass("bg-warning")
      $(".bg-diq").removeClass("bg-success")
      $(".bg-diq").removeClass("bg-danger")
    }
  }
  progresso_completo()
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function progresso_perfil_risco() {

  perguntas = $(".card_perfil_risco").find(".tab-pr:visible").length
  perguntas_vazias = 0

  $(".card_perfil_risco").find(".tab-pr:visible").each(function() {
    id_atributo = $(this).data("id_atributo")
    name_radio = "atributo_"+id_atributo
    input = $("input[name="+name_radio+"]")
    valor = $("input[name="+name_radio+"]:checked").val()
  
    if (valor == "" || valor == null){
      perguntas_vazias = perguntas_vazias + 1
      input.addClass("perfil_risco_vazio")
    }else{
      input.removeClass("perfil_risco_vazio")
    }
  })

  perc_preenchida = ((perguntas-perguntas_vazias) / perguntas)*100
  $(".progress_perfil_risco").css("width",  perc_preenchida + "%");
  $(".porcentagem_perfil_risco").text(roundToTwoDecimalPlaces(perc_preenchida))
  progressoRisco = perc_preenchida

  if (perc_preenchida == 100) {
    $(".perfil_risco_vazio").removeClass("marcar_perfil_risco_vazio")
    $(this).removeClass("marcacao_ativa")

    $.ajax({
      url: "http://127.0.0.1:5000/busca_resultado_perfil_risco",
      type: "POST",
      headers: {
        'Authorization': 'Bearer ' + token 
      },
      data:{
        IDCadastro:parseInt(IDCadastro),
      },
      success: function(result){
        $(".btn_status_perfil_risco").text(result)
        $(".btn_status_perfil_risco").addClass("finalizada_ativa")

      },
      complete: function(){
        $(".bg-perfil_risco").removeClass("bg-warning")
        $(".bg-perfil_risco").addClass("bg-success")
        $(".bg-perfil_risco").removeClass("bg-danger")
        $(".bnt_pendencias_perfil_risco").removeClass("text-danger")
      }
      })
  }else{
    $(".btn_status_perfil_risco").text("Incompleta")
    $(".btn_status_perfil_risco").removeClass("finalizada_ativa")
    $(".bnt_pendencias_perfil_risco").addClass("text-danger")

    if (perc_preenchida == 0) {
      $(".bg-perfil_risco").removeClass("bg-warning")
      $(".bg-perfil_risco").removeClass("bg-success")
      $(".bg-perfil_risco").addClass("bg-danger")
    }else{
      $(".bg-perfil_risco").addClass("bg-warning")
      $(".bg-perfil_risco").removeClass("bg-success")
      $(".bg-perfil_risco").removeClass("bg-danger")
    }
  }
  progresso_completo()
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function progresso_completo(){
  
  if (progressoFicha === 100 && progressoDiq === 100 && progressoRisco === 100) {
      $(".div_cadastro_preenchido").show();
      let today = new Date();
      $(".data_vencimento").text(today.setFullYear(today.getFullYear() + 2))
  } else {
      $(".div_cadastro_preenchido").hide();
  }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function logout(){
  localStorage.removeItem('authToken', token)
  window.location.href = "login.html" 
}


/*
  --------------------------------------------------------------------------------------------------------------------------------------------------
  API Externa CountryStateCity
  --------------------------------------------------------------------------------------------------------------------------------------------------
*/

function fill_select_pais(class_select, IDCadastro){
  nome_select = $("."+class_select)
  
  $.ajax({
    url: "https://api.countrystatecity.in/v1/countries",
    type: "GET",
    headers: {
      "X-CSCAPI-KEY": key_api_externa_countrystatecity
    },
    success: function(result){

      $.each(result, function(i, values){
        $(nome_select).append($('<option>', {
          value: values['name'],
          text: values['name'], 
          countryCode: values['iso2']
        }));
      });
    },
    complete: function(){
      $("."+class_select).closest(".div_pais").find(".spinner_pais").hide()
      nome_select.trigger("change").val("")
      if(IDCadastro != 0 && IDCadastro != null){
        buscar_info_cadastro(IDCadastro)
      }
      if(cadastro_preenchido == 1){
        nome_select.attr("disabled", false)
      } 
    }, 
  
    beforeSend: function(){
      $(nome_select).empty()
      $("."+class_select).closest(".div_pais").find(".spinner_pais").show()
      nome_select.attr("disabled", true)
    }
  })
  
}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function fill_select_estado(countryCode, IDAtributo, cotitular, valor = null){
  
  $.ajax({
    url:"https://api.countrystatecity.in/v1/countries/"+countryCode+"/states",
    type: "GET",
    headers: {
      "X-CSCAPI-KEY": key_api_externa_countrystatecity
    },
    success: function(result_estado){
      div = ".div_ficha_cadastral"
      if (cotitular == 1){div = ".div_ficha_cadastral_cotitular"}
      select_estado = $(div).find(".dados_cotista[data-id_atributo=8]")

      $.each(result_estado, function(i, values){
        select_estado.append($('<option>', {
          value: values['name'],
          text: values['name'], 
          statecode: values['iso2'],
          countryCode: countryCode,
        }));
      });
    },
    complete: function(){
      if(cadastro_preenchido == 1){
        select_estado.attr("disabled", false)
      } 
      select_estado.closest(".div_estado").find(".spinner_estado").hide()

      if (valor == null) {
        select_estado.trigger("change").val("")
      }else{
        $(div).find(".dados_cotista[data-id_atributo='8']").trigger("change").val(valor)
      }

      progresso_ficha_cadastral() 
    }, 
    beforeSend: function(){
      div = ".div_ficha_cadastral"
      if (cotitular == 1){div = ".div_ficha_cadastral_cotitular"}
      select_estado = $(div).find(".dados_cotista[data-id_atributo=8]")

      select_estado.empty()
      select_estado.closest(".div_estado").find(".spinner_estado").show()
      select_estado.attr("disabled", true)
    }
  })

}

//--------------------------------------------------------------------------------------------------------------------------------------------------

function fill_select_cidade(countryCode, stateCode, IDAtributo, cotitular, valor = null){

  $.ajax({
    url:"https://api.countrystatecity.in/v1/countries/"+countryCode+"/states/"+stateCode+"/cities",
    type: "GET",
    headers: {
      "X-CSCAPI-KEY": key_api_externa_countrystatecity
    },
    success: function(result){
      div = ".div_ficha_cadastral"
      if (cotitular == 1){div = ".div_ficha_cadastral_cotitular"}
      select = $(div).find(".dados_cotista[data-id_atributo=9]")

      if(result.length == 0){
        if(cadastro_preenchido == 1){
          select.attr("disabled", true)
        } 
      }else{
        $.each(result, function(i, values){
          select.append($('<option>', {
            value: values['name'],
            text: values['name'], 
          }))
        })

        if (valor == null) {
          select.trigger("change").val("")
        }else{
          select.trigger("change").val(valor)
        }

        if(cadastro_preenchido == 1){
          $(div).find(".dados_cotista[data-id_atributo=9]").attr("disabled", false)
        } 
      }


      select.closest(".div_cidade").find(".spinner_cidade").hide()

    },
    complete: function(){
      progresso_ficha_cadastral() 
    }, 
    beforeSend: function(){
      div = ".div_ficha_cadastral"
      if (cotitular == 1){div = ".div_ficha_cadastral_cotitular"}
      select = $(div).find(".dados_cotista[data-id_atributo=9]")

      select.empty()
      select.closest(".div_cidade").find(".spinner_cidade").show()
      select.attr("disabled", true)
    }
  })
}

// -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
$(document).ready(function(){
  verificar_login_realizado()
  $('.formato_numero').mask('000.000.000,00', {reverse: true});

});

//__________________________________________________________________________________________________________________________________________________
//funções com listen --------------------------------------------------------------------------------------------------------------------------------

/*
  --------------------------------------------------------------------------------------------------------------------------------------------------
  Geral
  --------------------------------------------------------------------------------------------------------------------------------------------------
*/
$(document).on("click",'.nav-link', function(e){
  e.preventDefault();
    name_class = $(this).data('div_scroll')
    var target = $("."+name_class)
    
    if (target.length) {
      var container = $(".div_principal")
      var scrollTo = target.offset().top - container.offset().top + container.scrollTop();

      container.animate({
        scrollTop: scrollTo
      }, 1000); // Adjust the animation duration as needed.

    }
})

$(document).on("click",'.btn_status_scroll', function(e){
  e.preventDefault();
    name_class = $(this).data('div_scroll')
    var target = $("."+name_class)
    
    if (target.length) {
      var container = $(".div_principal")
      var scrollTo = target.offset().top - container.offset().top + container.scrollTop();

      container.animate({
        scrollTop: scrollTo
      }, 1000); // Adjust the animation duration as needed.

    }
})

$(document).on("change",'.dados_cotista', function(e){
  e.preventDefault()

  input = $(this)
  id_usuario = $(".resumo_cotista").data("id_usuario")
  id_cadastro = $(".resumo_cotista").data("id_cadastro")
  id_atributo = input.data("id_atributo")
  cotitular = input.closest(".div_info").data("cotitular")
  tipo = input.data("tipo")

  if (cadastro_preenchido == 1) {

    if (input.is(":visible")) {
      if (tipo == "input"){
        valor = input.val()
      }if (tipo == "input_telefone"){
        code = "+" + input.closest('.iti').find('.iti__active').data('dial-code')
        telefone = input.val()
        valor = code +" "+ telefone
      }if (tipo == "radio") {
        name_radio = "atributo_"+id_atributo
        valor = $("input[name="+name_radio+"]:checked").val()
      } if (tipo == "select") {
        valor = $(this).val()
      }if (tipo == "checkbox") {
        valor = $(this).is(':checked')
      }

      if (id_atributo != 61) {
        atualizar_info_cadastro(id_cadastro, id_atributo, cotitular, valor)
      }else if (id_atributo == 61) {
        if (valor == "Individual") {
          cotitular=0
          atualizar_cotitular_cadastro(id_cadastro, cotitular)
          atualizar_info_cadastro(id_cadastro, id_atributo, 0, valor)
          $(".div_cotitular").hide()
        }else{
          cotitular=1
          atualizar_cotitular_cadastro(id_cadastro, cotitular)
          atualizar_info_cadastro(id_cadastro, id_atributo, 0, valor)
          $(".div_cotitular").show()
        }
      }

      if(id_atributo==7){
        countryCode = input.find('option:selected').attr('countrycode')
        atualizar_info_cadastro(id_cadastro, 74, cotitular, countryCode)
      }

      if(id_atributo==8){
        stateCode = input.find('option:selected').attr('statecode')
        atualizar_info_cadastro(id_cadastro, 75, cotitular, stateCode)
      }
    }
  }

})

$(document).on("click",'.btn_enviar_cadastro', function(){
  api_key = $(".chave_aml").val()
  email_aml = $(".email_aml").val()

  $(".div_info:visible").each(function() {
    nome_aml = $(this).find(".nome_aml").val()
    cpf_aml = $(this).find(".cpf_aml").val()

    if(nome_aml != ""){
      $.ajax({
        url: "http://127.0.0.1:5001/diligencia_compliance",
        type: "POST",
        data:{
          API_Key: api_key,
          Nome: nome_aml,
          CPF:cpf_aml,
          email_envio: email_aml
        },
        success: function(result){
        },
        complete: function(){
        }, 
        beforeSend: function(){
        }
      })
    }
  })

  $.ajax({
    url: "http://127.0.0.1:5000/envio_cadastro_aprovacao",
    type: "POST",
    headers: {
      'Authorization': 'Bearer ' + token 
    },
    data:{
      IDCadastro:parseInt(IDCadastro),
      IDUsuario:parseInt(IDUsuario),
    },
    success: function(result){

    },
    complete: function(){
      conferir_status_cadastro(IDUsuario)
    }, 
    beforeSend: function(){
      $(".spinner_status").show()
    }
  })
})

$(document).on("click", '.btn_excluir_cadastro', function(e){
  e.preventDefault()
  userInput = prompt("Você tem certeza de que deseja excluir seus dados cadastrais permanentemente? Se sim, digite 'DELETAR' no campo abaixo. Seus dados não poderão ser recuperados posteriormente.")
  if (userInput == 'DELETAR') {
    $.ajax({
      url: "http://127.0.0.1:5000/excluir_cadastro",
      type: "POST",
      headers: {
        'Authorization': 'Bearer ' + token 
      },
      data:{
        IDCadastro:parseInt(IDCadastro),
        IDUsuario:parseInt(IDUsuario),
      },
      success: function(result){
  
      },
      complete: function(){
        alert("Seu cadastro foi excluir com sucesso.")
        conferir_status_cadastro(IDUsuario)

        $(".dados_cotista").each(function() {
          tipo = $(this).data("tipo")
          input = $(this)
          IDAtributo = $(this).data("id_atributo")
      
          if (tipo == "input"){
           $(".dados_cotista[data-id_atributo="+IDAtributo+"]").val("")
          }if (tipo == "input_telefone"){
            $(".dados_cotista[data-id_atributo="+IDAtributo+"]").data("")
          }if (tipo == "radio") {
            id_atributo = $(this).data("id_atributo")
            name_radio = "atributo_"+id_atributo
            input = $("input[name="+name_radio+"]")
            valor = $("input[name="+name_radio+"]:checked").val()
          } if (tipo == "select") {
           $(".dados_cotista[data-id_atributo="+IDAtributo+"]").trigger("change").val("")
          }if (tipo == "checkbox") {
           $(".dados_cotista[data-id_atributo="+IDAtributo+"]").prop('checked', false)
          }
        })
        $(".option_perfil_risco").prop('checked', false)
        $(".diq_obrigatorio_vazio").prop('checked', false)
        IDCadastro = 0
        $(".spinner_excluir").hide()

      }, 
      beforeSend: function(){
        $(".spinner_status").show()
        $(".spinner_excluir").show()
      }
    
    })
  } 
})

$(document).on("click",'.btn_logout', function(e){
  //ao clicar no botão de sign in, realiza login
  logout()
})

/*
  --------------------------------------------------------------------------------------------------------------------------------------------------
  Ficha Cadastral
  --------------------------------------------------------------------------------------------------------------------------------------------------
*/

$(document).on('countrychange', ".campo_telefone", function(e, countryData){
  code = "+" + $(this).closest('.iti').find('.iti__active').data('dial-code')
  masks = {
      '+55': '(00) 00000-0000',
      '+1': '(000) 000-0000',
      '+44': '00000 000000',
      '+54': '000 00-0000-0000',
      '+965': '000 000000',
      '+351': '000 000 000',
      '+35': '000 000 000',
      '+96': '000 000000', 
      '+41': '000 000 00 00',
      '+56': '(0) 0000 0000',
      '+47': '000 00 000',
      '+45': '00 00 00 00',
      '+49': '00000 0000000',
      '+33': '00 00 00 00 00'
  }
  
  if (code in masks){
      $(this).mask(masks[code])
  } else {
      $(this).unmask()
  }
});

$(document).on("change",'.select_estadoCivil', function(e){
  e.preventDefault()
  cotitular = $(this).closest(".div_info").data("cotitular")
  id_cadastro = $(".resumo_cotista").data("id_cadastro")

  if (cadastro_preenchido == 1) {
    div = ".div_ficha_cadastral"
    if (cotitular == 1){
      div = ".div_ficha_cadastral_cotitular"
    }

    if ($(this).val() == "Solteiro"){
      $(div).find(".div_casado").hide()
      atualizar_info_cadastro(id_cadastro, 5, cotitular, "")
      atualizar_info_cadastro(id_cadastro, 6, cotitular, "")
      $(this).closest(".div_info").find(".dados_cotista[data-id_atributo="+5+"]").val("")
      $(this).closest(".div_info").find(".dados_cotista[data-id_atributo="+6+"]").val("")
    }else{
      $(div).find(".div_casado").show()
    }
  }
})

$(document).on("change",'.outras_cidadanias', function(e){
  e.preventDefault()
  cotitular = $(this).closest(".div_info").data("cotitular")
  if (cadastro_preenchido == 1) {
    div = ".div_ficha_cadastral"
    if (cotitular == 1){
      div = ".div_ficha_cadastral_cotitular"
    }
    if ($(this).val() == "Não"){
      $(div).find(".div_outras_cidadanias").hide()
      atualizar_info_cadastro(id_cadastro, 12, cotitular, "")
      atualizar_info_cadastro(id_cadastro, 13, cotitular, "")
      $(this).closest(".div_info").find(".dados_cotista[data-id_atributo="+12+"]").val("")
      $(this).closest(".div_info").find(".dados_cotista[data-id_atributo="+13+"]").val("")
    }else{
      $(div).find(".div_outras_cidadanias").show()
    }
  }
})

$(document).on("click",'.btn_DomicílioFiscal2', function(e){
  e.preventDefault()
  div_DomicilioFiscal2 = $(this).closest(".div_info")
  if (div_DomicilioFiscal2.find(".div_DomicílioFiscal2").is(":visible")){
    div_DomicilioFiscal2.find(".div_DomicílioFiscal2").hide()
    div_DomicilioFiscal2.find(".div_btn_DomicílioFiscal2").hide()
    div_DomicilioFiscal2.find(".div_btn_DomicílioFiscal1").hide()
  }else{
    div_DomicilioFiscal2.find(".div_DomicílioFiscal2").show()
    div_DomicilioFiscal2.find(".div_btn_DomicílioFiscal1").hide()
    div_DomicilioFiscal2.find(".div_btn_DomicílioFiscal2").show()
  }
})

$(document).on("click",'.btn_addDomicílioFiscal3', function(e){
  e.preventDefault()
  div_DomicilioFiscal3 = $(this).closest(".div_info")
  if (div_DomicilioFiscal3.find(".div_DomicílioFiscal3").is(":visible")){
    div_DomicilioFiscal3.find(".div_DomicílioFiscal3").hide()
    div_DomicilioFiscal3.find(".div_btn_DomicílioFiscal2").show()
    div_DomicilioFiscal3.find(".div_btn_DomicílioFiscal3").hide()
  }else{
    div_DomicilioFiscal3.find(".div_DomicílioFiscal3").show()
    div_DomicilioFiscal3.find(".div_btn_DomicílioFiscal2").hide()
    div_DomicilioFiscal3.find(".div_btn_DomicílioFiscal3").show()
  }
})

$(document).on("click",'.excluir_addDomicílioFiscal2', function(e){
  e.preventDefault()
  cotitular = $(this).closest(".div_info").data("cotitular")
  if (cadastro_preenchido == 1) {
    div_DomicilioFiscal2 = $(this).closest(".div_info")
    if (div_DomicilioFiscal2.find(".div_DomicílioFiscal2").is(":visible")){
      div_DomicilioFiscal2.find(".div_DomicílioFiscal2").hide()
      div_DomicilioFiscal2.find(".div_btn_DomicílioFiscal1").show()
      div_DomicilioFiscal2.find(".div_btn_DomicílioFiscal2").hide()

      div_DomicilioFiscal2.find(".atributo_17").trigger("change").val("")
      div_DomicilioFiscal2.find(".atributo_18").val("")
      div_DomicilioFiscal2.find(".atributo_19").trigger("change").val("")  
      atualizar_info_cadastro(id_cadastro, 17, cotitular, "")
      atualizar_info_cadastro(id_cadastro, 18, cotitular, "")
      atualizar_info_cadastro(id_cadastro, 19, cotitular, "")
    }else{
      div_DomicilioFiscal2.show()
      div_DomicilioFiscal2.find(".div_btn_DomicílioFiscal1").hide()
      div_DomicilioFiscal2.find(".div_btn_DomicílioFiscal2").show()
    }
  }
})

$(document).on("click",'.excluir_DomicílioFiscal3', function(e){
  e.preventDefault()
  cotitular = $(this).closest(".div_info").data("cotitular")
  if (cadastro_preenchido == 1) {
    div_DomicilioFiscal3 = $(this).closest(".div_info")
    if (div_DomicilioFiscal3.find(".div_DomicílioFiscal3").is(":visible")){
      div_DomicilioFiscal3.find(".div_DomicílioFiscal3").hide()
      div_DomicilioFiscal3.find(".div_btn_DomicílioFiscal2").show()
      div_DomicilioFiscal3.find(".div_btn_DomicílioFiscal3").hide()

      div_DomicilioFiscal3.find(".atributo_20").trigger("change").val("")
      div_DomicilioFiscal3.find(".atributo_21").val("")
      div_DomicilioFiscal3.find(".atributo_22").trigger("change").val("")  
      atualizar_info_cadastro(id_cadastro, 20, cotitular, "")
      atualizar_info_cadastro(id_cadastro, 21, cotitular, "")
      atualizar_info_cadastro(id_cadastro, 22, cotitular, "")
    }else{
      div_DomicilioFiscal3.show()
      div_DomicilioFiscal3.find(".div_btn_DomicílioFiscal3").hide()
      div_DomicilioFiscal3.find(".div_btn_DomicílioFiscal2").show()
    }
  }
})

$(document).on("change",'.checkbox_OcupacaoProfissional', function(e){
  e.preventDefault()
  cotitular = $(this).closest(".div_info").data("cotitular")
  if (cadastro_preenchido == 1) {
    div = ".div_ficha_cadastral"
    if (cotitular == 1){
      div = ".div_ficha_cadastral_cotitular"
    }

    if ($(div).find('.checkbox_OcupacaoProfissional').is(':checked')){
      $(div).find(".div_OcupacaoProfissional").hide()
      atualizar_info_cadastro(id_cadastro, 43, cotitular, "")
      div.find(".dados_cotista[data-id_atributo=43]").val("")	
      atualizar_info_cadastro(id_cadastro, 44, cotitular, "")
      div.find(".dados_cotista[data-id_atributo=44]").val("")	
      $(".div_ResponsavelFinanceiro").show()
    }else{
      $(div).find(".div_OcupacaoProfissional").show()
      $(div).find(".div_ResponsavelFinanceiro").hide()
      atualizar_info_cadastro(id_cadastro, 45, cotitular, "")
      div.find(".dados_cotista[data-id_atributo=45]").val("")	
      atualizar_info_cadastro(id_cadastro, 46, cotitular, "")
      div.find(".dados_cotista[data-id_atributo=46]").val("")	
      atualizar_info_cadastro(id_cadastro, 47, cotitular, "")
      div.find(".dados_cotista[data-id_atributo=47]").val("")	
    } 
  }
})

$(document).on("change",'.checkbox_NaoResidentes', function(e){
  e.preventDefault()
  cotitular = $(this).closest(".div_info").data("cotitular")
  if (cadastro_preenchido == 1) {
    div = ".div_ficha_cadastral"
    if (cotitular == 1){
      div = ".div_ficha_cadastral_cotitular"
    }

    if ($(div).find('.checkbox_NaoResidentes').is(':checked')){
      $(div).find(".div_NaoResidentes").show()
    }else{
      $(div).find(".div_NaoResidentes").hide()
      atualizar_info_cadastro(id_cadastro, 55, cotitular, "")
      div.find(".dados_cotista[data-id_atributo=55]").prop('checked', false)
      atualizar_info_cadastro(id_cadastro, 58, cotitular, "")
      div.find(".dados_cotista[data-id_atributo=58]").val("")	
      atualizar_info_cadastro(id_cadastro, 59, cotitular, "")
      div.find(".dados_cotista[data-id_atributo=59]").val("")	
      atualizar_info_cadastro(id_cadastro, 57, cotitular, "")
      div.find(".dados_cotista[data-id_atributo=57]").prop('checked', false)
      atualizar_info_cadastro(id_cadastro, 56, cotitular, "")
      div.find(".dados_cotista[data-id_atributo=56]").prop('checked', false)
    } 
  }
})

$(document).on("change",'.tipo_conta', function(e){
  e.preventDefault()
  tipo_conta = $(".tipo_conta").val()
  if (tipo_conta=="Individual"){
    $(".div_cotitular").hide()
  }else{
    $(".div_cotitular").show()
  } 
})

$(document).on("click",'.iniciar_cadatro', function(e){
  e.preventDefault()
  $.ajax({
    url:"http://127.0.0.1:5000/inserir_cadastro_banco",
    type: "POST",
    headers: {
      'Authorization': 'Bearer ' + token 
    },
    data:{
        IDUsuario:IDUsuario,
    },
    success: function(IDCadastro){
      $(".resumo_cotista").data("id_cadastro", IDCadastro)
    },

    complete: function(){
      conferir_status_cadastro(IDUsuario)
    },

    beforeSend: function(){
    }
  });
})

$(document).on("change",'.select_pais_nascimento', function(e){
  e.preventDefault()
  if (cadastro_preenchido == 1) {
    countryCode = $(this).find('option:selected').attr('countrycode')
    cotitular = $(this).closest(".div_info").data("cotitular")
    fill_select_estado(countryCode, 8, cotitular)
  }
})

$(document).on("change",'.select_estado_nascimento', function(e){
  e.preventDefault()
  if (cadastro_preenchido == 1) {
    countryCode = $(this).find('option:selected').attr('countryCode')
    stateCode = $(this).find('option:selected').attr('statecode')
    cotitular = $(this).closest(".div_info").data("cotitular")
    fill_select_cidade(countryCode, stateCode, 9, cotitular, valor = null)
  }
})

$(document).on("click",'.btn_editar_cadatro', function(e){
  e.preventDefault()
  if ($(this).hasClass("edicao_ativa")) {
    $(this).removeClass("edicao_ativa")
    cadastro_preenchido = 0
    $(".obrigatorio_vazio").attr("disabled", true)
    $(".dados_cotista").attr("disabled", true)
    $(".campo_cep_block").attr("disabled", true)
  }else{
    $(this).addClass("edicao_ativa")
    cadastro_preenchido = 1
    inserir_log_atividade(IDUsuario, "Dados da Ficha Cadastral foram atualizados.")
    $(".obrigatorio_vazio").attr("disabled", false)
    $(".dados_cotista").attr("disabled", false)
    $(".campo_cep_block").attr("disabled", true)
  }
})

$(document).on("click",'.bnt_pendencias', function(e){
  e.preventDefault()
  if ($(this).hasClass("marcacao_ativa")) {
    progresso_ficha_cadastral()
    $(".obrigatorio_vazio").removeClass("marcar_obrigatorio_vazio")
    $(this).removeClass("marcacao_ativa")
  }else{
    progresso_ficha_cadastral()
    $(".obrigatorio_vazio").addClass("marcar_obrigatorio_vazio")
    $(this).addClass("marcacao_ativa")
  }
})

$(document).on("input",'.formato_numero', function(e){
  var nonNumReg = /[^0-9.,]/g;
  $(this).val($(this).val().replace(nonNumReg, ''));
});

$(document).on("change",'.localizacao_end', function(e){
  e.preventDefault()
  if(cadastro_preenchido == 1){
    localizacao = $(this).val()
    if (localizacao=="BR"){
      div = $(this).closest(".div_end_geral").find(".end_localizado_br")
      div.show()
      $(this).closest(".div_end_geral").find(".end_localizado_fora").hide()
      div.find(".end_pais").val("Brasil")
      div.find(".campo_cep").val("")
      div.find(".end_rua").val("")
      div.find(".end_bairro").val("")
      div.find(".end_cidade").val("")
      div.find(".end_num").val("")
      div.find(".end_complemento").val("")
      div.find(".end_uf").val("")
    }else{
      $(this).closest(".div_end_geral").find(".end_localizado_br").hide()
      div = $(this).closest(".div_end_geral").find(".end_localizado_fora")
      div.show()
      div.find(".campo_cod_postal").val("")
      div.find(".end_rua").val("")
      div.find(".end_bairro").val("")
      div.find(".end_cidade").val("")
      div.find(".end_num").val("")
      div.find(".end_complemento").val("")
      div.find(".end_uf").val("")
      div.find(".end_pais").val("")
    } 
  }
})

$(document).on("change", '.end_pais', function(e){
  e.preventDefault()
  if(cadastro_preenchido == 1){
    valor = $(this).val()
    valor = valor.toLowerCase()
    div = $(this).closest(".div_end_geral")
    localizacao = div.find(".localizacao_end").val()

    if(valor == "brasil"){
      div.find(".end_localizado_br").show()
      div.find(".end_localizado_fora").hide()
      if(localizacao != "BR"){
        div.find(".localizacao_end").trigger("change").val("BR")
      }
    }else{
      div.find(".end_localizado_br").hide()
      div.find(".end_localizado_fora").show()
      if(localizacao != "fora"){
        div.find(".localizacao_end").trigger("change").val("fora")
      }
    } 
  } 
})

$(document).on("click", '.btn_outro_endereco', function(e){
  e.preventDefault()
  cotitular = $(this).closest(".div_info").data("cotitular")
  if(cadastro_preenchido == 1){
    div = ".div_ficha_cadastral"
    if (cotitular == 1){
      div = ".div_ficha_cadastral_cotitular"
    }
    $(div).find(".div_outro_endereco").show()
    $(div).find(".btn_outro_endereco").hide()
  } 
})

$(document).on("click", '.btn_excluir_outro_endereco', function(e){
  e.preventDefault()
  cotitular = $(this).closest(".div_info").data("cotitular")
  if(cadastro_preenchido == 1){
    div = ".div_ficha_cadastral"
    if (cotitular == 1){
      div = ".div_ficha_cadastral_cotitular"
    }

    $(div).find(".div_outro_endereco").find(".campo_cod_postal").val("")
    $(div).find(".div_outro_endereco").find(".campo_cep").val("")
    $(div).find(".div_outro_endereco").find(".end_rua").val("")
    $(div).find(".div_outro_endereco").find(".end_bairro").val("")
    $(div).find(".div_outro_endereco").find(".end_cidade").val("")
    $(div).find(".div_outro_endereco").find(".end_num").val("")
    $(div).find(".div_outro_endereco").find(".end_complemento").val("")
    $(div).find(".div_outro_endereco").find(".end_uf").val("")
    $(div).find(".div_outro_endereco").find(".end_pais").val("")

    $(div).find(".div_outro_endereco").find(".end_localizado_br").show()
    $(div).find(".div_outro_endereco").find(".end_localizado_fora").hide()

    div = ".div_ficha_cadastral"
    if (cotitular == 1){
      div = ".div_ficha_cadastral_cotitular"
    }
    $(div).find(".div_outro_endereco").hide()

    div = ".div_ficha_cadastral"
    if (cotitular == 1){
      div = ".div_ficha_cadastral_cotitular"
    }
    $(div).find(".btn_outro_endereco").show()

    atualizar_info_cadastro(id_cadastro, 34, cotitular, "")
    atualizar_info_cadastro(id_cadastro, 35, cotitular, "")
    atualizar_info_cadastro(id_cadastro, 36, cotitular, "")
    atualizar_info_cadastro(id_cadastro, 37, cotitular, "")
    atualizar_info_cadastro(id_cadastro, 38, cotitular, "")
    atualizar_info_cadastro(id_cadastro, 39, cotitular, "")
    atualizar_info_cadastro(id_cadastro, 41, cotitular, "")
    atualizar_info_cadastro(id_cadastro, 40, cotitular, "")
  } 
})

$(document).on("click", '.btn_enviar_cadastro', function(e){
  e.preventDefault()
  cotitular = $(this).closest(".div_info").data("cotitular")
})

/*
  --------------------------------------------------------------------------------------------------------------------------------------------------
  DIQ
  --------------------------------------------------------------------------------------------------------------------------------------------------
*/

$(document).on("click", '.dados_diq', function(){
  input = $(this)
  id_usuario = $(".resumo_cotista").data("id_usuario")
  id_cadastro = $(".resumo_cotista").data("id_cadastro")
  id_atributo = input.data("id_atributo")
  tipo = input.data("tipo")

  if (tipo == "radio") {
    name_radio = "atributo_"+id_atributo
    valor = $("input[name="+name_radio+"]:checked").val()
  } if (tipo == "checkbox") {
    valor = $(this).is(':checked')
  }

  atualizar_diq(id_cadastro, id_atributo, 0, valor)
  
})


/*
  --------------------------------------------------------------------------------------------------------------------------------------------------
  Perfil de Risco
  --------------------------------------------------------------------------------------------------------------------------------------------------
*/

$(document).on("click", '.tab-pr', function(){
  input = $(this)
  id_usuario = $(".resumo_cotista").data("id_usuario")
  id_cadastro = $(".resumo_cotista").data("id_cadastro")
  id_atributo = input.data("id_atributo")

  if (perfil_risco_preenchido == 1) {
    name_radio = "atributo_"+id_atributo
    valor = $("input[name="+name_radio+"]:checked").val()
    atualizar_perfil_risco(id_cadastro, id_atributo, 0, valor)
  }
})

$(document).on("click",'.btn_editar_perfil_risco', function(e){
  e.preventDefault()
  if ($(this).hasClass("edicao_ativa")) {
    $(this).removeClass("edicao_ativa")
    perfil_risco_preenchido = 0
    $(".perfil_risco_vazio").attr("disabled", true)
    $(".option_perfil_risco").attr("disabled", true)
  }else{
    $(this).addClass("edicao_ativa")
    perfil_risco_preenchido = 1
    inserir_log_atividade(IDUsuario, "Dados do Perfil de Risco foram atualizados.")
    $(".perfil_risco_vazio").attr("disabled", false)
    $(".option_perfil_risco").attr("disabled", false)
  }
})

$(document).on("click",'.bnt_pendencias_perfil_risco', function(e){
  e.preventDefault()
  if ($(this).hasClass("marcacao_ativa")) {
    progresso_perfil_risco()
    $(".perfil_risco_vazio").removeClass("marcar_perfil_risco_vazio")
    $(this).removeClass("marcacao_ativa")
  }else{
    progresso_perfil_risco()
    $(".perfil_risco_vazio").addClass("marcar_perfil_risco_vazio")
    $(this).addClass("marcacao_ativa")
  }
})



/*
  --------------------------------------------------------------------------------------------------------------------------------------------------
  API Externa CEP
  --------------------------------------------------------------------------------------------------------------------------------------------------
*/

$(document).on("change",'.campo_cep', function(e){ 
  e.preventDefault()

  if (cadastro_preenchido == 1) {
    cotitular = $(this).closest(".div_info").data("cotitular")
    cep_sujo = $(this).val()
    cep = cep_sujo.replace(/\D/g, "")
    div = $(this).closest(".div_end_geral")

    if (cep.length === 8) {
      var settings = {
        "url": "https://brasilapi.com.br/api/cep/v1/"+cep,
        "method": "GET",
        beforeSend: function() {
          div.find(".spinner_cep").show()
        },
        complete: function(jqXHR, textStatus) {
          div.find(".spinner_cep").hide()
        }
      }
      
      var that = $(this);  

      $.ajax(settings)
        .done(function(response) {
          if (response) {
            var div_end = that.closest(".div_end_geral")
            tipo_endereco = div_end.data("endereco")
            div_end.find(".end_rua").val(response.street)
            div_end.find(".end_bairro").val(response.neighborhood)
            div_end.find(".end_cidade").val(response.city)
            div_end.find(".end_uf").val(response.state)
            div_end.find(".end_pais").val("Brasil")
            div_end.find(".erro_cep").hide()

            if (tipo_endereco == "principal") {
              atualizar_info_cadastro(id_cadastro, 29, cotitular, response.street)
              atualizar_info_cadastro(id_cadastro, 33, cotitular, response.neighborhood)
              atualizar_info_cadastro(id_cadastro, 32, cotitular, "Brasil")
              atualizar_info_cadastro(id_cadastro, 31, cotitular, response.state)
              atualizar_info_cadastro(id_cadastro, 30, cotitular, response.city)
            }

            if (tipo_endereco == "outro") {
              atualizar_info_cadastro(id_cadastro, 37, cotitular, response.street)
              atualizar_info_cadastro(id_cadastro, 41, cotitular, response.neighborhood)
              atualizar_info_cadastro(id_cadastro, 40, cotitular, "Brasil")
              atualizar_info_cadastro(id_cadastro, 39, cotitular, response.state)
              atualizar_info_cadastro(id_cadastro, 38, cotitular, response.city)
            }
           

          }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          div_end = that.closest(".div_end_geral")
          div_end.find(".erro_cep").show()
          div_end.find(".end_rua").val("")
          div_end.find(".end_bairro").val("")
          div_end.find(".end_cidade").val("")
          div_end.find(".end_uf").val("")
        });
    }
  }

})


/*
  --------------------------------------------------------------------------------------------------------------------------------------------------
  API Externa Verifica Email
  --------------------------------------------------------------------------------------------------------------------------------------------------
*/

$(document).on("change",'.verifica_email', function(e){ 
  e.preventDefault()

  email = $(this).val()
  var div = $(this).closest(".div_info")
  alerta = 0
  $(this).closest(".div_email").find(".spinner_check_email").show()

  if (!validateEmail(email)) {
    msg = "Email inválido."
    $(div).find(".erro_email").text(msg)
    $(div).find(".erro_email").show()
    $(div).find(".email_alerta_api").hide()
    $(div).find(".email_validado_api").hide()
  }else{
    var settings = {
      "url": "https://www.disify.com/api/email/"+email,
      "method": "GET",
    }
    $.ajax(settings)
      .done(function(response) {
        if (response.disposable == true) {
          msg = "Email identificado como temporário."
          alerta = 1 
          $(".spinner_check_email").hide()
        }

        if (response.format == false) {
          msg = "Email inválido."
          alerta = 1 
          $(".spinner_check_email").hide()
        }

        if (response.dns == false) {
          msg = "DNS do email não validado."
          alerta = 1 
          $(".spinner_check_email").hide()
        }

        if(alerta >= 1){
          $(div).find(".erro_email").text(msg)
          $(div).find(".erro_email").show()
          $(div).find(".email_validado_api").hide()
          $(div).find(".email_alerta_api").show()
        }else{
          $(div).find(".erro_email").text("")
          $(div).find(".erro_email").hide()
          $(div).find(".email_alerta_api").hide()
          $(div).find(".email_validado_api").show()
        }

        $(".spinner_check_email").hide()
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Erro:', textStatus, errorThrown);
        $(".spinner_check_email").hide()
      });      
  }
})
