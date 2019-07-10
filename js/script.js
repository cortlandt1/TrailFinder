var lat = 0;
var long = 0;
var db = firebase.database();
var users = db.ref("users");
var weather;
var user;

//this is for the login pop-up window
$(document).ready(function()
{
  $('.parallax').parallax();
  $('.sidenav').sidenav();
  $("#cardholder").click(function () {
    setTimeout(function () {
      ShowMap();
    }, 500);
  });


  user = localStorage.username.toLowerCase() + localStorage.pass.toLowerCase();
  if (localStorage.username !== "") {
    $(".userBtn").html(`Welcome ${localStorage.username}!`);
    $(".userBtn").attr("onclick", "");
  }
  setTimeout( getFavorites, 500 );
  

  
});

function loginPopUp() {
  document.getElementById('modalWrap').style.display='block'
}

function signOut() {
  localStorage.removeItem("username");
  localStorage.removeItem("pass");
  $(".userBtn").html(`Login`);
  $(".userBtn").attr("onclick", "loginPopUp()");
  $("#favholder").empty();
}

function goToFavs() {
  $([document.documentElement, document.body]).animate({
    scrollTop: $("#favholder").offset().top
  }, 1000);
}

function setLogin () {
  event.preventDefault();
  localStorage.setItem("username", $("#uName").val())
  localStorage.setItem("pass", $("#pswd").val())
  user = localStorage.username.toLowerCase() + localStorage.pass.toLowerCase();
  document.getElementById('modalWrap').style.display = 'none';
  $(".userBtn").html(`Welcome ${localStorage.username}!`);
  $(".userBtn").attr("onclick", "");
  getFavorites()
}


//Pop-up login window
//If the user clicks anywhere outside of the login modal, it will close
// var modal = document.getElementById('modalWrap');
// window.onclick = function(event) {
//   if (event.target == modal) {
//     modal.style.display = "none"
//   }
// }

//this is for the parallax, which displays today's current weather pic using a key word from the weather API
var pArr = ['img/cloudy_day.jpg', 'img/sunny_day.jpg', 'img/rainy day.jpg']   

function getLocation() {
  event.preventDefault();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  }
}

//Checking if favRow is empty
window.onload = function () {
  if ( $.trim( $('#favholder').text() ).length == 0 ) {
    $('.carouselHidden').css("display", "none")
    // check if div is empty, with &amp;nbsp; or white-space
  }
}

function showPosition(position) {
  
  lat = position.coords.latitude;
  long = position.coords.longitude;

  var hikingURL = `https://www.hikingproject.com/data/get-trails?maxResults=20&lat=${lat}&lon=${long}&maxDistance=10&key=200356178-455274bda6e2c8c2496858d99e90dcc7`;
  
  
  
  $.get(hikingURL)
  .then(function(response) {
    $("#cardholder").empty();
    for (i = 0; i < response.trails.length; i++) {
      $("#cardholder").append(`
      <a class="carousel-item" data-Mylat="${response.trails[i].latitude}" 
      data-Mylon="${response.trails[i].longitude}"  data-MyName="${response.trails[i].name}"  data-myLoc="${response.trails[i].location}" >  
      <div class="card">
      <div class="card-image">
      <img src="${response.trails[i].imgSmallMed}" onerror="this.onerror=null;this.src='img/defaultpic.png'">
      <span class="card-title">${response.trails[i].name}</span>
      </div>
      <div class="card-content nonFav">
      <p>${response.trails[i].location}</p>
      <br>
      <p>${response.trails[i].summary}</p>
      </div>
      <div class="card-action">
      <button class="addFavorite btn" data-id="${response.trails[i].id}">Add to Favorites<i class="material-icons right">thumb_up</i></button>
      </div>
      </div>
      </a>
      `)
    }
    
    weatherAPI(lat, long)
     setTimeout(function () {
       $('.carousel').carousel();
       $('.carousel-slider').slider({ full_width: true });
     }, 500)
   })
}

//addFavorite
$(document).on("click", ".addFavorite", function () {
  user =  localStorage.username.toLowerCase() + localStorage.pass.toLowerCase();
  firebase.database().ref('users/' + user + '/favorites').push($(this).attr("data-id"));
})

function getFavorites() {
  firebase.database().ref('users/' + user + '/favorites').on("child_added", function (fav) {

    var hikingURL = `https://www.hikingproject.com/data/get-trails-by-id?ids=${fav.val()}&key=200356178-455274bda6e2c8c2496858d99e90dcc7`;

    $.get(hikingURL)
      .then(function (response) {
          $("#favholder").append(`
    <a class="carousel-item">  
    <div class="card">
      <div class="card-image">
        <img src="${response.trails[0].imgSmallMed}" onerror="this.onerror=null;this.src='img/defaultpic.png'">
        <span class="card-title">${response.trails[0].name}</span>
      </div>
      <div class="card-content">
        <p>${response.trails[0].location}</p>
        <br>
        <p>${response.trails[0].summary}</p>
      </div>
       <div class="card-action">
       <p data-id="${response.trails.id}">Favorite!</p>
        </div>
    </div>
    </a>
    `)    
  })
    setTimeout(function () {
      $('#favholder').carousel();
      $('.carousel-slider').slider({ full_width: true });
    }, 500)
})
}

