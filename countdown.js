document.addEventListener('DOMContentLoaded', function() {

	function inject(name) {
		return angular
			.element(document.querySelector('[ng-app],.ng-scope'))
			.injector()
			.get(name);
	}

	function getScope(element) {
		var e = angular.element(element);
		return e.isolateScope() || e.scope();
	}

	var element = document.querySelector('[ng-controller]'),
		scope = getScope(element),
		dancer = inject('dances'),
		properties = inject('properties')(),
		dances = [
			{ n: 0,  stub: 'n' },
			{ n: 10, stub: 'generalised-3' },
			{ n: 9,  stub: 'generalised-4' },
			{ n: 8,  stub: 'cube' },
			{ n: 7,  stub: 'centred-6' },
			{ n: 6,  stub: 'generalised-3' },
			{ n: 5,  stub: 'squares-1-2' },
			{ n: 4,  stub: 'semiprime' },
			{ n: 3,  stub: 'generalised-3' },
			{ n: 2,  stub: 'cubes-1-1' },
			{ n: 1,  stub: 'n' },
			{ n: 0,  stub: 'n' }
		],
		i = 0;

	var interval = setInterval(function() {

		scope.$apply(function() {
			if (dances[i]) {
				scope.n = dances[i].n;
				scope.danceStub = dances[i].stub;
				++i;
			} else clearInterval(interval);
		});

	}, 2000);

});
