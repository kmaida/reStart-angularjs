exports.config = {
  framework: 'jasmine',
  //version must match jar file
  seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.48.2.jar',
  //seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./tests/e2e.js']
};