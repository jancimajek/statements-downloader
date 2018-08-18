const moment = require('moment');
const watchDownload = require('../download-watcher');
const WAIT_DELAY = process.env.WAIT_DELAY || 30000;

describe('Download statements for', () => {

  it('Tonik energy [electricity]', client => {
    const { username, password, targetDir, downloadRegex } = process.secret.tonikenergy;
    client
      .url('https://my.tonikenergy.com/PaymentsAndStatements')

      // Login
      .waitForElementVisible('input[name=email]', WAIT_DELAY)
      .setValue('input[name=email]', username)
      .setValue('input[name=password]', password)
      .click('button[name=submit]')

      // Wait for statements page to load
      .useXpath()
      .waitForElementVisible('//section[@id="PaymentHistoryTable"]//tr[@class="is-statement-row"][1]//td[@class="statementLinks"]/a[text()="Download"]', WAIT_DELAY)

      // Get statement date and register with download watcher
      .getText('//section[@id="PaymentHistoryTable"]//tr[@class="is-statement-row"][1]/td[1]/span[@class="payment-history-data"]', 
        statementDate => watchDownload(
          new RegExp(downloadRegex), 
          filename => moment(statementDate.value, 'DD/MM/YYYY').format(`[${targetDir}]YYYY-MM ${filename}`))
      )

      // Download
      .click('//section[@id="PaymentHistoryTable"]//tr[@class="is-statement-row"][1]//td[@class="statementLinks"]/a[text()="Download"]')
      // .click("#PaymentHistoryTable tr.is-statement-row td.statementLinks > a[data-bind='visible: IsStatement() && !StatementDownloadIsBusy(), click: ViewStatement']")

      // Wait for the statement to be generated
      .pause(500)
      .waitForElementVisible('//section[@id="PaymentHistoryTable"]//tr[@class="is-statement-row"][1]//td[@class="statementLinks"]/a[text()="Download"]', WAIT_DELAY)

      // Allow some time for the download & finish cleanly
      .pause(1000)
      .end();
  });
});