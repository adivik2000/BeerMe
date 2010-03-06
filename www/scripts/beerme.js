function Zoom(app) {
	this.beer = app; //reference to application
	this.level = 15; //default zoom level for static map
	this.min = 11; //minimum zoom level
	this.max = 19; //maximum zoom level
	this.controlStep = 30; //pixel step for moving the control around
	this.controlPosition = 155; //default 'top' style property for the control
	this.control = x$('#control');
	this.control.setStyle('top',this.controlPosition.toString() + 'px');
};
Zoom.prototype.into = function() {
	if (this.level == this.max) return false;
	this.level++;
	this.controlPosition -= this.controlStep;
	this.control.setStyle('top',this.controlPosition.toString() + 'px');
	this.beer.updateLocation();
};
Zoom.prototype.out = function() {
	if (this.level == this.min) return false;
	this.level--;
	this.controlPosition += this.controlStep;
	this.control.setStyle('top',this.controlPosition.toString() + 'px');
	this.beer.updateLocation();
};
/**
 * Contains most of the BeerMe application logic.
 */
function BeerMe() {
	// Stores current user coordinates.
	this.myCoords = {};
	// Stores beer markers.
	this.beerMarkers = [];
	// Controls zooming.
	this.zoom = new Zoom(this);
	this.detail = x$('#detailScreen');
};
/**
 * Removes all current beer markers.
 */
BeerMe.prototype.clear = function() {
	for (var i = 0; i < this.beerMarkers.length; i++) {
		this.beerMarkers[i].node.remove();
	}
	this.beerMarkers = [];
	this.detailScreen.setStyle('display','none');
}
/**
 * Initializes controls (attaches events, positions DOM nodes) and then starts a location update.
 */
BeerMe.prototype.init = function() {
	var dis = this;
	x$('#plus').click(function(){
		dis.zoom.into()
	});
	x$('#minus').click(function(){
		dis.zoom.out();
	});
	this.updateLocation();
};
/**
 * Renders beer icons representing fountains of beer on the map, based on data pulled in from services.
 * @param {Object} results An array of results containing place information.
 */
BeerMe.prototype.parseBeers = function(results) {
	for (var i = 0; i < results.length; i++) {
		var title = results[i].Title;
	}
};
/**
 * Uses PhoneGap geolocation call to retrieve GPS position, then makes a data request to BeerMapping & YQL for beereries (sweet new word I just made up).  
 */
BeerMe.prototype.updateLocation = function() {
	this.clear(); // remove old markers
	var dis = this;
	var win = function(position) {
		// Store coords.
		dis.myCoords = position.coords;
		// Call for static google maps data.
		var url = "http://maps.google.com/maps/api/staticmap?center=" + dis.myCoords.latitude + "," + dis.myCoords.longitude + "&zoom="+dis.zoom.level+"&size=320x480&maptype=roadmap&key=ABQIAAAASWkdhwcFZHCle_XL8gNI0hQQPTIxowtQGbc0PVHZZ3XLXr5GBhRKV3t_-63J9ZAJ2bYu3zsQdR9N-A&sensor=true"
		x$('#map').attr('src',url);
		x$('#loadingScreen').setStyle('display','none');
		// Call for beer data.
		dis.beerUpdate(dis.myCoords.latitude,dis.myCoords.longitude);
	};
	var fail = function(e) {
		alert('Can\'t retrieve position.\nError: ' + e);
	};
	navigator.geolocation.getCurrentPosition(win, fail);
};
/**
 * Returns the radius of beer establishments that should be queried for based on current zoom level.
 */
BeerMe.prototype.getCurrentRadius = function() {
	return (20 - this.zoom.level) * 2; // will return a value between 2 and 18 depending on how zoomed in you are.
};
BeerMe.prototype.getBeerFromBeerMapping = function(lat,lng) {
	var url = "http://beermapping.com/webservice/locgeo/33aac0960ce1fd70bd6e07191af96bd5/" + lat + "," + lng + "," + this.getCurrentRadius();
};
BeerMe.prototype.getBeerFromYQL = function(lat,lng) {
	var config = {'debug' : true};
	var format = '.';
	var yqlQuery = "select * from local.search where radius=" + this.getCurrentRadius() + " and latitude=" + lat + " and longitude=" + lng + " and query='beer'";
	var insertEl = 'resultsContainer';
	yqlWidget.push(yqlQuery, config, format, insertEl);
	yqlWidget.render();
};
BeerMe.prototype.beerUpdate = function(lat,lng) {
	this.beerMarkers = [];
	this.getBeerFromYQL(lat,lng);
	this.getBeerFromBeerMapping(lat,lng);
};
// Geolocation code shamelessly stolen from Movable Type scripts: http://www.movable-type.co.uk/scripts/latlong.html
function LatLon(lat, lon) {
	this.lat = lat;
	this.lon = lon;
}
LatLon.distCosineLaw = function(lat1, lon1, lat2, lon2) {
	var R = 6371; // earth's mean radius in km
	var d = Math.acos(Math.sin(lat1.toRad())*Math.sin(lat2.toRad()) +
		Math.cos(lat1.toRad())*Math.cos(lat2.toRad())*Math.cos((lon2-lon1).toRad())) * R;
	return d;
};
Number.prototype.toRad = function() {  // convert degrees to radians
	return this * Math.PI / 180;
};