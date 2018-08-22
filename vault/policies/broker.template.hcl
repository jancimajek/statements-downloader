# Allow token to generate new tokens
path "auth/token/create" {
	capabilities = ["create", "update"]
  required_parameters = ["policies", "no_default_policy", "ttl", "num_uses"]
  allowed_parameters = {
    "ttl" = ["10s"]
    "*" = []
  }
}

# Allow tokens to look up their own properties
path "auth/token/lookup-self" {
  capabilities = ["read"]
}

# Allow tokens to revoke themselves
path "auth/token/revoke-self" {
  capabilities = ["update"]
}

# Allow a token to read the secrets
path "${VAULT_SECRET_PATH}" {
  capabilities = ["read"]
  min_wrapping_ttl = "1s"
  max_wrapping_ttl = "10s"
}

# Allow a token to wrap the secrets in a response-wrapping token
path "sys/wrapping/wrap" {
  capabilities = ["update"]
}
