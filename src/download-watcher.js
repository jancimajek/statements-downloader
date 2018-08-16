const fs = require('fs');
const debug = require('debug')('download-watcher');

const regexes = [];
const register = (regex, prefix) => {
  debug('Registering matcher', regex, `with target prefix '${prefix}'`);
  regexes.push({ regex, prefix });
};

debug('Watching', process.env.DOWNLOAD_DIR, 'for downloads...');
fs.watch(process.env.DOWNLOAD_DIR, { persistent: false }, (event, file) => {
  let regexIndex = -1;
  let prefix = '';
  if (
    file && 
    regexes.some((matcher, index) => { 
      regexIndex = index; 
      prefix = matcher.prefix;
      return matcher.regex.test(file); 
    })
  ) {
    // Remove matcher so that it matches only once:
    regexes.splice(regexIndex, 1);

    const src = process.env.DOWNLOAD_DIR + file;
    const dest = process.env.TARGET_DIR + prefix + file;
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