var inactivePathColor = 'rgba(0, 0, 0, 0.7)';
var activePathColor = 'rgba(0, 255, 0, 0.7)';

function routeCalculationError(error) {
	console.log(error);
	alert("error");
}

function geocodeError(error) {
	console.error(error);
}

function startGhost(route) {
  var ghost = new Ghost();
  var ghostIcon = document.createElement('img');
  ghostIcon.style.cssText = "width: 40px; height: 40px; margin-top: -20px; margin-left: -20px;";
  ghostIcon.src = "images/ghosts/pink.gif";
  var marker =  new H.map.DomMarker(currentLocationMarker.getPosition(), {
    icon: new H.map.DomIcon(ghostIcon)
  });
  ghost.init(route, marker);
  ghost.start();
}
