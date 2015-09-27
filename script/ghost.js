function Ghost(mapObject) {
  this.startTime = null;
  this.route = null;
  this.marker = null;
  this.mapObject = mapObject;
}

Ghost.prototype.init = function (route, marker) {
    this.route = route;
    this.marker = marker;

    this.mapObject.map.addObject(marker);
};

Ghost.prototype.start = function() {
    this.startTime = new Date();

    var _this = this;
    window.setInterval( function () {
      _this.setGhostPosition();
    }, 10000);
};

Ghost.prototype.setGhostPosition = function() {
    var currentTime = new Date();
    var traveledTime = (currentTime - this.startTime)/1000;

    var i = 0;
    var maneuver = this.route.leg[0].maneuver[i];

    while(traveledTime > maneuver.travelTime) {
      maneuver = this.route.leg[0].maneuver[i];

      traveledTime = traveledTime - maneuver.travelTime;
      i++
    }

    var maneuverPortionTime = maneuver.travelTime / maneuver.shape.length;
    var segments = parseInt(traveledTime / maneuverPortionTime);
    console.log(i + ", " + segments);

    var shapeCoord = (segments > maneuver.shape.length ? maneuver.shape[maneuver.shape.length] : maneuver.shape[segments]).split(",");

    //console.log(traveledTime);
    //console.log(maneuver);

    this.marker.setPosition({
      lat: shapeCoord[0],
      lng: shapeCoord[1]
    });
};
