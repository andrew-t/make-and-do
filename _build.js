// options:
var mangle = true,
	squeeze = true,
	liftVars = true,
	outDir = 'dist',
	output = 'gadgets.min.js',
	dependencies = ['angular.min.js', 'big.js/big.min.js'],
	noConcat = [/worker\.js$/i, /^prime\.js$/];

var fs = require('fs'),
	uglify = require('./UglifyJS/uglify-js.js'),
	files = fs.readdirSync('.'),
	totalIn = 0,
	totalOut = 0;

try {
	fs.mkdirSync(outDir);
} catch(e) { }

function forEachFile(extension, callback) {
	var rightType = new RegExp('\.' + extension + '$', 'i');
	files.forEach(function(filename) {
		if (/^_/.test(filename) || !rightType.test(filename))
			return;
		var file = fs.statSync(filename);
		if (file.isDirectory())
			return;
		callback(filename);
	});
}

// JavaScript

function minify(code, fn) {
	var ast = uglify.parser.parse(code);

	if (liftVars)
		ast = uglify.uglify.ast_lift_variables(ast);
	if (mangle)
		ast = uglify.uglify.ast_mangle(ast, {
			toplevel: false,
			except: ['options']
		});
	if (squeeze)
		ast = uglify.uglify.ast_squeeze(ast);

	var minified = uglify.uglify.gen_code(ast);

	totalIn += code.length;
	totalOut += minified.length;
	fs.writeFileSync(outDir + '/' + fn, minified);

	console.log('File: ' + fn);
	console.log('Original length: ' + code.length);
	console.log('Minified length: ' + minified.length);
	console.log('Compression ratio: ' + (minified.length / code.length));
	console.log('');

	return minified;
}

var code = '';

forEachFile('js', function(filename) {
	if (!/\.min\.js$/i.test(filename)) {
		var content = fs.readFileSync(filename, 'utf8').replace(/['"]use strict['"];/gi, '') + '\n\n',
			concat = true;
		noConcat.forEach(function(filter) {
			if (filter.test(filename))
				concat = false;
		});
		if (concat)
			code += content;
		else
			minify(content, filename);
	}
});

minify(code, output);

console.log('Total original length: ' + totalIn);
console.log('Total minified length: ' + totalOut);
console.log('Compression ratio: ' + (totalOut / totalIn));

// HTML

forEachFile('html', function(filename) {
	fs.writeFileSync(outDir + '/' + filename, fs.readFileSync(filename, 'utf8')
		.replace(/<script src=".*\/([^\/]+).min.js"><\/script>/ig, 
				'<script src="$1.min.js"></script>'));
});

// CSS

forEachFile('css', function(filename) {
	fs.writeFileSync(outDir + '/' + filename, 
		fs.readFileSync(filename, 'utf8')
		.replace(/\/\*.*?\*\//gm, '')
		.replace(/;?\s*([{:;}])\s*/g, '$1')
		.replace(/\s+/g, ' '));
});

// dependencies

dependencies.forEach(function(dependency) {
	fs.writeFileSync(outDir + '/' + dependency.replace(/^.*\/([^\/]+)$/i, '$1'),
		fs.readFileSync(dependency));
});