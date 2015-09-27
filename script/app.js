var inactivePathColor = 'rgba(0, 0, 0, 0.7)';
var activePathColor = 'rgba(0, 255, 0, 0.7)';
var iconFormat = "gif";
var ghostColor = [
	"red",
	"blue",
	"yellow",
	"pink"
];

function routeCalculationError(error) {
	console.log(error);
	alert("error");
}

function geocodeError(error) {
	console.error(error);
}
