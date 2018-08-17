storage "file" {
  path = "${VAULT_DATA_DIR}"
}

listener "tcp" {
 address        = "127.0.0.1:8200"
 tls_disable    = true
}

ui                 = true
max_lease_ttl      = "1h"
default_lease_ttl  = "1h"
pid_file           = "./vault.pid"