var platform = new H.service.Platform({
  app_id: 'wAyEN89HTlpRAvac35cq',
  app_code: 'ja49DO9r9lVmZaMjVsneEA'
});

var routeInstructionsContainer = document.getElementById('panel');
var routeShapeObjects = [];
var currentLocationMarker;
var map = null;
var inactivePathColor = 'rgba(0, 0, 0, 0.7)';
var activePathColor = 'rgba(0, 255, 0, 0.7)';

function initializeMap() {
  if(map !== null)
    return;

  console.log("Initializing Map");
  // Obtain the default map types from the platform object:
  var defaultLayers = platform.createDefaultLayers();

  // Instantiate (and display) a map object:
  map = new H.Map(
    document.getElementById('mapContainer'),
    defaultLayers.normal.transit,
    {
      zoom: 10,
      center: { lat: 52.5, lng: 13.4 }
    });

    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    var ui = H.ui.UI.createDefault(map, defaultLayers);

    getGPSLocation();
}

function resetMap() {
  localStorage.clear();

  $("#route-list").empty();

  map.removeObjects(routeShapeObjects);
  routeShapeObjects = [];
}

function getGPSLocation() {
  if(navigator.geolocation) {
    console.log("Getting position");
    navigator.geolocation.getCurrentPosition(setPosition);
    navigator.geolocation.watchPosition(showPosition);
  }
  else {
    alert("Browser does not support geolocation.");
  }
}

function setPosition(position) {
  if(map !== null) {
    var hereLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    currentLocationMarker = new H.map.Marker(hereLocation);

    showPosition(position);

    map.addObject(currentLocationMarker);
    map.setCenter(hereLocation);
    map.setZoom(15, true);
  }
}

function showPosition(position) {
    var hereLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    currentLocationMarker.setPosition(hereLocation);
}

function calculateRoute(platform, startLocation, stopLocation) {
  resetMap();

  var router = platform.getRoutingService(),
    routeRequestParams = {
      mode: 'fastest;publicTransport',
      representation: 'display',
      waypoint0: startLocation.lat + "," + startLocation.lng,
      waypoint1: stopLocation.lat + "," + stopLocation.lng,
      routeattributes: 'waypoints,summary,shape,legs',
      maneuverattributes: 'direction,action',
      alternatives: 1
    };

  router.calculateRoute(
  	routeRequestParams,
  	routeCalculationSuccess,
  	routeCalculationError
	);
}

function routeCalculationSuccess(result) {
	console.log("success");
	console.log(result);

  for(var i = 0; i < result.response.route.length; i++) {
    var route = result.response.route[i];
	  addRouteShapeToMap(route, 'rgba(0, 0, 0, 0.8)');
	  addSummaryToPanel(route.summary);
  }

  addRoutesToList(result.response.route);

  map.addObjects(routeShapeObjects);

  routeSelected(0);
}

function routeCalculationError(error) {
	console.log(error);
	alert("error");
}

function geocode(platform, searchtext) {
  var geocoder = platform.getGeocodingService(),
    geocodingParameters = {
      searchText: searchtext,
      city: 'berlin',
      country: 'de'
    };

  geocoder.geocode(
    geocodingParameters,
    geocodeSuccess,
    geocodeError
  );
}

function geocodeSuccess(result) {
	console.log(result);
	if(result.Response.View.length > 0 && result.Response.View[0].Result.length > 0) {
		var locations = result.Response.View[0].Result;
		// TODO: handle multiple results
		var coords = locations[0].Location.DisplayPosition;
		console.log(coords);
    console.log(currentLocationMarker.getPosition());
		calculateRoute(platform, {
      lat: currentLocationMarker.getPosition().lat,
      lng: currentLocationMarker.getPosition().lng
    }, {
      lat: coords.Latitude,
      lng: coords.Longitude
    });
	} else {
		alert("We have not found your address. Try again.")
	}
}

function geocodeError(error) {
	console.error(error);
}

/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
 function addRouteShapeToMap(route, color){
   var strip = new H.geo.Strip(),
     routeShape = route.shape,
     polyline;

   routeShape.forEach(function(point) {
     var parts = point.split(',');
     strip.pushLatLngAlt(parts[0], parts[1]);
   });

   polyline = new H.map.Polyline(strip, {
     style: {
       lineWidth: 10,
       strokeColor: color
     }
   });

   routeShapeObjects.push(polyline);
 }

/**
 * Creates a series of H.map.Marker points from the route and adds them to the map.
 * @param {Object} route  A route as received from the H.service.RoutingService
 */
function addSummaryToPanel(summary){
  var summaryDiv = document.createElement('div'),
   content = '';
   content += '<b>Total distance</b>: ' + summary.distance  + 'm. <br/>';
   content += '<b>Travel Time</b>: ' + summary.travelTime + ' (in current traffic)';

  summaryDiv.style.fontSize = 'small';
  summaryDiv.style.marginLeft ='5%';
  summaryDiv.style.marginRight ='5%';
  summaryDiv.innerHTML = content;

  routeInstructionsContainer.innerHTML = "";
  routeInstructionsContainer.appendChild(summaryDiv);
}

function addRoutesToList(route) {
  for(var i = 0; i < route.length; i++) {
    var routeSummary = $("<div></div>").attr("id", "route" + i);
    routeSummary.attr("data-id", i);
    routeSummary.append("<h2>" + route[i].waypoint[0].label + "</h2>");
    routeSummary.append("<b>" + route[i].leg[0].maneuver[0].instruction + "</b><br/>");
    routeSummary.append('<b>Total distance</b>: ' + route[i].summary.distance  + 'm. <br/>');
    routeSummary.append('<b>Travel Time</b>: ' + route[i].summary.travelTime + ' (in current traffic)');
    routeSummary.click(
      function () {
        routeSelected($(this).attr("data-id"));
      }
    );

    saveRoute(i, route[i]);

    $("#route-list").append(routeSummary);
  }
}

function saveRoute(routeId, route) {
  console.log("Saving route " + routeId);
  localStorage.setItem("route" + routeId, JSON.stringify(route));
}

function getRoute(routeId) {
  console.log("Retrieving route " + routeId);
  return JSON.parse(localStorage.getItem("route" + routeId));
}

function routeSelected(routeId) {
  var route = getRoute(routeId);

  for(var i = 0; i < routeShapeObjects.length; i++) {
    routeShapeObjects[i].setStyle({
      lineWidth: 10,
      strokeColor: inactivePathColor
    });
  }

  routeShapeObjects[routeId].setStyle({
    lineWidth: 10,
    strokeColor: activePathColor
  });

  map.setViewBounds(routeShapeObjects[routeId].getBounds());
}

function startGhost(route) {
  var ghost = new Ghost();
  var marker =  new H.map.Marker(currentLocationMarker.getPosition(), {
    icon: new H.map.Icon("images/ghosts/pink.png", {
      size: {
        w: 40,
        h: 40
      }
    })
  });
  ghost.init(route, marker);
  ghost.start();
}
