require('dotenv').config();
const dbg = require('debug');
dbg.enable(process.env.DEBUG);
const debug = dbg('statements-downloader:config');

require('./src/secret-env');

const seleniumServer = require('selenium-server');
const chromedriver = require('chromedriver');

debug('Selenium server:', seleniumServer.path);
debug('Chrome driver:', chromedriver.path);

module.exports = {
  src_folders: 'src/statements',
  output_folder: 'reports',
  test_runner: {
    type: 'mocha',
    'options': {
      reporter: 'list'
    }
  },
  custom_assertions_path: '',
  live_output: true,
  disable_colors: false,
  selenium: {
    start_process: true,
    server_path: seleniumServer.path,
    log_path: './',
    host: '127.0.0.1',
    port: 4444,
    cli_args: {
      'webdriver.chrome.driver': chromedriver.path
    }
  },
  test_settings: {
    default: {
      launch_url: 'http://localhost',
      selenium_port: 4444,
      selenium_host: 'localhost',
      silent: true,
      output: true,
      screenshots: {
        enabled: true,
        on_failure: true,
        on_error: true,
        path: './screenshots'
      },
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
        chromeOptions: {
          args: [
            'start-fullscreen',
            'enable-logging=./chromedriver.log'
          ]
        }
      }
    }
  }
};
