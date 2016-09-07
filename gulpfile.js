var browserify  = require('browserify'),
    gutil       = require('gulp-util'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    watchify    = require('watchify'),
    babelify    = require('babelify'),
    gulp        = require('gulp'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    order       = require('gulp-order'),
    sass        = require('gulp-sass'),
    streamify   = require('gulp-streamify'),
    preprocess  = require('gulp-preprocess'),
    env         = require('gulp-env'),
    del         = require('del'),
    ractivate   = require('ractivate'),
    componentify = require('ractive-componentify');
    source      = require('vinyl-source-stream'),
    componentsDir  = './src/pages/',
    sourceFile  = 'index',
    destFile    = 'bundle.js';

var components = [
    { name: 'shared',    ractive: false },
    { name: 'home',      ractive: true },
    { name: 'resources', ractive: true }
];

function isAllWidgets() {
    return (gutil.env.widget ? (gutil.env.widget == 'all') : true);
}

function isTargetComponent(componentName) {
    var isTargetComponent = isAllWidgets();

    if (!isTargetComponent) {
        var componentMatch = gutil.env.widget;

        isTargetComponent = (componentName == componentMatch); // TODO: support regexp?
    }

    return isTargetComponent;
}

gulp.task('browserify', function() {
    var debug = true; //(process.env.NODE_ENV == 'dev');

    components.forEach(function(component) {
        if (!component.ractive || !isTargetComponent(component.name)) {
            return;
        }

        var sourcePath = componentsDir + component.name + '/' + component.name + '.js';
        var destPath = './dist/' + component.name + '/';

        var bundler = browserify(sourcePath, {
            debug: debug,
            cache: {},
            packageCache: {}
        })
            .transform(babelify, { presets: ['es2015'] })
            .transform(componentify, {extension: 'html'})
            .bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source(destFile))
            .pipe(streamify(preprocess()));

        if (!debug) {
            bundler = bundler.pipe(streamify(uglify().on('error', gutil.log)));
        }

        bundler.pipe(gulp.dest(destPath));
    });
});

gulp.task('watchify', function() {

    components.forEach(function(component) {
        if (!component.ractive || !isTargetComponent(component.name)) {
            return;
        }
        var sourcePath = componentsDir + component.name + '/' + component.name + '.js';
        var destPath = './dist/' + component.name + '/';

        var bundler = watchify(browserify(sourcePath, {
            debug: true,
            cache: {},
            packageCache: {}
        })
            .transform(babelify, { presets: ['es2015'] }))
            .transform(componentify, {extension: 'html'});

        function rebundle() {
            return bundler.bundle()
              .pipe(source(destFile))
              .pipe(streamify(preprocess()))
              .pipe(gulp.dest(destPath));
        }

        bundler.on('update', rebundle);
        bundler.on('log', gutil.log.bind(gutil));

        return rebundle();
    });
});

gulp.task('recopy', function(){
    components.forEach(function(component) {
        if (!isTargetComponent(component.name)) {
            return;
        }
        var sourcePath = './src/pages/' + component.name + '/';
        gulp.watch(sourcePath + "**/**!(*.css|*.scss|*.js|*.map|*.src)", ['copy']);
    });
});

gulp.task('copy', function () {
    components.forEach(function(component){
        if (!isTargetComponent(component.name)) {
            return;
        }
        var destPath = './dist/' + component.name + '/';
        var sourceFolder = 'src';
        if (component.bulkCopy) {
            var sources = componentsDir + component.name + '/' + component.bulkCopy;

            gulp.src(sources).pipe(gulp.dest(destPath));
        }

        if (component.ractive) {
            sourceFolder = componentsDir + component.name;
            var sourcePath = 'src/templates/index.html';

            gulp.src(sourcePath).pipe(preprocess()).pipe(gulp.dest(destPath));
        }

        gulp.src(sourceFolder + '/img/**/*').pipe(gulp.dest(destPath + 'img/'));
        gulp.src(sourceFolder + '/js/**/*').pipe(gulp.dest(destPath + 'js/'));
        gulp.src(sourceFolder + '/audio/**/*').pipe(gulp.dest(destPath + 'audio/'));
        gulp.src(sourceFolder + '/video/**/*').pipe(gulp.dest(destPath + 'video/'));

        if (component.name == 'shared') {
            gulp.src(sourceFolder + '/index.html').pipe(gulp.dest('./dist/')); // HACK: get top-level index.html to right place
        }
        //gulp.src('app/fonts/**/*')        .pipe(gulp.dest(destFolder + 'fonts/'));
    });
});

gulp.task('sass', function () {
    components.forEach(function(component) {
        if (!isTargetComponent(component.name)) {
            return;
        }
        var sourcePath = componentsDir + component.name + '/index.scss'; // TODO: support component name but output to index.css
        var destPath = './dist/' + component.name + '/';

        gulp.src(sourcePath)
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest(destPath));
    });
});

