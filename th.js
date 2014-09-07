'use strict';

angular.module('th', [])
.service('th', function() {
	// This service returns two letters to put after a cardinal number to make it into an ordinal number.
	return function(n) {
		if (!n)
			return '';
		if (n >= 10 && n <= 20)
			return 'th';
		switch (n.toString(10).replace(/^.*(\d)$/, '$1')) {
			case '1': return 'st'; break;
			case '2': return 'nd'; break;
			case '3': return 'rd'; break;
			default: return 'th'; break;
		}
	};
});