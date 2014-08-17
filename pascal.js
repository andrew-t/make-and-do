'use strict';

angular.module('pascal', ['big'])
.controller('pascal', ['$scope', function(scope) {
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
					n: x == 0 || x == y 
						? new Big(1)
						: scope.triangle[scope.triangle.length - y - 1].n.plus(scope.triangle[scope.triangle.length - y].n)
				};
				scope.triangle.push(cell);
				if (x != end)
					backrow.push({
						x: y - x,
						y: y,
						n: cell.n
					});
				if (cell.n.eq(n)) {
					hits.push(cell);
					if (x != end)
						hits.push(backrow[backrow.length - 1]);
				}
			}
			while (backrow.length)
				scope.triangle.push(backrow.pop());
			if (hits.length >= maxHits)
				break;
		}
		scope.rows = y;
		return hits;
	};
	scope.search = function() {
		scope.hits = scope.find(scope.n, scope.maxHits);
	};
	scope.mouseIn = function(cell) {
		scope.hoverValue = cell;
	};
	scope.mouseOut = function(cell) {
		if (scope.hoverValue == cell)
			scope.hoverValue = undefined;
	};
	scope.fontSize = function(n) {
		return Math.max(10, // Font never smaller than 10px
			Math.min(25, // Font never larger than 25px
				90 /* = assumed cell size, pixels */ / n.toFixed(0).length));
	};
}]);