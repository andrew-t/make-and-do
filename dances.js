(function(){
	angular.module('dances', [])
	.service('dotService', function() {
		this.getBg = function(i) {
			return 'hsl(' + (options.hueStep * i) + ', ' + options.saturation + '%, ' + options.lightness + '%)';
		};

		// make a dance comprised of N sub-dances
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

		// make sure a dance fits in the panel
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
	});
})();