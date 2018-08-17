# Statement downloader

## Install

First install [Hashicorp Vault](https://www.vaultproject.io/), then clone and install the app"

```bash
$ git clone https://github.com/jancimajek/statements-downloader.git
$ cd statements-downloader
$ npm install
```

## Configure

Create a `.env` file:

```bash
DEBUG="statements-downloader:*,secret-env,download-watcher"
VAULT_DATA_DIR="/path/to/your/vault/data"
VAULT_TOKEN_FILE="/tmp/.vault-token.json"
UNWRAP_TOKEN_FILE="/tmp/.unwrap-token.json"
DOWNLOAD_DIR="/path/to/your/chrome/download/folder/"
TARGET_DIR="/path/to/your/target/folder/"
```

Export `VAULT_ADDR` environment variable (best place this into the `~/.bashrc` file):

```bash
$ export VAULT_ADDR='http://127.0.0.1:8200'
```

## Vault

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
    
## Download statements

```bash
$ npm start
```

You will be prompted to enter the broker token.

## Stop Vault
Once done downlowading the statements, stop Vault:

```bash
$ npm run vault:stop
```