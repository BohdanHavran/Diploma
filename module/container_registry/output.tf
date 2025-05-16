# ------------------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------------------
output "id" {
  value       = join("", digitalocean_container_registry.this[*].id)
  description = "The id of the container registry."
}
output "name" {
  value       = join("", digitalocean_container_registry.this[*].name)
  description = "The name of the container registry."
}
output "subscription_tier_slug" {
  value       = join("", digitalocean_container_registry.this[*].subscription_tier_slug)
  description = "The slug identifier for the subscription tier."
}
output "region" {
  value       = join("", digitalocean_container_registry.this[*].region)
  description = "The slug identifier for the region."
}
output "endpoint" {
  value       = join("", digitalocean_container_registry.this[*].endpoint)
  description = "The URL endpoint of the container registry."
}
output "server_url" {
  value       = join("", digitalocean_container_registry.this[*].server_url)
  description = "The dothis of the container registry."
}
output "storage_usage_bytes" {
  value       = join("", digitalocean_container_registry.this[*].storage_usage_bytes)
  description = "The amount of storage used in the registry in bytes."
}
output "created_at" {
  value       = join("", digitalocean_container_registry.this[*].created_at)
  description = "The date and time when the registry was created."
}
output "docker_credentials" {
  value       = join("", digitalocean_container_registry_docker_credentials.this[*].docker_credentials)
  description = " Credentials for the container registry."
  sensitive   = true
}
output "expiry_seconds" {
  value       = join("", digitalocean_container_registry_docker_credentials.this[*].expiry_seconds)
  description = "Number of seconds after creation for token to expire."
}
output "credential_expiration_time" {
  value       = join("", digitalocean_container_registry_docker_credentials.this[*].credential_expiration_time)
  description = "The date and time the registry access token will expire."
}