gulp.task('sass:watch', function () {
    gulp.watch('src/styles/**/**(*.scss|*.css)', ['sass']);

    components.forEach(function(component) {
        if (!isTargetComponent(component.name)) {
            return;
        }
        var sourcePath = './src/pages/' + component.name + '/';

        gulp.watch(sourcePath + '**/**(*.scss|*.css)', ['sass']);

    });
});

gulp.task('clean', function() {
    if (isAllWidgets()) {
        del('./dist/**/*');
    }
    else {
        components.forEach(function (component) {
            if (!isTargetComponent(component.name)) {
                return;
            }
            var destPath = './dist/' + component.name;

            del(destPath + '/**/*');
        });
    }
});

var remoteAssetBase = 'https://s3.amazonaws.com/musedlab-soundbreaking/assets/';
var localAssetBase = 'https://musedbox.com/mused-assets/soundbreaking/';
var remoteAPI = 'https://api.musedlab.org';
var localAPI = 'https://api.musedbox.com';

gulp.task('set-env-dev', function() {
    env({
        vars: {
            NODE_ENV: 'dev',
            NODE_CMSBASE: 'https://staging.musedlab.org',
            NODE_HOTJAR: 129433,
            NODE_ASSETBASE: remoteAssetBase,
            NODE_APIBASE: remoteAPI
        }
    })
});

gulp.task('set-env-dev-local', function() {
    env({
        vars: {
            NODE_ENV: 'dev',
            NODE_CMSBASE: 'https://staging.musedlab.org',
            NODE_HOTJAR: '', // not available
            NODE_ASSETBASE: localAssetBase,
            NODE_APIBASE: localAPI,
            NODE_LOCAL: true
        }
    })
});

gulp.task('set-env-test', function() {
    env({
        vars: {
            NODE_ENV: 'test',
            NODE_CMSBASE: 'https://musedlab.org',
            NODE_HOTJAR: 129432,
            NODE_ASSETBASE: remoteAssetBase,
            NODE_APIBASE: remoteAPI
        }
    })
});

gulp.task('set-env-prod', function() {
    env({
        vars: {
            NODE_ENV: 'prod',
            NODE_CMSBASE: 'https://musedlab.org',
            NODE_HOTJAR: 129431,
            NODE_ASSETBASE: remoteAssetBase,
            NODE_APIBASE: remoteAPI
        }
    })
});

gulp.task('default',         ['copy', 'browserify', 'watchify']);
gulp.task('dev',             ['set-env-dev',       'copy', 'sass', 'sass:watch', 'watchify', 'recopy']);
gulp.task('dev-deploy',      ['set-env-dev',       'copy', 'sass', 'browserify']);
gulp.task('dev-deploy-local',['set-env-dev-local', 'copy', 'sass', 'browserify']);
gulp.task('prod',            ['set-env-prod',      'copy', 'browserify']);
gulp.task('test',            ['set-env-test',      'copy', 'browserify']);
