### Run

1. Start & unseal vault:
   ```bash
   $ npm run vault
   ```

1. Start vault:
   ```bash
   $ npm run vault:start
   ```

    - Export vault address:
      ```bash
      $ export VAULT_ADDR='http://127.0.0.1:8200'
      ```

    - Check vault is running:
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
    
2. Unseal vault:
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

  
```bash
vault login -field=policies
# (BROKER_TOKEN)
vault kv get -wrap-ttl=10s -format=json secret/janci/test > ./.secret-wrap.json
vault token create -no-default-policy -policy=unwrap-only -ttl=10s -use-limit=1 -format=json > ./.vault-token.json
```

