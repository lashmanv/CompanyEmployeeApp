// Karma is configured by Angular in angular.json (test target). This file is optional.
// npm test uses scripts/run-tests.js, which sets CHROME_BIN to Puppeteer's Chromium
// so tests run without system Chrome. Run npm install first.
module.exports = function (config) {
  config.set({
    client: { clearContext: false }
  });
};
