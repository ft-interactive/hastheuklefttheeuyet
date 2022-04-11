/* eslint-disable no-console, global-require */
import browserify from 'browserify';
import browserSync from 'browser-sync';
import gulp from 'gulp';
import mergeStream from 'merge-stream';
import path from 'path';
import inlineSource from 'gulp-inline-source';
import htmlmin from 'gulp-htmlmin';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import source from 'vinyl-source-stream';
import watchify from 'watchify';
import AnsiToHTML from 'ansi-to-html';
import autoprefixer from 'gulp-autoprefixer';

const $ = require('auto-plug')('gulp');
const ansiToHTML = new AnsiToHTML();

var sass = require('gulp-sass')(require('sass'));

const AUTOPREFIXER_BROWSERS = [
  'ie >= 8',
  'ff >= 30',
  'chrome >= 34',
  'iOS >= 7',
  'Safari >= 7',
];

const BROWSERIFY_ENTRIES = [
  'scripts/main.js',
];

const BROWSERIFY_TRANSFORMS = [
  'babelify',
];

const OTHER_SCRIPTS = [
  'scripts/top.js',
];

let env = 'development';


// helpers
function handleBuildError(headline, error) {
  if (env === 'development') {

    // show in the terminal
    $.util.log(headline, error && error.stack);

    // report it in browser sync
    let report = (
      `<span style="color:red;font-weight:bold;font:bold 20px sans-serif">${headline}</span>`
    );

    if (error) {
      report += (
        `<pre style="text-align:left;max-width:800px">${ansiToHTML.toHtml(error.stack)}</pre>`
      );
    }

    browserSync.notify(report, 60 * 60 * 1000);
    preventNextReload = true;

    // allow the sass/js task to end successfully, so the process can continue
    this.emit('end');
  } else throw error;
}

// function to get an array of objects that handle browserifying
function getBundlers(useWatchify) {
  return BROWSERIFY_ENTRIES.map(entry => {
    const bundler = {
      b: browserify(path.posix.resolve('client', entry), {
        cache: {},
        packageCache: {},
        fullPaths: useWatchify,
        debug: useWatchify,
      }),

      execute() {
        let stream = this.b.bundle()
          .on('error', function(error) {
            handleBuildError.call(this, 'Error building JavaScript', error);
          })
          .pipe(source(entry));

        // If you want JS sourcemaps:
        //    1. npm i -D gulp-sourcemaps
        //    2. uncomment code below
        //
        //// skip sourcemap creation if we're in 'serve' mode
        // if (useWatchify) {
        //   stream = stream
        //    .pipe(vinylBuffer())
        //    .pipe($.sourcemaps.init({ loadMaps: true }))
        //    .pipe($.sourcemaps.write('./'));
        // }

        return stream.pipe(gulp.dest('dist'));
      },
    };

    // register all the transforms
    BROWSERIFY_TRANSFORMS.forEach(transform => bundler.b.transform(transform));

    // upgrade to watchify if we're in 'serve' mode
    if (useWatchify) {
      bundler.b = watchify(bundler.b);
      bundler.b.on('update', files => {
        // re-run the bundler then reload the browser
        bundler.execute().on('end', reload);
      });
    }

    return bundler;
  });
}

// IMAGE COMPRESSION:
// OPTIONAL TASK IF YOU HAVE IMAGES IN YOUR PROJECT REPO
//  1. install gulp-imagemin:
//       $ npm i -D gulp-imagemin
//  2. uncomment task below
//  3. Find other commented out stuff related to imagemin elsewhere in this gulpfile
//
// gulp.task('images', () => gulp.src('dist/**/*.{jpg,png,gif,svg}')
//   .pipe($.imagemin({
//     progressive: true,
//     interlaced: true,
//   }))
//   .pipe(gulp.dest('dist'))
// );

