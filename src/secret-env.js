
const debug = require('debug')('secret-env');

debug('Loading vault token from', process.env.VAULT_TOKEN_FILE);
const VAULT_TOKEN = require(process.env.VAULT_TOKEN_FILE).auth.client_token;
debug('Vault token:', VAULT_TOKEN);

const VAULT_ADDR = process && process.env && process.env.VAULT_ADDR ? process.env.VAULT_ADDR : 'http://127.0.0.1:8200/';
debug('Vault address:', VAULT_ADDR);

debug('Loading unwrap token from', process.env.UNWRAP_TOKEN_FILE);
const UNWRAP_TOKEN = require(process.env.UNWRAP_TOKEN_FILE).wrap_info.token;
debug('Unwrap token:', UNWRAP_TOKEN);

require('node-vault')({
  apiVersion: 'v1',
  endpoint: VAULT_ADDR,
  token: VAULT_TOKEN
}).unwrap({ token: UNWRAP_TOKEN })
  .then(result => {
    process.secret = result.data;
    debug('Secrets loaded:', Object.keys(process.secret));
  })
  .catch(e => {
    debug(JSON.stringify(e, null, 2));
  });
