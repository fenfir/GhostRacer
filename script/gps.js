var GPS;

GPS = (function() {
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
      });
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
    
    console.log("Current Location: " + this.latitude + ", " + this.longitude);
  };

  return GPS;
})();