const copyGlob = OTHER_SCRIPTS.concat([
  'client/**/*',
  '!client/**/*.{html,scss}',

  // REPLACE: if using imagmin
  // '!client/**/*.{jpg,png,gif,svg}',

]);

// reload
let preventNextReload; // hack to keep a BS error notification on the screen
gulp.task('reload', (cb) => {
  if (preventNextReload) {
    preventNextReload = false;
    return;
  }

  browserSync.reload();
  cb();
});

// task to do a straightforward browserify bundle (build only)
gulp.task('scripts', (cb) => {
  mergeStream(getBundlers().map(bundler => bundler.execute()))
  cb();
});

// builds stylesheets with sass/autoprefixer
gulp.task('styles', (cb) => {
  gulp.src('client/**/*.scss')
    .pipe(sass({
      includePaths: 'node_modules',
      outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded',
    }).on('error', function sassError(error) {
      handleBuildError.call(this, 'Error building Sass', error);
    }))
    .pipe(autoprefixer({ overrideBrowserslist: AUTOPREFIXER_BROWSERS }))
    .pipe(gulp.dest('dist'))
  cb();
});

// renames asset files and adds a rev-manifest.json
gulp.task('revision', (cb) => {
  gulp.src(['dist/**/*.css', 'dist/**/*.js'])
    .pipe(rev())
    .pipe(gulp.dest('dist'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist'))
  cb();
});

// edits html to reflect changes in rev-manifest.json
gulp.task('revreplace', gulp.series('revision'), (cb) => {
  gulp.src('dist/**/*.html')
    .pipe(revReplace({ manifest: gulp.src('./dist/rev-manifest.json') }))
    .pipe(gulp.dest('dist'))
  cb();
});

// copies over miscellaneous files (client => dist)
gulp.task('copy', (cb) => {
  gulp.src(copyGlob, { dot: true, allowEmpty: true })
    .pipe(gulp.dest('dist'));
  cb();
});

gulp.task('build-pages', (cb) => {
  gulp.src(['client/**/*.html', '!client/includes/**.html'])
    .pipe($.htmlTagInclude())
    .pipe(gulp.dest('dist'))
  cb();
});

// minifies all HTML, CSS and JS (dist & client => dist)
gulp.task('html', (cb) => {
  gulp.src('dist/**/*.html')
    .pipe(inlineSource())
    .pipe(htmlmin({
      collapseWhitespace: true,
      processConditionalComments: true,
      minifyJS: true,
    }))
    .pipe(gulp.dest('dist'))
  cb();
});

// // runs a development server (serving up dist and client)
gulp.task('watch', gulp.series(['styles', 'build-pages', 'copy', (done) => {
  const bundlers = getBundlers(true);

  // execute all the bundlers once, up front
  const initialBundles = mergeStream(bundlers.map(bundler => bundler.execute()));
  initialBundles.resume(); // (otherwise never emits 'end')

  initialBundles.on('end', () => {
    // use browsersync to serve up the development app
    browserSync({
      notify: true,
      open: process.argv.includes('--open'),
      ui: process.argv.includes('--bsui'),
      ghostMode: process.argv.includes('--ghost'),
      port: process.env.PORT || '3000',
      server: {
        baseDir: 'dist'
      },
    });

    // refresh browser after other changes
    gulp.watch(['client/**/*.html'], gulp.series(['reload', 'build-pages']));
    gulp.watch(['client/styles/**/*.scss'], gulp.series(['reload', 'styles']));
    gulp.watch(copyGlob, gulp.series(['reload', 'copy']));

    // UNCOMMENT IF USING IMAGEMIN
    // gulp.watch(['client/images/**/*'], reload);

    done();
  });
}]));

// makes a production build (client => dist)
gulp.task('build', gulp.series([(done) => {
  process.env.NODE_ENV = 'production';
  done();
}, 'copy', 'build-pages', 'styles', 'scripts', 'html', 'revreplace', (cb) => {
  cb();
}]));
