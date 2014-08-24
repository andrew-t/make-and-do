'use strict';

angular.module('polygon', ['th'])
.service('polygon', ['th', function(th) {
	this.name = function(n, m, adjective) {
		if (n !== undefined) {
			n++;
			if (m == 4)
				return n + '\u00b2';
			if (n !== undefined) n += th(n);
		}
		var mgonal;
		switch (m) {
			case 3: mgonal = 'triangular'; break;
			case 4: mgonal = 'square'; break;
			case 5: mgonal = 'pentagonal'; break;
			case 6: mgonal = 'hexagonal'; break;
			case 7: mgonal = 'heptagonal'; break;
			case 8: mgonal = 'octagonal'; break;
			case 9: mgonal = 'nonagonal'; break;
			case 10: mgonal = 'decagonal'; break;
			case 12: mgonal = 'dodecagonal'; break;
			default: mgonal = m + '-gonal'; break;
		}
		return ((n ? 'The ' + n + ' ' : '') +
			(((adjective == 'generalised') && (m == 3 || m == 4)) ||
				((adjective == 'centred') && (m == 6))
					? '' : (adjective + ' ')) + 
			mgonal + ' number');
	};
	this.centred = function(n, m) {
		return 1 + m * n * (n + 1) * 0.5;
	};
	this.generalised = function(n, m) {
		return n * ((m - 2) * (n - 1) * 0.5 + 1);
	};
}]);