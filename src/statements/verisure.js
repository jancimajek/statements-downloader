const debug = require('debug')('statements-downloader:statements:verisure');
const moment = require('moment');
const agent = require('superagent');
const fs = require('fs');
const { URL } = require('url');

const WAIT_DELAY = process.env.WAIT_DELAY || 30000;
const { username, password, targetDir } = process.secret.verisure;
describe('Download statements for', () => {

  it('Verisure [security alarm]', client => {

    client
      .url('https://customers.verisure.co.uk/gb/bills')

      // Login
      .waitForElementVisible('#verisure_rsi_login_nick', WAIT_DELAY)
      .setValue('#verisure_rsi_login_nick', username)
      .setValue('#verisure_rsi_login_passwd', password)
      .click('#button_login')

      // Wait for statements page to load
      .waitForElementVisible('ul.m_billing_content .m_receipt:nth-child(1) a.m_link_file', WAIT_DELAY)

      // Get download URL and session cookie
      .getAttribute('ul.m_billing_content .m_receipt:nth-child(1) a.m_link_file', 'href', 
        statementHref => client.getCookie('_session_id', 
          // Download the statement
          cookie => downloadStatement(statementHref.value, cookie.value, () => client
            // Logout & finish cleanly
            .click('div.wrapper a.m_btn')
            .waitForElementVisible('#verisure_rsi_login_nick', WAIT_DELAY)
            .end()            
          )
        )
      );
  });
});

const downloadStatement = (statementUrl, sessionId, done) => {
  // Format: https://customers.verisure.co.uk/gb/bills/CONTRACT_ID/download-pdf?billid=\YY\MMC\d{6}&contract=CONTRACT_ID
  const headers = {
    'Connection': 'keep-alive', 
    'Pragma': 'no-cache', 
    'Cache-Control': 'no-cache', 
    'Upgrade-Insecure-Requests': '1', 
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36', 
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8', 
    'Accept-Encoding': 'gzip, deflate, br', 
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,cs;q=0.7,de;q=0.6,hr;q=0.5,sk;q=0.4', 
    'Cookie': `accept_cookies=1; _session_id=${sessionId}`
  };
  debug('Downloading statement from:', statementUrl);
  debug('Request headers:', headers);

  const parsedUrl = new URL(statementUrl);
  const billId = parsedUrl.searchParams.get('billid');
  const targetFile = process.env.TARGET_DIR + targetDir + moment(billId, 'YYMM[C]').format('YYYY-MM[ Factura-]') + billId + '.pdf';

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
