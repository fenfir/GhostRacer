function Map(gpsObject) {
  this.routeShapeObjects = [];
  this.routeList = [];
  this.platform = new H.service.Platform({
    app_id: 'wAyEN89HTlpRAvac35cq',
    app_code: 'ja49DO9r9lVmZaMjVsneEA'
  });

  this.map = null;
  this.gpsObject = gpsObject;
  this.isInit = false;
  this.currentLocationMarker = null;
}

Map.prototype.init = function(latitude, longitude) {
  if(!this.isInit) {
    console.log("Initializing Map");
    // Obtain the default map types from the platform object:
    var defaultLayers = this.platform.createDefaultLayers();

    // Instantiate (and display) a map object:
    this.map = new H.Map(
      document.getElementById('mapContainer'),
      defaultLayers.normal.transit,
      {
        zoom: 10,
        center: { lat: latitude, lng: longitude }
      });

      var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
      var ui = H.ui.UI.createDefault(this.map, defaultLayers);

      this.currentLocationMarker = new H.map.Marker({ lat: latitude, lng: longitude });
      this.map.addObject(this.currentLocationMarker);
      this.map.setZoom(15, true);

      this.isInit = true;
    }
  }

  Map.prototype.load = function(endLocation) {
    var mapObject = this;
    var endCoordinates = this.geocode(endLocation, function(result) {
      loadSuccess(mapObject, result)
    });
  }

  function loadSuccess(mapObject, result) {
    if(result.Response.View.length > 0 && result.Response.View[0].Result.length > 0) {
      var locations = result.Response.View[0].Result;
      // TODO: handle multiple results
      var coords = locations[0].Location.DisplayPosition;
      console.log("Destination: " + coords.Longitude + ", " + coords.Latitude);
      mapObject.calculateRoute(mapObject.gpsObject.getLocation(), { lat: coords.Latitude, lng: coords.Longitude }, function(result) {
        routingSuccess(mapObject, result);
      });
    } else {
      alert("We have not found your address. Try again.")
    }
  }

  function routingSuccess(mapObject, result) {
    mapObject.reset();

    console.log("Route success");
    console.log(result);

    for(var i = 0; i < result.response.route.length; i++) {
      var route = result.response.route[i];
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
          strokeColor: inactivePathColor
        }
      });

      mapObject.routeShapeObjects.push(polyline);
      mapObject.routeList.push(route);
      mapObject.addRouteToList(mapObject, i, route);
      mapObject.saveRoute(i, route);
    }

    mapObject.map.addObjects(mapObject.routeShapeObjects);
    mapObject.routeSelected(0);
  }

  Map.prototype.routeSelected = function(routeId) {
    var route = this.getRoute(routeId);

    for(var i = 0; i < this.routeShapeObjects.length; i++) {
      this.routeShapeObjects[i].setStyle({
        lineWidth: 10,
        strokeColor: inactivePathColor
      });
    }

    this.routeShapeObjects[routeId].setStyle({
      lineWidth: 10,
      strokeColor: activePathColor
    });

    this.map.setViewBounds(this.routeShapeObjects[routeId].getBounds());
  }

  Map.prototype.addRouteToList = function (mapObject, routeId, route) {
      var routeSummary = $("<div></div>").attr("id", "route" + routeId);
      routeSummary.attr("data-id", routeId);
      routeSummary.append("<h2>" + route.waypoint[0].label + "</h2>");
      routeSummary.append("<b>" + route.leg[0].maneuver[0].instruction + "</b><br/>");
      routeSummary.append('<b>Total distance</b>: ' + route.summary.distance  + 'm. <br/>');
      routeSummary.append('<b>Travel Time</b>: ' + route.summary.travelTime + ' (in current traffic)');
      routeSummary.click(
        function () {
          mapObject.routeSelected($(this).attr("data-id"));
        }
      );

      $("#route-list").append(routeSummary);
  }

  Map.prototype.getRoute = function(routeId) {
    console.log("Retrieving route " + routeId);
    return JSON.parse(localStorage.getItem("route" + routeId));
  }

  Map.prototype.saveRoute = function(routeId, route) {
    console.log("Saving route " + routeId);
    localStorage.setItem("route" + routeId, JSON.stringify(route));
  }

  Map.prototype.geocode = function(searchTerm, success) {
    var geocoder = this.platform.getGeocodingService(),
    geocodingParameters = {
      searchText: searchTerm,
      city: 'berlin',
      country: 'de'
    };

    geocoder.geocode(
      geocodingParameters,
      success,
      geocodeError
    );
  }

  Map.prototype.calculateRoute = function(startLocation, stopLocation, success) {
    //this.reset();

    var router = this.platform.getRoutingService(),
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
      success,
      routeCalculationError
    );
  }

  Map.prototype.reset = function () {
    localStorage.clear();

    $("#route-list").empty();

    this.map.removeObjects(this.routeShapeObjects);
    this.routeShapeObjects = [];
  }