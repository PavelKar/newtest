let project_folder = "dist";
let source_folder = "#src";

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/styles.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/styles.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/"
}

// установка источника и получателя gulp
let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    imagemin = require("gulp-imagemin"),
    webp = require("gulp-webp");
    //webphtml = require("gulp-webp-html"),
//    webpcss=require("gulp-webpcss");
    //====================================================


//Настройки плагина просмотра в браузере    
function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    })
}

// Функция для работы с HTML-файлами
function html() {
    return src(path.src.html)
        // @ts-ignore
        .pipe(fileinclude())
       // .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

// Функция для работы с CSS-файлами
function css() {
    return src(path.src.css)
        .pipe(
            scss({
                // не упакованый файл
                outputStyle: "expanded"
            })
        )
        .pipe(
            autoprefixer({
                // @ts-ignore
                overrideBrowserslist: ['last 5 versions'],
                cascade: true
            })
        )
        .pipe(group_media())
  //      .pipe(webpcss())
        .pipe(dest(path.build.css)) // выгрузить готовый CSS
        .pipe(clean_css()) // сжатие css в одну строку
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css)) // выгрузить готовый MIN.CSS
        .pipe(browsersync.stream())
}

// Функция для работы с JS-файлами
function js() {
    return src(path.src.js)
        .pipe(
            // @ts-ignore
            fileinclude()
        )
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

// Функция для работы с изображениями
function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                // @ts-ignore
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLeveL: 3//0 to 7

            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

// Функция слежения за изменениями файлов
function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

//Функция очистки содержимого папки результатов работы
function clean(params) {
    return del(path.clean);
}

// Список последовательных задач для GULP
let build = gulp.series(clean, gulp.parallel(js, css, html), images);
// Список параллельных задач для GULP
let watch = gulp.parallel(build, watchFiles, browserSync);

//Экспорт для задач для видимости при запуске gulp
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
