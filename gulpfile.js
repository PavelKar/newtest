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
    img: source_folder + "/img/**/*.{jpg, png, gif, ico, webp}",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg, png, gif, ico, webp}",
  },
  clean: "./" + project_folder + "/"

}

let { src, dest} = require('gulp'),
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
    webphtml = require("gulp-webp-html"),
    // @ts-ignore
    webpcss = require("gulp-webpcss"),
    svgSprite = require("gulp-svg-sprite"),
    // @ts-ignore
    ttf2woff = require("gulp-ttf2woff"),
    // @ts-ignore
    ttf2woff2 = require("gulp-ttf2woff2"),
    fonter = require("gulp-fonter")
   


// @ts-ignore
function browserSync(params) {
  browsersync.init({
    server:{
      baseDir: "./" + project_folder + "/"
    },
    port: 3000,
    notify: false
  })
}



function html() {
  return src(path.src.html)
    // @ts-ignore
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(scss({
      outputStyle: "expanded"
    }))
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
      webpcss({
        webpClass: '.webp',noWebpClass: '.no-webp'
      })
    )  
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: '.min.css'
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    // @ts-ignore
    .pipe(fileinclude())
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
        svgoPlugins: [{ removeViewBox: false}],
        interlaced: true,
        optimizationLevel: 3
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

// @ts-ignore
function fonts(params) {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))

}

gulp.task('otf2ttf', function() {
  return src([source_folder + '/fonts/*.otf'])
  // @ts-ignore
  .pipe(fonter({
    formats: ['ttf']
  }))
  .pipe(dest(source_folder + '/fonts/'))
})

gulp.task('svgSprite', function() {
  return gulp.src([source_folder + '/iconsprite/*.svg'])
  .pipe(svgSprite({
    mode: {
      stack: {
        sprite: "../icons/icons.svg"
      
      }
    }
  }))
  // @ts-ignore
  .pipe(dest(patch.build.img))
})

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

// @ts-ignore
function watchFiles(params) {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], images)
}

// @ts-ignore
function clean(params) {
  return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle)
let watch = gulp.parallel(build, watchFiles, browserSync)


exports.build = build
exports.watch = watch
exports.default = watch
exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.fonts = fonts
exports.fontsStyle= fontsStyle