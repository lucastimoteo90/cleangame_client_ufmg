var app = angular.module('cleangame', ['ngRoute']);

/*  
 Esta diretiva permite chamar uma função qualquer ao pressionar a tecla Enter.  
  */  
 app.directive('ngEnter', function () {  
  return function (scope, element, attrs) {  
    element.bind("keydown keypress", function (event) {  
      if(event.which === 13) {  
        scope.$apply(function (){  
          scope.$eval(attrs.ngEnter);  
        });  
        event.preventDefault();  
      }  
    });  
  };  
}); 

local = false;

if(local){
  app.constant('ApiPath', "http://localhost:8080");
  app.constant('SocketServer', "http://localhost");
  app.constant('SocketPort', "2000");
  app.constant('Domain', "localhost");
}else{
  app.constant('ApiPath', "http://cleangame.site:8080");
  app.constant('SocketServer', "http://cleangame.site");
  app.constant('SocketPort', "8081");
  app.constant('Domain', "http://cleangame.site");
}

 
app.config(function ($routeProvider, $locationProvider) {

  $locationProvider.html5Mode(true);
  
 
  $routeProvider
    // para a rota '/', carregaremos o template home.html e o controller 'HomeCtrl'
    .when('/', {
      templateUrl: './views/skeleton.template.html',
      controller: 'SkeletonCtrl',
    })
    .when('/invite/:inviteid', {
      templateUrl: './views/skeleton.template.html',
      controller: 'SkeletonCtrl',
    })
    .when('/painel', {
      templateUrl: './views/skeleton.template.html',
      controller: 'RoomsCtrl',
    })
    // caso não seja nenhum desses, redirecione para a rota '/'
    .otherwise({ redirectTo: '/' });
});


app.run(function ($rootScope, $location) {
  $rootScope.pagesHistory = []; 
  
  
  //Executa ao iniciar carregamento da rota
  $rootScope.$on('$locationChangeStart', function () { //iremos chamar essa função sempre que o endereço for alterado
    
  });

  //Executa ao terminar carregamento da rota
  $rootScope.$on('$locationChangeSuccess', function () { //iremos chamar essa função sempre que o endereço for alterado
  
  });

});




$(document).keydown(function(e){
  if(e.keyCode == 13) {
      $('#send').click();
  }
});

