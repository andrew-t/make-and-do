'use strict';

angular.module('polygon', [])
.service('polygon', function() {
	this.th = function(n) {
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
	this.name = function(n, m, adjective) {
		if (n) {
			n++;
			if (m == 4)
				return n + '\u00b2';
			if (n) n += this.th(n);
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
			default: mgonal += '-gonal'; break;
		}
		return ((n ? 'The ' + n + ' ' : '') +
			(((adjective == 'generalised') && (m == 3 || m == 4)) ||
				((adjective == 'centred') && (m == 6))
					? '' : (adjective + ' ')) + 
			mgonal + ' number');
	};
	this.centred = function(n, m) {
		return 1 + m * n * (n - 1) * 0.5;
	};
	this.generalised = function(n, m) {
		return n * ((m - 2) * (n - 1) * 0.5 + 1);
	};
});