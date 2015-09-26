var platform = new H.service.Platform({
  app_id: 'wAyEN89HTlpRAvac35cq',
  app_code: 'ja49DO9r9lVmZaMjVsneEA'
});

var routeInstructionsContainer = document.getElementById('panel');
var currentLocationMarker;
var map;

function initializeMap() {
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

function addPolyline(map) {
  var points = [
    { lat: 52.5309825, lng: 13.3845921 },
    { lat: 52.5311923, lng: 13.3853495 },
    { lat: 52.5313532, lng: 13.3861756 },
    { lat: 52.5315142, lng: 13.3872163 },
    { lat: 52.5316215, lng: 13.3885574 },
    { lat: 52.5320399, lng: 13.3925807 },
    { lat: 52.5321472, lng: 13.3935785 },
    { lat: 52.5323832, lng: 13.395499  },
    { lat: 52.5324261, lng: 13.3959818 },
    { lat: 52.5325012, lng: 13.397795  },
    { lat: 52.5325656, lng: 13.3986318 },
    { lat: 52.5326192, lng: 13.3989215 },
    { lat: 52.5325119, lng: 13.3989751 },
    { lat: 52.5323081, lng: 13.3991039 },
    { lat: 52.5318789, lng: 13.3994472 },
    { lat: 52.5301194, lng: 13.4009278 },
    { lat: 52.5297546, lng: 13.4012604 },
    { lat: 52.5296152, lng: 13.4014106 },
    { lat: 52.5289822, lng: 13.4018934 },
    { lat: 52.5276947, lng: 13.4029663 },
    { lat: 52.5271797, lng: 13.4033203 },
    { lat: 52.5269973, lng: 13.4033954 },
    { lat: 52.5265145, lng: 13.4035349 },
    { lat: 52.5260746, lng: 13.4036851 },
    { lat: 52.5260103, lng: 13.4038353 },
    { lat: 52.5256562, lng: 13.40464   },
    { lat: 52.5253022, lng: 13.4053588 },
    { lat: 52.5250447, lng: 13.4059381 },
    { lat: 52.5249588, lng: 13.4062278 },
    { lat: 52.5249267, lng: 13.4064317 },
    { lat: 52.5249052, lng: 13.406775  },
    { lat: 52.5248623, lng: 13.4069574 },
    { lat: 52.5241864, lng: 13.4089208 },
    { lat: 52.5241327, lng: 13.4091246 },
    { lat: 52.5240898, lng: 13.409307  },
    { lat: 52.5240040, lng: 13.4096611 },
    { lat: 52.5239503, lng: 13.4101653 },
    { lat: 52.5239289, lng: 13.4110343 },
    { lat: 52.5238967, lng: 13.4117103 },
    { lat: 52.5238752, lng: 13.4120321 },
    { lat: 52.5236285, lng: 13.4126866 },
    { lat: 52.5231242, lng: 13.4139311 },
    { lat: 52.5227809, lng: 13.4146714 },
    { lat: 52.5224799, lng: 13.4152412 }
  ];

  // Initialize a strip and add all the points to it:
  var strip = new H.geo.Strip();
  points.forEach(function(point) {
    strip.pushPoint(point);
  });

  // Initialize a polyline with the strip:
  var polyline = new H.map.Polyline(strip, { style: { lineWidth: 10 }});

  // Add the polyline to the map:
  map.addObject(polyline);
  map.setViewBounds(polyline.getBounds());
}

function getGPSLocation() {
  if(navigator.geolocation) {
    console.log("Getting position");
    navigator.geolocation.getCurrentPosition(showPosition);
  }
  else {
    alert("Browser does not support geolocation.");
  }
}

function showPosition(position) {
  if(map !== null) {
    var hereLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    currentLocationMarker = new H.map.Marker(hereLocation);

    map.addObject(currentLocationMarker);
    map.setCenter(hereLocation);
    map.setZoom(15, true);
  }
}

function calculateRoute(platform) {
  var router = platform.getRoutingService(),
    routeRequestParams = {
      mode: 'fastest;publicTransport',
      representation: 'display',
      waypoint0: '52.5208,13.4093', // Fernsehturm
      waypoint1: '52.5034,13.3280',  // Kurfürstendamm
      routeattributes: 'waypoints,summary,shape,legs',
      maneuverattributes: 'direction,action',
      avoidtransporttypes: 'railMetro,railLight,railRegional,railLight,railRegional,trainRegional'
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
	var route = result.response.route[0];

	addRouteShapeToMap(route);
	addSummaryToPanel(route.summary);
}

function routeCalculationError(error) {
	console.log(error);
	alert("error");
}

/**
 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
 * @param {Object} route A route as received from the H.service.RoutingService
 */
function addRouteShapeToMap(route){
  var strip = new H.geo.Strip(),
    routeShape = route.shape,
    polyline;

  routeShape.forEach(function(point) {
    var parts = point.split(',');
    strip.pushLatLngAlt(parts[0], parts[1]);
  });

  polyline = new H.map.Polyline(strip, {
    style: {
      lineWidth: 4,
      strokeColor: 'rgba(0, 128, 255, 0.7)'
    }
  });
  // Add the polyline to the map
  map.addObject(polyline);
  // And zoom to its bounding rectangle
  map.setViewBounds(polyline.getBounds(), true);
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
  routeInstructionsContainer.appendChild(summaryDiv);
}
