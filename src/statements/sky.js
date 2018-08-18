const moment = require('moment');
const watchDownload = require('../download-watcher');
const WAIT_DELAY = process.env.WAIT_DELAY || 30000;

describe('Download statements for', () => {

  it('Sky [broadband]', client => {
    const { username, password, targetDir, downloadRegex } = process.secret.sky;

    // Register with the download watcher
    watchDownload(
      new RegExp(downloadRegex), 
      filename => moment(filename, '[SkyBill_]YYYY-MM-DD[.pdf]').format(`[${targetDir}]YYYY-MM[ ${filename}]`)
    );

    client
      .url('https://www.sky.com/manage/bill')

      // Login
      .waitForElementVisible('#sign-in-userIdentifier', WAIT_DELAY)
      .setValue('#sign-in-userIdentifier', username)
      .setValue('#sign-in-password', password)
      .click('#submitButton')

      // Wait for statements page to load
      .waitForElementVisible('.c-bill-pdf-link', WAIT_DELAY)

      // Download
      .click('.c-bill-pdf-link')

      // Wait for the statement to be generated
      .pause(500)
      .waitForElementNotVisible('.c-spinner.u-margin-right-tiny', WAIT_DELAY)

      // Allow some time for the download & finish cleanly
      .pause(1000)
      .end();
  });
});