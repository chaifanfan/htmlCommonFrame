var gulp = require('gulp');
var merge = require('merge-stream');
var newer = require('gulp-newer');
var path = require('path');
var rename = require('gulp-rename');
var sequence = require('gulp-sequence');
var sourcemaps = require('gulp-sourcemaps');
//Template
var hb = require('gulp-hb');
var contentIncluder = require('gulp-content-includer');
//CSS
var postcss = require('gulp-postcss');
var syntax = require('postcss-scss');
var sorting = require('postcss-sorting');
var sass = require('gulp-sass');
var bulkSass = require('gulp-sass-bulk-import');
var autoprefixer = require('gulp-autoprefixer');
var combineMq = require('gulp-combine-mq');
var cssnano = require('gulp-cssnano');
//Image
var imagemin = require('gulp-imagemin');
//Svg
var svgmin = require('gulp-svgmin');
var svgstore = require('gulp-svgstore');
//Error handler
function swallowError(error) {
	// If you want details of the error in the console
	console.log(error.toString())
	this.emit('end')
}

//Template build
gulp.task('build-includes', function() {
	var hbStream = hb()
		// Partials
		.partials('src/templates/components/**/*.hbs')
		.partials('src/templates/layouts/**/*.hbs')
		// Helpers
		.helpers(require('handlebars-layouts'));

	return gulp.src('src/includes/**/*.hbs')
		.pipe(hbStream.on('error', swallowError))
		.pipe(rename({
			extname: ".shtml"
		}))
		.pipe(gulp.dest('dist/includes'));
});
gulp.task('build-pages', function() {
	var hbStream = hb()
		// Partials
		.partials('src/templates/components/**/*.hbs')
		.partials('src/templates/layouts/**/*.hbs')
		// Helpers
		.helpers(require('handlebars-layouts'))
		.helpers('/src/templates/helpers/*.js');

	return gulp.src('src/pages/*.hbs')
		.pipe(hbStream.on('error', swallowError))
		.pipe(rename({
			extname: ".shtml"
		}))
		.pipe(gulp.dest('dist'));
});
gulp.task('concat', function() {
	gulp.src('dist/*.shtml')
	.pipe(contentIncluder({
		includerReg:/<!\-\-\#include\sfile=+"([^"]+)"\s?\-\->/g,
		deepConcat: true
	}))
	.pipe(rename({
		extname: ".html"
	}))
	.pipe(gulp.dest('dist/'));
});
//CSS build
gulp.task('css-sorting', function() {
	return gulp.src(['src/sass/**/*.scss', '!src/sass/mixins/**/*.scss', '!src/sass/vendors/**/*.scss', '!src/sass/base/_02_fonts.scss'])
		.pipe(postcss([
			sorting({
				"order": [
					"custom-properties",
					"dollar-variables",
					"declarations",
					"rules",
					"at-rules", {
						"type": "at-rule",
						"name": "include"
					}, {
						"type": "at-rule",
						"name": "include",
						"parameter": "media"
					}
				],
				"clean-empty-lines": true,
				"dollar-variable-empty-line-before": false,
				"properties-order": "alphabetical",
				"unspecified-properties-position": "bottomAlphabetical"
			})
		], { parser: syntax }))
		.pipe(gulp.dest('src/sass'));
});

gulp.task('sass', function() {
	return gulp.src('src/sass/styles.scss')
		.pipe(bulkSass())
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', swallowError))
		.pipe(autoprefixer({
			browsers: [
				'last 2 versions',
				'Explorer >= 9',
				'Android >= 4'
			]
		}))
		.pipe(combineMq({
			beautify: false
		}))
		.pipe(sourcemaps.write('/'))
		.pipe(gulp.dest('dist/css'));
});

gulp.task('cssminify', function() {
	return gulp.src(['*.css', '!*.min.css'], {
			cwd: 'dist/css'
		})
		.pipe(cssnano({
			zindex: true //Unsafe optimisation, please check here for details http://cssnano.co/optimisations/
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/css'));
});
//File copy
gulp.task('copy-fonts', function() {
	return gulp.src('src/fonts/*')
		.pipe(gulp.dest('dist/css/fonts'));
});

gulp.task('copy-js', function() {
	return gulp.src('src/js/*')
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-images', function() {
	return gulp.src(['*', '!*.{svg,png,jpg,gif}'], {
			cwd: 'src/images'
		})
		.pipe(gulp.dest('dist/images'));
});

gulp.task('copy-style-images', function() {
	return gulp.src(['*', '!*.{png,jpg,gif}'], {
			cwd: 'src/style-images'
		})
		.pipe(gulp.dest('dist/css/images'));
});

gulp.task('copy-uploads', function() {
	return gulp.src(['*', '!*.{png,jpg,gif}'], {
			cwd: 'src/uploads'
		})
		.pipe(gulp.dest('dist/uploads'));
});
//Image minify
gulp.task('imageminify', function() {
	var imagesFolder = gulp.src('src/images/*.{png,jpg,gif}')
		.pipe(newer('dist/images'))
		.pipe(imagemin())
		.pipe(gulp.dest('dist/images'));
	var uploadsFolder = gulp.src('src/uploads/*.{png,jpg,gif}')
		.pipe(newer('dist/uploads'))
		.pipe(imagemin())
		.pipe(gulp.dest('dist/uploads'));
	return merge(imagesFolder, uploadsFolder);
});
gulp.task('style-images', function() {
	return gulp.src('src/style-images/*.{png,jpg,gif}')
		.pipe(newer('dist/css/images'))
		.pipe(imagemin())
		.pipe(gulp.dest('dist/css/images'));
});
//Icon generate
gulp.task('generate-icons', function() {
	return gulp.src('src/icons/*.svg')
		.pipe(svgmin(function(file) {
			var prefix = path.basename(file.relative, path.extname(file.relative));
			return {
				plugins: [{
					cleanupIDs: {
						prefix: prefix + '-',
						minify: true
					}
				}]
			}
		}))
		.pipe(rename({ prefix: 'icon-' }))
		.pipe(svgstore())
		.pipe(gulp.dest('dist/images'));
});

// gulp.task('build-html', ['build-includes', 'build-pages', 'concat']);

gulp.task('build-html', function(callback) {
	sequence('build-includes', 'build-pages', 'concat')(callback)
});

gulp.task('build-css', function(callback) {
	sequence('css-sorting', 'sass', 'cssminify')(callback)
});

gulp.task('copy-files', ['copy-fonts', 'copy-style-images', 'copy-js', 'copy-images', 'copy-uploads']);

gulp.task('build', ['build-html', 'build-css', 'style-images', 'imageminify', 'copy-files', 'generate-icons']);

gulp.task('watch', function() {
	gulp.watch(['src/includes/**/*.hbs', 'src/pages/**/*.hbs', 'src/templates/**/*.hbs'], ['build-html']);
	gulp.watch(['src/images/*.{png,jpg,gif}', 'src/uploads/*.{png,jpg,gif}'], ['imageminify']);
	gulp.watch('src/style-images/*.{png,jpg,gif}', ['style-images']);
	gulp.watch('src/sass/**/*.scss', ['build-css']);
	gulp.watch('src/fonts/*', ['copy-fonts']);
	gulp.watch('src/js/*', ['copy-js']);
	gulp.watch(['src/images/*', '!src/images/*.{svg,png,jpg,gif}'], ['copy-images']);
	gulp.watch(['src/uploads/*', '!src/uploads/*.{png,jpg,gif}'], ['copy-uploads']);
	gulp.watch('src/icons/*', ['generate-icons']);
});

