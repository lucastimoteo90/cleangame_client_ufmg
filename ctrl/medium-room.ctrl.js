app.controller('MediumRoomCtrl', function ($rootScope,Domain, $location, $interval, $scope,$RoomService, $MediumRoomService, $QuestionService,$SocketService, $TeamService) {
  console.log("Controlador MediumRoomCtrl carregado!");

  label = {};
  label.newEasyRoomTitle = "New medium room";
  label.nameRoom = "Room name";
  label.descriptionRoom = "Room description";
  label.isPublicRoom = "Is public room?";
  label.btnCreateRoom = "Create!";
  label.git = "Git clone:"

  $scope.loadingtip = false;

  $scope.leader = {};

  $scope.label = label;

  $scope.step1 = true;
  $scope.step2 = false;

  $scope.tip1Solicitada = false;
  $scope.tip2Solicitada = false;
  $scope.tip3Solicitada = false;

  $scope.question = {};
  $scope.questions = {};

  $scope.resume = {};
  $scope.resume.hits = 0;
  $scope.position = 0;

  $scope.panel = {}
  $scope.panel.time = 0;
  
  $scope.rankingStyle = {"font-weight": "bold"}
  
  //Corrigir
  console.log("TEAM SERVICE",$TeamService);

  $scope.room = $RoomService.getActiveRoom();
  $MediumRoomService.setActiveRoom($RoomService.getActiveRoom());

  function loadResume(){
    $RoomService.getResume().then(function(response){
      $("#modalLoading").modal("hide");
      $scope.resume = response.data;  
      $scope.progress = Math.round(((response.data.hits + response.data.errors + response.data.skips)*100 / response.data.totalQuestions))
      $scope.progressStyle = {'width':$scope.progress+'%'}
      //alert($scope.progress)
    })
    loadRanking();
  }


  function loadRanking(){
    $RoomService.getRanking().then(function(response){
      $scope.ranking = response.data.usersRankingDTO;

      //Gambiarra para não atar server
      $scope.ranking.forEach(ranking => {
        if($rootScope.user.mail == ranking.email){
           $scope.position = ranking.position;     
           console.log("AQUI", $scope.resume.position)     
        }
      });
      //alert($scope.progress)
    })
  }
    


  function loadQuestion(){
    $scope.tip1Solicitada = false;
    $scope.tip2Solicitada = false;
    $scope.tip3Solicitada = false;
    $("#modalLoading").modal()
    loadResume();
    $("#modalLoading").modal()
    $scope.tip = null;
    $scope.panel.time = 0;  
    $MediumRoomService.getQuestion().then(function(response){
       if(response.data.id != null){
        $scope.question = response.data;
        htmlObject = $("<pre  class = \" brush: java \" >" + response.data.code +"</pre>")
       $("#sourcecode").html(htmlObject)
       $('.code').each(function () {
         SyntaxHighlighter.All();
       });

       SyntaxHighlighter.highlight();
        //$scope.sourcecode = response.data.code
        //SyntaxHighlighter.All();
        $("#modalLoading").modal('hide');
       }else{
         $rootScope.loadMainContent('rooms/medium/congratulations');
         loadRanking();
       }
       
       console.log("QUESTION",$scope.question)
    })
  }

  function loadQuestionSocket(){            
      
    loadResume();
    $scope.tip = null;
    $scope.panel.time = 0;  
    $MediumRoomService.getQuestion().then(function(response){
       if(response.data.id != null){
         $scope.question = response.data;         
       }else{
         $rootScope.loadMainContent('rooms/medium/congratulations')
       }       
       $SocketService.makeAlternative();
       console.log($scope.question)
    })
  }  

  $scope.getTip = function(){
    $QuestionService.getTip($scope.question.id).then(function(response){
      $scope.tip = response.data.tip
      $SocketService.getTip(response.data.tip)
    })
  }

  $scope.getTip1 = function(){
    $scope.loadingtip = true;
    $scope.tip = false;
    $QuestionService.getTip1($scope.question.id).then(function(response){
      $scope.tip = response.data.tip
      $scope.tip1Solicitada = true;
      $scope.loadingtip = false;
      //$SocketService.getTip(response.data.tip)
    })
  }

  $scope.getTip2 = function(){
    $scope.loadingtip = true;
    $scope.tip = false;
    $QuestionService.getTip2($scope.question.id).then(function(response){
      $scope.tip = response.data.tip
      $scope.tip2Solicitada = true;
      $scope.loadingtip = false;
      //$SocketService.getTip(response.data.tip)
    })
  }

  $scope.getTip3 = function(){
    $scope.loadingtip = true;
    $scope.tip = false;
    $QuestionService.getTip3($scope.question.id).then(function(response){
      $scope.tip = response.data.tip
      $scope.tip3Solicitada = true;
      $scope.loadingtip = false;
      //$SocketService.getTip(response.data.tip)
    })
  }


  $scope.skip = function(){
    $QuestionService.skip($scope.question.id).then(function(response){      
      //loadQuestionSocket();
      loadQuestion();
    })
  }

 
  getStatus = function(){
    $MediumRoomService.getStatus().then(function(response){
       $scope.cloneStatus = response.data.cloneStatus;
       $scope.pmdStatus = response.data.pmdStatus;
       $scope.makeQuestionStatus = response.data.makeQuestionStatus
       if(response.data.cloneStatus == "COMPLETED"
           && response.data.pmdStatus == "COMPLETED" 
            && response.data.makeQuestionStatus == "COMPLETED"){
           $interval.cancel(stop)
       }
    });
  }

  function moveStep2(){
    $scope.step2 = true;
    $scope.step1 = false;
    stop = $interval(getStatus, 3000)
    //setInterval(getStatus(), 3000);
  }
 
    $scope.createRoom = function(room){
    room.type = "MEDIUM"
    $MediumRoomService.insertNewRoom(room).then(function(response){
      if(response.status==201){
        $MediumRoomService.setActiveRoom(response.data)
        moveStep2();
      }      
    })
  }
    

   //Função ativa modo multiplayer na sala
   function multiplayer(){
    //Funções socketio
    //conecta usuário servidor
  $SocketService.conect();

  //Registra usuário na sala
  $SocketService.registerUser($rootScope.user);
  $SocketService.registerUserRoom($TeamService.getActiveTeam().id);
 
  
  


  //Inicia captura da posição do mouse e envia servidor socket
  window.addEventListener('mousemove', function(e) {
    var mouse = {
        page: {
            x: e.pageX,
            y: e.pageY
        },
        client: {
            x: e.clientX,
            y: e.clientY
        }
    };

    $SocketService.moveMouse(mouse);

    //console.log("POSICAO MOUSE",);
    //var screenWidth = screen.width;
    //var screenHeight = screen.height;    
  })


  usuarios = [];
  count_user_remot = 0;
  //Obtem posição mouse demais participantes da sala.
  $SocketService.socket.on("movereceiver", function(moviment) {    	
    //msgobj = JSON.parse(msg);
    //console.log("RECEBENDO MOVIMENTAÇÂO", moviment); 
    
    if(usuarios.indexOf(moviment.user) > -1){

    }else{
      if(moviment.user != $rootScope.user.mail){
        count_user_remot++;
        $("#userremoto"+count_user_remot).html("."+moviment.user);
        $("#userremoto"+count_user_remot).show()
        usuarios[count_user_remot++] = moviment.user
       // console.log("NOVO USUARIO NA SALA",moviment.user);
       }
    }
      if(moviment.user != $rootScope.user.mail)
       $("#userremoto"+usuarios.indexOf(moviment.user)).css({top: (($(window).height()/300)*moviment.y), left: (($(window).width()/300)*moviment.x), position:'absolute'});
  

    });
  
  //array usuários logados na sala
  $SocketService.socket.on("sendchatmsg", function(mensagem){
    console.log("RECEBEU MSG")
    $scope.consoleChat = $sce.trustAsHtml($scope.consoleChat+"<br>");
    $scope.consoleChat = $sce.trustAsHtml($scope.consoleChat +"<b>"+ mensagem.usermail+":</b>");
    $scope.consoleChat = $sce.trustAsHtml($scope.consoleChat + mensagem.text);
    //$sce.trustAsHtml($scope.html)
  })

  $SocketService.socket.on("new_user_in_room", function(usermail) {    	
   /*
    if(usermail != $rootScope.user.mail){
     count_user_remot++;
     $("#userremoto"+count_user_remot).html("."+usermail);
     $("#userremoto"+count_user_remot).show()
     usuarios[count_user_remot++] = usermail
     console.log("NOVO USUARIO NA SALA",usermail);
    }
    */
  });

  /**RECEBE NOTIFICAÇÂO DE ALTERNATIVA */
  $SocketService.socket.on("makealternative", function(msg) { 
    loadQuestion();    
    
  })  	

  $SocketService.socket.on("gettip", function(msg) { 
    console.log("RECEBENDO DICA!!", msg)    
    $scope.tip = msg.tip;    
  })
}



  $rootScope.score = {}
  
  $scope.markAlternative = function(option){
    alternative = {};
    alternative.question = $scope.question.id;
    alternative.answer = $scope.question.answer;     
    alternative.md5answer = md5($scope.question.alternatives[option]);

    $QuestionService.markAlternative(alternative).then(function(response){
      $("#modalLoading").modal("hide");
      alternative = response.data;
      $rootScope.score = response.data.score 
     
      if(response.data.correct){
        $("#modalMaisPontos").modal();
        $("#maisPontos").show();
        resto = 0;
        efeito = setInterval(function(){
          
           $scope.$apply(function () {
           if( (resto++ %2) == 0){
            $("#maisPontos").hide();
           }else{
            $("#maisPontos").show();
           }
          })
        },100)

        setTimeout(function(){
          $scope.$apply(function () {
            $("#maisPontos").hide();
            $("#modalMaisPontos").modal('hide');
            clearInterval(efeito)
        });        
        },3000);
        
         
      }else{
        $("#modalMenosPontos").modal();
        $("#menosPontos").show();
        resto = 0;
        efeito = setInterval(function(){
          
          $scope.$apply(function () {
          if( (resto++ %2) == 0){
            $("#menosPontos").hide();
          }else{
            $("#menosPontos").show();
          }
         })
       },100)
        setTimeout(function(){
          $scope.$apply(function () {
            $("#menosPontos").hide();
            $("#modalMenosPontos").modal('hide');
            clearInterval(efeito)
        });        
        },3000);
        
      }

      //loadQuestionSocket(); 
      loadQuestion();           
      
    })
 }

 $scope.sharedLink = function(){
  $rootScope.linkshared = Domain + "/invite/"+$TeamService.getActiveTeam().id;
  $("#modalSharedRoom").modal('show');
}

$scope.sendChatMensage = function(msg){
  $SocketService.sendChatMessage(msg);
  
  $scope.consoleChat = $sce.trustAsHtml($scope.consoleChat+"<br>");
  $scope.consoleChat = $sce.trustAsHtml($scope.consoleChat +"<b>"+ $scope.user.mail+":</b>");
  $scope.consoleChat = $sce.trustAsHtml($scope.consoleChat + msg);
  $scope.sendMsg = "";
}





  if($rootScope.createRoom){
    $rootScope.createRoom = false;
  }else{
    setInterval(function(){
      $scope.$apply(function () {
        $scope.panel.time++;
        if($scope.panel.time == 40){
         // $scope.getTip();
        }
        if($scope.panel.time == 80){
         // $scope.getTip();
        }
  
  
    });
     
    },1000)  

    //multiplayer();
    loadQuestion();
    loadResume();
    loadQuestion();
  }


  //Carregamento padrão
  //$rootScope.loadTemplate('./views/productsList.template.html');


  //renewNavs();
  // $rootScope.activetab = $location.path();
});

