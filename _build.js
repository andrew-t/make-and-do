// options:
var mangle = true,
	squeeze = true,
	liftVars = true,
	outDir = 'dist',
	output = 'gadgets.min.js',
	dependencies = ['angular.min.js', 'big.js/big.min.js'];

var fs = require('fs'),
	uglify = require('./UglifyJS/uglify-js.js'),
	files = fs.readdirSync('.');

// JavaScript

function minify(code) {
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

	console.log('Original length: ' + code.length);
	console.log('Minified length: ' + minified.length);
	console.log('Compression ratio: ' + (minified.length / code.length));

	return minified;
}

files.forEach(function(filename) {
	if (/^_/.test(filename) || /\.min\.js$/i.test(filename) || !/\.js$/i.test(filename))
		return;
	var file = fs.statSync(filename);
	if (file.isDirectory())
		return;
	fs.writeFileSync(outDir + '/' + filename, 
		minify(fs.readFileSync(filename, 'utf8').replace(/['"]use strict['"];/gi, '')));
});

// HTML

files.forEach(function(filename) {
	if (/^_/.test(filename) || !/\.html$/i.test(filename))
		return;
	var file = fs.statSync(filename);
	if (file.isDirectory())
		return;
	fs.writeFileSync(outDir + '/' + filename, fs.readFileSync(filename, 'utf8')
		.replace(/<script src=".*\/([^\/]+).min.js"><\/script>/ig, 
				'<script src="$1.min.js"></script>'));
});

// CSS

files.forEach(function(filename) {
	if (/^_/.test(filename) || !/\.css$/i.test(filename))
		return;
	var file = fs.statSync(filename);
	if (file.isDirectory())
		return;
	fs.writeFileSync(outDir + '/' + filename, fs.readFileSync(filename, 'utf8'));
});

// dependencies

dependencies.forEach(function(dependency) {
	fs.writeFileSync(outDir + '/' + dependency.replace(/^.*\/([^\/]+)$/i, '$1'),
		fs.readFileSync(dependency));
});