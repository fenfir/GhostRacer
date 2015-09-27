var GPS;

GPS = (function() {
  var gpsLocationReceived = new Event('gpsLocationReceived');
  function GPS() {
    this.latitude = 0;
    this.longitude = 0;
    this.init();
  }

  GPS.prototype.init = function() {
    if(navigator.geolocation) {
      var _this = this;
      navigator.geolocation.watchPosition(function(position) {
        _this.setLocation(position);
      }, function(err) {console.error(err)},
      {
        enableHighAccuracy: true,
        timeout: 500,
        maximumAge: 0
      }
    );
    }
    else {
      alert("Browser does not support geolocation.");
    }
  };

  GPS.prototype.getLocation = function() {
    return {
      lat: this.latitude,
      lng: this.longitude
    };
  };

  GPS.prototype.setLocation = function(position) {
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude

    document.dispatchEvent(gpsLocationReceived, this.getLocation());
    console.log("Current Location: " + this.latitude + ", " + this.longitude);
  };

  return GPS;
})();
