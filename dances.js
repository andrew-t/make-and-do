'use strict';

angular.module('dances', ['fibonacci'])
.service('dances', ['fibonacci', function(fibonacci) {
	this.getBg = function(i) {
		// This generates a reasonable colour for dot i.
		return 'hsl(' + (options.hueStep * i) + ', ' + options.saturation + '%, ' + options.lightness + '%)';
	};

	// This takes an array of dances, and puts them side by side.
	this.sumDances = function(ds) {
		var i, j;
		for (i = 0; i < ds.length; ++i)
			this.squeezeDance(ds[i], 1, 1);
		for (i = 1; i < ds.length; ++i)
			for (j = 0; j < ds[i].length; ++j) {
				ds[i][j].x += options.sumDistance;
				ds[0].push(ds[i][j]);
			}
		return ds[0];
	};

	// This normalizes a dance to fit in a w 
	this.squeezeDance = function(d, h, w) {
		var minx = Infinity, 
			maxx = -Infinity,
			miny = Infinity,
			maxy = -Infinity,
			maxSize = -Infinity;
		for (var i = 0; i < d.length; ++i) {
			if (d[i].x < minx) minx = d[i].x;
			if (d[i].x > maxx) maxx = d[i].x;
			if (d[i].y < miny) miny = d[i].y;
			if (d[i].y > maxy) maxy = d[i].y;
			if (d[i].size > maxSize) maxSize = d[i].size;
		};
		var	margin = maxSize + options.margin
		maxx += margin;
		minx -= margin;
		maxy += margin;
		miny -= margin;
		var dh = maxy - miny,
			dw = maxx - minx,
			m = Math.min(h / dh, w / dw),
			cx = 0.5 * (w - m * (minx + maxx)),
			cy = 0.5 * (h - m * (miny + maxy));
		for (var i = 0; i < d.length; ++i) {
			d[i].x = m * d[i].x + cx;
			d[i].y = m * d[i].y + cy;
			d[i].size = d[i].size * m;
		}
		return d;
	};

	this.polygonDance = function(sides, perSide, radius, firstSide, lastSide, centreOnCorner) {
		if ((sides <= 1) || (perSide === 0))
			return [{ x: 0, y: 0, size: 0.5 }];
		if (perSide === undefined)
			perSide = 1;
		if (firstSide === undefined) 
			firstSide = 0;
		else
			firstSide %= sides;
		if (lastSide === undefined)
			lastSide = firstSide; 
		else
			lastSide %= sides;
		var corners = [], theta = Math.PI * 2 / sides, i;
		// hidden maths!!
		if (!radius)
			radius = options.polygonSpacing * 0.5 * perSide / 
				Math.cos((Math.PI - theta) * 0.5);
		for (i = 0; i < sides; ++i)
			corners.push({
				x: -Math.sin(theta * i) * radius,
				y: -Math.cos(theta * i) * radius,
				size: 0.5
			});
		var d = [], i = firstSide;
		i = firstSide;
		function addDot(dot) {
			if (centreOnCorner !== undefined) {
				dot.x -= corners[centreOnCorner].x;
				dot.y -= corners[centreOnCorner].y;
			}
			d.push(dot);
		}
		do {
			var a = corners[i], b = corners[i = (i + 1) % sides];
			for (var j = 0; j < perSide; ++j) {
				var bb = j / perSide, 
					aa = 1 - bb;
				addDot({
					x: a.x * aa + b.x * bb,
					y: a.y * aa + b.y * bb,
					size: a.size * aa + b.size * bb
				});
			}
		} while (i != lastSide);
		if (lastSide != firstSide || perSide == 0)
			addDot(corners[lastSide]);
		return d;
	};

	this.squareDance = function(a, b) {
		if (b === undefined) b = a;
		var d = [], size = 0.5 / options.polygonSpacing;
		for (var y = 0; y < b; ++y)
			for (var x = 0; x < a; ++x)
				d.push({ x: x, y: y, size: size });
		return d;
	};

	this.cubeDance = function(n) {
		var d = [];
		for (var x = 0; x < n; ++x)
			for (var y = 0; y < n; ++y)
				for (var z = 0; z < n; ++z)
					d.push({
						x: x * options.cubeDimensions.x.x + 
							y * options.cubeDimensions.y.x + 
							z * options.cubeDimensions.z.x,
						y: x * options.cubeDimensions.x.y + 
							y * options.cubeDimensions.y.y + 
							z * options.cubeDimensions.z.y,
						size: options.cubeDimensions.size
					});
		return d;
	};

	this.fibonacciDance = function(m) {
		var numbers = fibonacci.allFibonacci([1, 1], undefined, m - 1);
		if (m < 0)
			return [];
		// The first two positions are kind of a hack -- it's wherever they fit, really:
		var d = [{
				x: 0.25 * options.fibonacciSpacing,
				y: -0.55 * options.fibonacciSpacing,
				size: options.fibonacciRadius
			}];
		if (m < 1)
			return d;
		d.push({
			x: 1.35 * options.fibonacciSpacing,
			y: -0.1 * options.fibonacciSpacing,
			size: options.fibonacciRadius
		});
		var top = 0, bottom = 0, left = options.fibonacciSpacing, right = options.fibonacciSpacing,
			centreX, centreY, r;
		for (var i = 2; i < m; ++i) {
			switch (i & 3) {
				case 0: // draw above
					centreX = right;
					centreY = top - options.fibonacciSpacing;
					r = right - left;
					top -= r + options.fibonacciSpacing;
					break;
				case 1: // draw right
					centreX = right + options.fibonacciSpacing;
					centreY = bottom;
					r = bottom - top;
					right += r + options.fibonacciSpacing;
					break;
				case 2: // draw below
					centreX = left;
					centreY = bottom + options.fibonacciSpacing;
					r = right - left;
					bottom += r + options.fibonacciSpacing;
					break;
				case 3: // draw left
					centreX = left - options.fibonacciSpacing;
					centreY = top;
					r = bottom - top;
					left -= r + options.fibonacciSpacing;
					break;
			}
			var p = numbers[i - 1] - 1;
			if (p) {
				var distance = Math.PI * 0.5 + options.fibonacciSpacing / (r),
					move = distance / (p + 1),
					theta = move - (options.fibonacciSpacing / p) + Math.PI * 0.5 * (i + 1);
				for (var n = 0; n <= p; ++n) {
					d.push({
						x: centreX - Math.sin(theta) * r,
						y: centreY + Math.cos(theta) * r,
						size: options.fibonacciRadius
					});
					theta += move;
				}
			}
			else d.push({
				x: centreX,
				y: centreY,
				size: options.fibonacciRadius
			});
		}
		return d;
	};
}]);