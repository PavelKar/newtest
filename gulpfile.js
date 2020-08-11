let project_folder = "dist"
let source_folder = "#src"
let fs = require('fs')

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
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.{jpg, jpeg, png, svg, gif, ico, webp}",
    fonts: source_folder + "/fonts/*.ttf",
    fontsotf: source_folder + "/fonts/*.otf",
    
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg, jpeg, png, gif, ico, webp}",
  },
  clean: "./" + project_folder + "/"

}

let { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  scss = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  // @ts-ignore
  group_media = require("gulp-group-css-media-queries"),
  // @ts-ignore
  clean_css = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  imagemin = require("gulp-imagemin"),
  // @ts-ignore
  webp = require("gulp-webp"),
  // @ts-ignore
  webphtml = require("gulp-webp-in-html"),
  // @ts-ignore
  webpcss = require("gulp-webpcss"),
  svgSprite = require("gulp-svg-sprite"),
  // @ts-ignore
  ttf2woff = require("gulp-ttf2woff"),
  // @ts-ignore
  ttf2woff2 = require("gulp-ttf2woff2"),
  fonter = require("gulp-fonter")

//Настройки плагина просмотра в браузере 
// @ts-ignore
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
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

// Функция для работы с CSS-файлами
function css() {
  return src(path.src.css)
    .pipe(scss({
      // не упакованый файл
      outputStyle: "expanded"
    })
    )
    .pipe(
      group_media()
    )
    .pipe(
      autoprefixer({
        // @ts-ignore
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(
      webpcss({ // обработка CSS background url в .webp
        webpClass: '.webp', noWebpClass: '.no-webp'
      })
    )
    .pipe(dest(path.build.css)) // выгрузить готовый CSS
    .pipe(clean_css()) // сжатие css в одну строку
    .pipe(
      rename({
        extname: '.min.css'
      })
    )
    .pipe(dest(path.build.css)) // выгрузить готовый MIN.CSS
    .pipe(browsersync.stream())
}

// Функция для работы с JS-файлами
function js() {
  return src(path.src.js)
    // @ts-ignore
    .pipe(fileinclude())
    .pipe(dest(path.build.js)) // выгрузить готовый JS
    .pipe(
      uglify()
    )
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))  // выгрузить готовый MIN.CSS
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
    .pipe(dest(path.build.img)) // выгрузить WEBP
    .pipe(src(path.src.img))  // загрузить исходный файл изображения
    .pipe(
      imagemin({
        // @ts-ignore
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3
      })
    )
    .pipe(dest(path.build.img)) // выгрузить готовый файл изображения
    .pipe(browsersync.stream()) // отправить в браузер
}

// Функция для работы со шрифтами
// @ts-ignore
function fonts(params) {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))

}

gulp.task('otf2ttf', function () {
  return src([path.src.fontsotf])
  console.log(path.src.fontsotf)

    // @ts-ignore
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(path.src.fonts))
})

gulp.task('SVGSprite', function() {
  return gulp.src([source_folder + '/iconsprite/*.svg'])
  .pipe(
    svgSprite(
      {
        mode: {
          stack: {
            sprite: "../icons/icons.svg", 
            example: true
          }
        },
      }
    ))
    // @ts-ignore
    .pipe(dest(path.build.img)) 
}
)
// @ts-ignore
function fontsStyle(params) {
  let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
  // @ts-ignore
  if (file_content == '') {
    fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
    // @ts-ignore
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          // @ts-ignore
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    })
  }
}

function cb() {

}

// Функция слежения за изменениями файлов
// @ts-ignore
function watchFiles(params) {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], images)
}

//Функция очистки содержимого папки результатов работы
// @ts-ignore
function clean(params) {
  return del(path.clean)
}

// Список последовательных задач для GULP
let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle)
// Список параллельных задач для GULP
let watch = gulp.parallel(build, watchFiles, browserSync)

//Экспорт для задач для видимости при запуске gulp
exports.build = build
exports.watch = watch
exports.default = watch
exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.fonts = fonts
exports.fontsStyle = fontsStyle