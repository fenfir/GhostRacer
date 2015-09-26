var platform = new H.service.Platform({
  'app_id': 'wAyEN89HTlpRAvac35cq',
  'app_code': 'ja49DO9r9lVmZaMjVsneEA'
});

var currentLocationMarker;
var map;

function initializeMap() {
    // Obtain the default map types from the platform object:
    var defaultLayers = platform.createDefaultLayers();

    // Instantiate (and display) a map object:
    map = new H.Map(
	document.getElementById('mapContainer'),
	defaultLayers.normal.map,
	{
	    zoom: 10,
	    center: { lat: 52.5, lng: 13.4 }
    });
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
	currentLocationMarker = new H.map.Marker({
	    lat: position.coords.latitude,
	    lng: position.coords.longitude
	});
	
	map.addObject(currentLocationMarker);
    }
}
