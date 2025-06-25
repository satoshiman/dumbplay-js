const { src, dest } = require("gulp");
const concat = require("gulp-concat");

function bundleScripts() {
  return src([
    "src/checking.js",
    "src/api.js",
    "src/wallet.js",
    "src/utils.js",
    "src/stats.js",
    "src/main.js",
  ])
    .pipe(concat("script.js"))
    .pipe(dest("dist/"));
}

exports.default = bundleScripts;
