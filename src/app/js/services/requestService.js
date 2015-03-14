'use strict';

app.factory('requestService', ['$rootScope', '$http', 'apiEndpoint', 'apiVersion',
	function($rootScope, $http, apiEndpoint, apiVersion) {
		$http.defaults.useXDomain = true;
		var apiEndPointUrl = apiEndpoint + apiVersion;
		return {
			getQRCode: function(data, callback) {
				$http.get(apiEndPointUrl + '/qrcode/' + data).
	  				success(function(data, status, headers, config) {
						callback(data.qrcodeimg);
					}).
					error(function(data, status, headers, config) {

					}
				);
			}
		}
		
	}
])