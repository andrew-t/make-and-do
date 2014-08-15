'use strict';

// TODO - this should calculate the triangle like a kid, really.
// The combinatorics module doesn't help if we're generating the whole thing anyway.
// Also it probably needs big int support.

(function(){
	angular.module('pascal', ['choose'])
	.controller('pascal', ['$scope', 'combinatorics', function(scope, combinatorics) {
		scope.maxRows = 20;
		scope.maxHits = 10;
		scope.find = function(n, maxHits) {
			var hits = [];
			scope.triangle = [];
			for (var y = 0; y < scope.maxRows; ++y) {
				var end = y * 0.5, backrow = [];
				for (var x = 0; x <= end; ++x) {
					var cell = {
						x: x,
						y: y,
						n: combinatorics.combinations(y, x)
					};
					scope.triangle.push(cell);
					if (x != end)
						backrow.push({
							x: y - x,
							y: y,
							n: cell.n
						});
					if (cell.n == n)
						hits.push(cell);
				}
				while (backrow.length)
					scope.triangle.push(backrow.pop());
				if (hits.length >= maxHits)
					break;
			}
			scope.rows = y;
			return hits;
		};
		scope.fontSize = function(cellSize, max, n) {
			return Math.min(max, cellSize / n.toString(10).length);
		};
	}]);
})();