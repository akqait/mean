// NOTE: I previously suggested doing this through Grunt, but had plenty of problems with
// my set up. Grunt did some weird things with scope, and I ended up using nodemon. This
// setup is now using Gulp. It works exactly how I expect it to and is WAY more concise.
var gulp = require('gulp'),
        spawn = require('child_process').spawn, apidoc = require('gulp-apidoc'),
        node;
var strip = require('gulp-strip-comments');
var gulpIgnore = require('gulp-ignore');
var htmlmin = require('gulp-html-minifier');
var fs = require('fs');
var path = require('path');

/**
 * $ gulp server
 * description: launch the server. If there's a server already running, kill it.
 */
gulp.task('server', function() {
    if (node)
        node.kill()
    node = spawn('node', ['server.js'], {stdio: 'inherit'})
    node.on('close', function(code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
gulp.task('scripts', function() {
    gulp.src(['./public/app/scripts/app.js', './public/app/modules/common/constants.js', './public/app/modules/common/directives.js', './public/app/modules/common/services.js', './public/app/modules/authentication/services.js', './public/app/modules/authentication/controllers.js', './public/app/modules/home/controllers.js',  './public/app/modules/home/services.js', './public/app/modules/home/directives.js', './public/app/modules/dynamic-menu/dynamic-menu.js', './public/app/js/customquery.js', './public/app/modules/statistics/controllers.js', './public/app/modules/statistics/directives.js',  './public/app/modules/health-check/controllers.js'])
            .pipe(concat('all.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('./public/app/scripts'))
});
gulp.task('vendorscripts', function() {
    gulp.src(['./public/app/scripts/vendor/angular-animate.min.js', './public/app/scripts/vendor/angular-sanitize.min.js', './public/app/scripts/vendor/angular-fullscreen.js', './public/app/scripts/vendor/app.js', './public/app/js/ui-bootstrap-tpls-2.1.2.min.js', './public/app/scripts/vendor/rzslider.min.js', './public/app/scripts/vendor/angular-chosen.min.js', './public/app/scripts/vendor/dirPagination.js', './public/app/scripts/vendor/Chart.min.js', './public/app/scripts/vendor/angular-chart.min.js', './public/app/scripts/vendor/cropper.js', './public/app/scripts/vendor/main.js'])
            .pipe(concat('vendor.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('./public/app/scripts'))
    //To minify chat.js to chatmin.js
    gulp.src('./public/app/js/chat.js')
            .pipe(uglify())
            .pipe(rename({
                basename: 'chatmin'
            }))
            .pipe(gulp.dest('./public/app/js/'))
});
gulp.task('vendorimpscripts', function() {
    gulp.src(['./public/app/scripts/vendor/jquery.min.js', './public/app/js/bootstrap.min.js', './public/app/scripts/vendor/chosen-add-option.js', './public/app/scripts/vendor/angular.min.js', './public/app/scripts/vendor/angular-route.min.js', './public/app/scripts/vendor/angular-cookies.min.js', './public/app/scripts/vendor/angular-resource.min.js'])
            .pipe(concat('vendorimp.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('./public/app/scripts'))
});
var uglifycss = require('gulp-uglifycss');
var rename = require('gulp-rename');
gulp.task('css', function() {
    gulp.src(['./public/app/css/main.css', './public/app/css/menu.css', './public/app/css/hovereffect.css', './public/app/css/responsive.css', './public/app/scripts/vendor/rzslider.min.css', './public/app/css/vendor/chosen.css', './public/app/css/stylesheet.css'])
            .pipe(concat('allstyle.min.css'))
            .pipe(uglifycss())
            .pipe(gulp.dest('./public/app/css/'));
});
/*gulp.task('style', function() {
 gulp.src(['./public/app/css/1/style.css'])
 .pipe(concat('style.min.css'))
 .pipe(uglifycss())
 .pipe(gulp.dest('./public/app/css/1/'));
 });*/
gulp.task('apidoc', function(done) {
    apidoc({
        src: "routes/",
        dest: "public/app/apidoc/",
        template: "public/app/apidoctemplate/"
    }, done);
});


gulp.task('html-minify', function() {
    //to minify chat.html to chatmin.html
    

    //to minify remaining html files
    var src = ['./public/app/', './public/app/views/',  './public/app/modules/authentication/views/',  './public/app/modules/data-mapping/views/', './public/app/modules/templates/', './public/app/modules/dynamic-menu/views/', './public/app/modules/home/views/', './public/app/modules/statistics/views/', './public/app/modules/health-check/views/'];
    for (var i = 0; i < src.length; i++) {
        gulp.src(src[i] + '*.html')
                .pipe(gulpIgnore.exclude(['*.min.html', 'chatmin.html', 'chat.html']))
                .pipe(htmlmin({collapseWhitespace: true}))
                .pipe(strip())
                .pipe(rename({
                    suffix: '.min'
                }))
                .pipe(gulp.dest(src[i]))

    }

})

function getFolders(dir) {
    return fs.readdirSync(dir)
            .filter(function(file) {
                return fs.statSync(path.join(dir, file)).isDirectory();
            });
}

gulp.task('style', function() {
    var stylePath = "./public/app/css"
    var folders = getFolders(stylePath);

    for (var i = 0; i < folders.length; i++) {
        gulp.src([stylePath + '/' + folders[i] + '/style.css'])
                .pipe(concat('style.min.css'))
                .pipe(uglifycss())
                .pipe(gulp.dest(stylePath + '/' + folders[i] + '/'));
    }
})



/**
 * $ gulp
 * description: start the development environment
 */
gulp.task('default', ['server', 'apidoc', 'scripts', 'css', 'style', 'html-minify', 'vendorimpscripts', 'vendorscripts'], function() {


    gulp.watch(['./server.js', './routes/*.js', './routes/**/*.js'], ['server'], function() {

    })
    gulp.watch(['./public/app/scripts/app.js', './public/app/modules/**/*.js'], ['scripts'], function() {

    })
    gulp.watch(['./public/app/css/main.css', './public/app/css/menu.css', './public/app/css/hovereffect.css', './public/app/css/responsive.css', './public/app/scripts/vendor/rzslider.min.css', './public/app/css/vendor/chosen.css'], ['css'], function() {

    })

    var stylePath = "./public/app/css"
    var folders = getFolders(stylePath);
    var cssArray = new Array();
    for (var i = 0; i < folders.length; i++) {
        cssArray.push(stylePath + '/' + folders[i] + '/style.css');
    }
    gulp.watch(cssArray, ['style'], function() {

    })
    gulp.watch(['./public/app/*.html', './public/app/views/*.html', './public/app/modules/authentication/views/*.html',  './public/app/modules/dynamic-menu/views/*.html', './public/app/modules/home/views/*.html', './public/app/modules/templates/*.html', './public/app/modules/crontable/views/*.html', './public/app/modules/statistics/views/*.html',  '!./public/app/**/*.min.html', ], ['html-minify'], function() {
    });

    // Need to watch for sass changes too? Just add another watch call!
    // no more messing around with grunt-concurrent or the like. Gulp is
    // async by default.
})

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node)
        node.kill()
})