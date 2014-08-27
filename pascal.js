'use strict';

angular.module('pascal', ['big'])
.controller('pascal', ['$scope', function(scope) {
	scope.maxRows = 20;
	scope.maxCells = 1000;
	scope.search = function(n) {
		var hits = [], row, lastRow, triangle = [];
		scope.triangle = [];
		for (var y = 0; y < scope.maxRows; ++y) {
			row = [];
			var end = Math.min(y >> 1, lastRow ? lastRow.length + 1 : Infinity), backrow = [];
			for (var x = 0; x <= end; ++x) {
				var cell = {
					x: x,
					y: y
				};
				if (x == 0 || x == y)
					cell.n = new Big(1);
				else {
					var left = lastRow[x - 1], // y = lastRow's ideal length
						right = lastRow[x] || lastRow[y - x - 1];
					if (!left || !right)
						break;
					cell.n = left.n.plus(right.n);
				}
				row.push(cell);
				scope.triangle.push(cell);
				if (n) {
					if (cell.n.eq(n)) {
						hits.push(cell);
						if (x != y * 0.5)
							hits.push({
								x: y - x - 1,
								y: y,
								n: n
							});
					} else if (cell.n.gt(n))
						break;
				} else if ((x << 1) != y)
					backrow.push(cell);
			}			
			if (n) {
				if (hits.length >= scope.maxHits || n.lt(y))
					break;
			} else
				while (backrow.length)
					row.push(backrow.pop());
			if (scope.triangle.length >= scope.maxCells)
				break;
			lastRow = row;
		}
		scope.rows = y;
		return n && hits;
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