function findLocation () {
  event.preventDefault();
  
  var local = $("#cityName").val();
  $.get(`https://dev.virtualearth.net/REST/v1/Locations/${local}?&maxResults=1&key=Ami0rQuZG9aaTceHF0XA2qTY0BWc1D5gUXmI0R1VJ_URY8sHjBb4ksEK85edNRjY`)
  .then(function (localResponse) {
    lat = localResponse.resourceSets[0].resources[0].point.coordinates[0];
    long = localResponse.resourceSets[0].resources[0].point.coordinates[1];

    var hikingURL = `https://www.hikingproject.com/data/get-trails?maxResults=20&lat=${lat}&lon=${long}&maxDistance=10&key=200356178-455274bda6e2c8c2496858d99e90dcc7`;
   
    $.get(hikingURL)
    .then(function (response) {
     
      $("#cardholder").empty();
        for (i = 0; i < response.trails.length; i++) {
          $("#cardholder").append(`
        <a class="carousel-item" data-Mylat="${response.trails[i].latitude}" 
      data-Mylon="${response.trails[i].longitude}"  data-MyName="${response.trails[i].name}"  data-myLoc="${response.trails[i].location}" >  
      <div class="card">
      <div class="card-image">
      <img src="${response.trails[i].imgSmallMed}" onerror="this.onerror=null;this.src='img/defaultpic.png'">
      <span class="card-title">${response.trails[i].name}</span>
      </div>
      <div class="card-content nonFav">
      <p>${response.trails[i].location}</p>
      <br>
      <p>${response.trails[i].summary}</p>
      </div>
      <div class="card-action">
      <button class="addFavorite btn" data-id="${response.trails[i].id}">Add to Favorites<i class="material-icons right">thumb_up</i></button>
      </div>
      </div>
      </a>
    `)
        }
        weatherAPI(lat, long)
        setTimeout(function () {
          $('.carousel').carousel();
          $('.carousel-slider').slider({ full_width: true });
        }, 500)
      })
    }).then(setTimeout(function () {
      if ($("#cardholder").has("a").length) {
      $("#cityName").val("");
      $("#cityName").attr("placeholder", "City Name");
    }
    else {  
      $("#cityName").attr("placeholder", "No Results Found");
      $("#cityName").val("");
    }
}, 1000))

}


//Weather API call
function weatherAPI (lat, long) {
  

  var queryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&APPID=30ad9365801925ba6147c686f6736863`

  $.ajax({
    url: queryURL,
    method: "GET"
  })
  
  .then(function(response) {
    var results = response.data;
    
//Weather Icon Conditionals
weather = response.weather[0].main;

switch (weather) {
  case "Clear":
  $(".nonFav").prepend('<img src="./img/Sunny_icon.png" alt="" class="icon">')
    break;
    case "Clouds":
    $(".nonFav").prepend('<img src="./img/cloudy_icon.png" alt="" class="icon">')
    break;
    case "Mist":
  $(".nonFav").prepend('<img src="./img/foggy_icon.png" alt="" class="icon">')
  break; 
  case "Rain":
  $(".nonFav").prepend('<img src="./img/rainy_icon.png" alt="" class="icon">')
  break;
  case "Haze":
  $(".nonFav").prepend('<img src="./img/foggy_icon.png" alt="" class="icon">')
    break;
    case "Thunderstorm":
    $(".nonFav").prepend('<img src="./img/thunderstorm_icon.png" alt="" class="icon">')
    break;
    }
  })
}


function ShowMap() {
  document.getElementById('mymap').innerHTML = "<div id='map'  class='MyMapStyle' ></div>";
  var lat = $(".carousel-item.active").attr("data-mylat");
  var longt = $(".carousel-item.active").attr("data-mylon");
  var name = $(".carousel-item.active").attr("data-myname");
  var locationt = $(".carousel-item.active").attr("data-myloc");
  var TrailCoordinates = [lat, longt];
  tomtom.setProductInfo('<your-product-id>', '<your-product-version>');
  var map = tomtom.L.map('map', {
    key: "C6NrG0gPZdXA0IVSWigw0gAkxAD8ZJPc",
    basePath: 'SDK',
    center: TrailCoordinates,
    zoom: 15

  });
  var marker = tomtom.L.marker(TrailCoordinates).addTo(map);
  marker.bindPopup("<b>" + name + "</b><br/>" + locationt).openPopup();
}

    
    
    
    









