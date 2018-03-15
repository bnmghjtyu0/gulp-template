var webserver = require("gulp-webserver"),
  connect = require("gulp-connect"),
  gulp = require("gulp"), // 載入 gulp
  bourbon = require("node-bourbon").includePaths,
  gulpSass = require("gulp-sass"), // 載入 gulp-sass
  gulpPug = require("gulp-pug"),
  gulpPlumber = require("gulp-plumber"); // 載入 gulp-plumber

var path = {
  source: "./source/", // 原始碼
  public: "./public/" // 輸出位置
};

gulp.task("watch", function() {
  gulp.watch(path.source + "scss/*.scss", ["sass"]);
  gulp.watch(path.source + "pug/*.pug", ["pug"]);
  gulp.watch(path.public + "*.html", ["html"]);
  gulp.watch(path.public + "css/*.html", ["css"]);
});

gulp.task("sass", function() {
  gulp
    .src(path.source + "scss/*.scss") // 指定要處理的 Scss 檔案目錄
    .pipe(gulpPlumber())
    .pipe(
      gulpSass({
        // 編譯 Scss
        includePaths: bourbon,
        outputStyle: "compressed"
      })
    )
    .pipe(gulp.dest(path.public + "css/")) // 指定編譯後的 css 檔案目錄
    .pipe(connect.reload()); // 當檔案異動後自動重新載入頁面
});

gulp.task("pug", function() {
  gulp
    .src(path.source + "pug/*.pug")
    .pipe(
      gulpPug({
        // Your options in here.
      })
    )
    .pipe(gulp.dest(path.public + "/")) // 指定編譯後的 pug 檔案目錄
    .pipe(connect.reload()); // 當檔案異動後自動重新載入頁面
});

gulp.task("html", function() {
  gulp.src(path.public + "*.html").pipe(connect.reload()); // 當檔案異動後自動重新載入頁面
});
gulp.task("css", function() {
  gulp.src(path.public + "css/*.css").pipe(connect.reload()); // 當檔案異動後自動重新載入頁面
});

gulp.task("webserver", function() {
  setTimeout(function() {
    gulp
      .src(path.public) // 預設開啟路徑
      .pipe(
        webserver({
          // 啟動 webserver
          livereload: true, // Livereload 的功能
          open: false, // 是否自動開啟 瀏覽器
          host: "0.0.0.0", // 如果使用 0.0.0.0 的 ip，還會另外開啟 wifi 等對外網路
          port: 9898 // 開放通訊埠
        })
      );
  }, 100);
});
// icon fonts
gulp.task("iconfonts", function(done) {
  var iconStream = gulp
    .src([path.source + "icons/*.svg"]) // 載入 svg
    .pipe(iconfont({ fontName: "icon" })); // 定義 fontName
  async.parallel(
    [
      function handleGlyphs(cb) {
        iconStream.on("glyphs", function(glyphs, options) {
          gulp
            .src(path.source + "css_template/iconfonts.css") // 取用要輸出的 CSS 樣板
            .pipe(
              consolidate("lodash", {
                glyphs: glyphs,
                fontName: "icon",
                fontPath: "../fonts/", // CSS 對應的字體路徑
                className: "all-my-class" // CSS Class 的前輟詞
              })
            )
            .pipe(gulp.dest(path.public + "stylesheets")) // CSS 輸出資料夾
            .on("finish", cb);
        });
      },
      function handleFonts(cb) {
        iconStream
          .pipe(gulp.dest(path.public + "fonts/")) // 字體輸出資料夾
          .on("finish", cb);
      }
    ],
    done
  );
});

gulp.task("default", ["webserver", "pug", "sass", "html", "css","watch"]);
