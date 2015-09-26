function Ghost() {
  var startTime = null;
  var route = null;
  var marker = null;
}

Ghost.prototype.init = function (route, marker) {
    this.route = route;
    this.marker = marker;

    map.addObject(marker);
};

Ghost.prototype.start = function() {
    this.startTime = new Date();

    var _this = this;
    window.setInterval( function () {
      _this.setGhostPosition();
    }, 30000);
};

Ghost.prototype.setGhostPosition = function() {
    var currentTime = new Date();
    var traveledTime = (currentTime - this.startTime)/1000;

    var i = 0;
    do {
      maneuver = this.route.leg[0].maneuver[i];
      traveledTime = traveledTime - maneuver.travelTime;
      i++;
    }
    while(traveledTime > 0);

    console.log(traveledTime);
    console.log(maneuver);

    this.marker.setPosition({
      lat: maneuver.position.latitude,
      lng: maneuver.position.longitude
    });
};
