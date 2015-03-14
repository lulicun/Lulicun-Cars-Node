'use strict';
app.controller('QRCodeReminderCtrl', ['$scope', '$rootScope', '$routeParams',
	function($scope, $rootScope, $routeParams) {
		console.log("QRCodeReminderCtrl");
		
		console.log("Received: ", $routeParams.id);
	}
]);