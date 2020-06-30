/**
 * @link https://css-tricks.com/gulp-for-beginners/
 */

// ----------------------------------------------------------------------------------

const gulp = require( "gulp" );

// minify css
const cleanCSS = require( 'gulp-clean-css' );

// rename the files
const rename = require( 'gulp-rename' );

// postcss
const postcss = require( 'gulp-postcss' );
const autoprefixer = require( 'autoprefixer' );
const cssnano = require( 'cssnano' );

// ----------------------------------------------------------------------------------

// constants
const paths = {
    styles: {
        src: "src/styles/**/*.css",
        dest: "build/styles/"
    }
};

// ----------------------------------------------------------------------------------

// buildCSS task
gulp.task( "buildCSS", () => {
    const plugins = [
        autoprefixer(), // browserlist from package.json
        cssnano()
    ];
    return gulp.src( paths.styles.src )
        .pipe( cleanCSS() )
        .pipe( postcss( plugins ) )
        .pipe( rename( {
            suffix: '.min'
        } ) )
        .pipe( gulp.dest( paths.styles.dest ) );
} );