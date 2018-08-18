const fs = require('fs');
const debug = require('debug')('download-watcher');

const matchers = [];
const register = (regex, prefix) => {
  debug('Registering matcher', regex, `with target prefix '${prefix}'`);
  matchers.push({ regex, prefix });
};

debug('Watching', process.env.DOWNLOAD_DIR, 'for downloads...');
fs.watch(process.env.DOWNLOAD_DIR, { persistent: false }, (event, filename) => {
  let matcherIndex;
  let prefix;
  if (
    filename && 
    matchers.some((matcher, index) => { 
      matcherIndex = index; 
      prefix = matcher.prefix;
      return matcher.regex.test(filename); 
    })
  ) {
    // Remove matcher so that it matches only once:
    matchers.splice(matcherIndex, 1);

    const src = process.env.DOWNLOAD_DIR + filename;
    const dest = process.env.TARGET_DIR + prefix + filename;
    debug('Moving', src, '->', dest);

    /**
     * Cannot use rename if moving between devices
     * @see https://stackoverflow.com/questions/43206198/what-does-the-exdev-cross-device-link-not-permitted-error-mean
     */
    fs.copyFileSync(src, dest);
    fs.unlinkSync(src);
  }
});

module.exports = register;