# Statement downloader

_Tool to securely automate regular downloads of various utility and bank statements_

## 📲 Install

First install [Hashicorp Vault](https://www.vaultproject.io/), then clone and install the app:

```bash
$ git clone https://github.com/jancimajek/statements-downloader.git
$ cd statements-downloader
$ npm install
```

## 🛠 Configure

Create a `.env` file:

```bash
DEBUG="statements-downloader:*,secret-env,download-watcher"
VAULT_DATA_DIR="/path/to/your/vault/data"
VAULT_SECRET_PATH="secret/path/within/vault/to/the/secret/json"
VAULT_TOKEN_FILE="/tmp/.vault-token.json"
UNWRAP_TOKEN_FILE="/tmp/.unwrap-token.json"
DOWNLOAD_DIR="/path/to/your/chrome/download/folder/"
TARGET_DIR="/path/to/your/target/folder/"
WAIT_DELAY=30000
```

Export `VAULT_ADDR` environment variable (best place this into the `~/.bashrc` file):

```bash
$ export VAULT_ADDR='http://127.0.0.1:8200'
```

## 🔐 Vault

### Start Vault
```bash
$ npm run vault
...
Vault server started. Unseal by running 'npm run vault:unseal', 'vault operator unseal' or in browser: http://127.0.0.1:8200
```

### Unseal Vault
- UI: http://localhost:8200/ui/vault/unseal
- CLI:
  ```bash
  $ npm run vault:unseal
  ```
  or
  ```bash
  $ vault operator unseal
  ```
- Confirm vault is unsealed:
  ```bash
  $ vault status | grep Sealed
  Sealed          false
  ```

### Secret JSON format
The downloader expects the secret JSON to be in the following format:

```json
{
  "statement_provider": {
    "username": "user",
    "password": "P455w0Rd",
    "downloadRegex": "^statement_regex_.*\\.pdf$",
    "targetDir": "path/to/target/folder/relative/to/TARGET_DIR/"
  },
  ...
}
```

The `downloadRegex` should match the statement file format for given `statement_provider`. The `targetDir` should be path to directory where the statements for this provider should be moved after download, relative to the `TARGET_DIR` environmental variable.

Note that structure of the `statement_provider` object can be different for different providers, as not all of them require all fields and some require additional fields. For example, providers for which the download happens in the backend via superagent may not require `downloadRegex`; and some providers may require secondary authentication / password.

### Troubleshooting Vault:
- Make sure `VAULT_ADDR` environment variable is set:
  ```bash
  $ export VAULT_ADDR='http://127.0.0.1:8200'
  ```

- Check Vault status:
  ```bash
  $ vault status
  Key                Value
  ---                -----
  Seal Type          shamir
  Sealed             true
  Total Shares       5
  Threshold          3
  Unseal Progress    0/3
  Unseal Nonce       n/a
  Version            0.10.4
  HA Enabled         false
  ```

- Vault logs into `vault.log`
    
## 📥 Download statements

```bash
$ npm start
```

You will be prompted to enter the broker token.

### Filter statements to download
Use environmental variable `MOCHA_GREP` to filter which statements should be downloaded. The value should be a `RegExp` pattern matching `describe` or `it` label. 

```bash
$ MOCHA_GREP=Sky npm start
// or
$ MOCHA_GREP="(Sky|Tonik)" npm start
```

See [Mocha grep documentation](https://mochajs.org/#-g---grep-pattern) for more details.

### Troubleshooting

#### Problem:
The script crashes with the following error:
```bash
   connect ECONNREFUSED 127.0.0.1:4444

   socket hang up
       at createHangUpError (_http_client.js:331:15)
       at Socket.socketCloseListener (_http_client.js:363:23)
```

#### Solution:
This is a weird error when selenium sometimes doesn't start properly. Simply re-running the script should fix the problem (it may need to be re-run a few times until it works).

#### Problem:
The browser hangs loading a page.

#### Solution:
Sometimes you can manually reload the page in the test Chrome but usually nightwatch will have crashed by then. In that case, you'll need to re-run the script.

## 🔒 Stop Vault
Once done downloading the statements, stop Vault:

```bash
$ npm run vault:stop
```