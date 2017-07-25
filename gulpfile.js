

var gulp       = require( 'gulp' );
var browserify = require( 'browserify' );
var babelify   = require( 'babelify' );
var source     = require( 'vinyl-source-stream' );


// .js - Bundle .js
    gulp.task( 'js', function () {

        return browserify( './src/js/main.js' )

            .transform( babelify, {

                presets: [ 'es2015' ]

            })
            .bundle()
            .pipe( source( 'bundle.js' ) )
            .pipe( gulp.dest( './build' ) )

    });

// .css - Bundle .css
    gulp.task( 'css', function() {

        return browserify( './src/styles/main.css' )

            .bundle()
            .pipe( source( 'bundle.css' ) )
            .pipe( gulp.dest( './build' ) )

    });


// Default - Bundle .js
    gulp.task( 'default', [ 'js' ] ); // [ 'js', 'css' ]


// Watch for File Changes
    gulp.task( 'watch', function () {

        return gulp.watch( './src/**/*.js', [ 'default' ] );

    });