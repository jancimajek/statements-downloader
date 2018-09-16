const debug = require('debug')('statements-downloader:statements:three');
const moment = require('moment');
const agent = require('superagent');
const fs = require('fs');

const WAIT_DELAY = process.env.WAIT_DELAY || 30000;
const { username, password, targetDir, accountNumber } = process.secret.three;
describe('Download statements for', () => {

  it('Three [mobile]', client => {

    client
      .url('https://sso.three.co.uk/mylogin/?service=https%3A%2F%2Fwww.three.co.uk%2FThreePortal%2Fappmanager%2FThree%2FSelfcareUk%3F_pageLabel%3DP22200581501288714397101%26_nfpb%3Dtrue%26&resource=portlet')

      // Login
      .waitForElementVisible('input.login-field-username', WAIT_DELAY)
      .setValue('input.login-field-username', username)
      .setValue('input.login-field-password', password)
      // Wait for the login button to become enabled
      .waitForElementVisible('button.globalButton:enabled', WAIT_DELAY)
      .click('button.globalButton')
      // Wait for the account page to load
      .waitForElementVisible('#pl-view-name', WAIT_DELAY)

      // Go to the statements page and wait for it to load
      .url('https://www.three.co.uk/New_My3/Bill_summary/Your_bills?intid=my3homelinkyourbills')
      .waitForElementVisible('#previousBillhistory tr:nth-child(2) td:nth-child(1)', WAIT_DELAY)

      // Get download URL and session cookie
      .getText('#previousBillhistory tr:nth-child(2) td:nth-child(1)', 
        // statementDate in format "01 Jan 1970" (DD MMM YYYY)
        statementDate => client.getAttribute('#previousBillhistory tr:nth-child(2) td:nth-child(1)', 'onclick',
          // onClickHandler in format "billURL('XXXXXXXXX');" -- we need the XXXXXXXXX
          onClickHandler => client.getCookies(
            // Download the statement
            cookies => downloadStatement(
              moment(statementDate.value, 'DD MMM YYYY'),
              onClickHandler.value.slice(9, -3),
              cookies.value, 
              () => client
                // Logout & finish cleanly
                .url('https://www.three.co.uk/My3Account/Logout')
                .waitForElementVisible('#my3_login_form', WAIT_DELAY)
                .end()
            )
          )
        )
      );
  });
});

/**
 * 
 * @param {Object} statementDate moment.js object
 * @param {String} invoiceId 
 * @param {Array} cookies 
 * @param {Function} done callback
 */
const downloadStatement = (statementDate, invoiceId, cookies, done) => {
  const statementUrl = `https://www.three.co.uk/viewPreviousBill/printableBill/?msisdn=${accountNumber}&invoiceId=${invoiceId}`;
  const headers = {
    'Connection': 'keep-alive', 
    'Pragma': 'no-cache', 
    'Cache-Control': 'no-cache', 
    'Upgrade-Insecure-Requests': '1', 
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', 
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8', 
    'Accept-Encoding': 'gzip, deflate, br', 
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,cs;q=0.7,de;q=0.6,hr;q=0.5,sk;q=0.4', 
    'Referer': 'https://www.three.co.uk/New_My3/Bill_summary/Your_bills?intid=my3homelinkyourbills',
    'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; ')
  };
  debug('Downloading statement from:', statementUrl);
  debug('Request headers:', headers);

  const targetFile = process.env.TARGET_DIR + targetDir + statementDate.format('YYYY-MM[ Bill ]') + invoiceId + '.pdf';
  debug('Downloading to:', targetFile);

  agent
    .get(statementUrl)
    .set(headers)
    .pipe(fs.createWriteStream(targetFile))
    .on('finish', () => {
      debug('Download complete');
      done();
    })
    .on('error', e => {
      debug('Download error:', e);
      done();
    });
};
