// Inicializacion de la app
var app = angular.module("gipis", ['ngSanitize', 'ngRoute']);

app.run(function ($rootScope,$location) {
  moment.lang('es', {
    months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
    monthsShort: 'Enero._Feb._Mar_Abr._May_Jun_Jul._Ago_Sept._Oct._Nov._Dec.'.split('_'),
    weekdays: 'Domingo_Lunes_Martes_Miercoles_Jueves_Viernes_Sabado'.split('_'),
    weekdaysShort: 'Dom._Lun._Mar._Mier._Jue._Vier._Sab.'.split('_'),
    weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_Sa'.split('_'),
    relativeTime : {
        future : 'en %s',
        past : 'hace %s',
        s : 'segundos',
        m : 'un minuto',
        mm : '%d minutos',
        h : 'una hora',
        hh : '%d horas',
        d : 'un día',
        dd : '%d días',
        M : 'un mes',
        MM : '%d meses',
        y : 'un año',
        yy : '%d años'
    }
  });
  jQuery.getJSON("database.json", function(data) { // Descargar base de datos
    $rootScope.db = data; 
    if($location.path() == "/research") // Si inicia directamente en publicaciones
      $rootScope.setResearchSection($rootScope.db.research.sections[0]); // Por defecto, mostrar el primer grupo de items
    if($location.path() == "/contact") // Si inicia en la seccion de contacto
      $rootScope.renderMap(); // Generar mapa
    $rootScope.$apply(); // Esto es asincrono asi que hay que actualizar el binding
  });

  $rootScope.setResearchSection = function(section){ // Al seleccionar una seccion del dropdown
    $rootScope.researchSection = section;
    $rootScope.researchSection.items = [];
    for(var k in section.content) // Generar arreglo de publicaciones (para ordenar, filtrar, etc)
      $rootScope.researchSection.items.push($rootScope.db.research.items[section.content[k]]);
    $rootScope.currentLocation = 'research';
  };

  $rootScope.viewMember = function(member){ // Copiar objeto con detalles del miembro para mostrar en modal
    $rootScope.selectedMember = member;
  };

  $rootScope.memberList = function (members) { // Devuelve los nombres de los autores separados por coma como string
    var names = [];
    for(var k in members)
      names.push($rootScope.db.group.members[members[k]].name);
    return names.join(", "); // Apellidos separados por coma
  };

  $rootScope.viewWork = function(work){ // Copiar objeto con detalles del miembro para mostrar en modal
    $rootScope.selectedWork = work;
  };

  $rootScope.readableTime = function(timestamp){ // Fecha y hora formal
    return moment(timestamp).format("DD/MM/YYYY HH:mm");
  };

  $rootScope.relativeTime = function(timestamp){ // Tiempo relativo al actual    
    return moment(timestamp).fromNow();
  };

  $rootScope.renderMap = function(){ // Genera el mapa OpenstreetMap con Leaflet
    $rootScope.currentLocation='contact';
    setTimeout(function(){
      var map = L.map('map').setView([-45.8253301,-67.4634281], 18);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: ''}).addTo(map);
      L.marker([-45.8253301,-67.4634281]).addTo(map).bindPopup('GIPIS').openPopup();
    },500);
  };
})
.config(function ($routeProvider) { // Ruteo
  $routeProvider
  .when("/", {
    templateUrl: "views/home.html"
  })
  .when("/home", {
    templateUrl: "views/home.html"
  })
  .when("/group", {
    templateUrl: "views/group.html"
  })
  .when("/research", {
    templateUrl: "views/research.html"
  })
  .when("/our_work", {
    templateUrl: "views/work.html"
  })
  .when("/contact", {
    templateUrl: "views/contact.html"
  });
})
.config(['$locationProvider', function ($locationProvider) {
  // Ver: https://stackoverflow.com/questions/41272314/angular-all-slashes-in-url-changed-to-2f
  $locationProvider.hashPrefix('');
}])
.filter('trusted', ['$sce', function ($sce) {
  // Ver: https://stackoverflow.com/questions/39480969/angular-interpolateinterr-error-when-adding-url-from-variable
  return $sce.trustAsResourceUrl;
}]);
