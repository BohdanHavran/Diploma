output "vpc_id" {
  value = digitalocean_vpc.this[0].id
}

output "vpc_urn" {
  value = digitalocean_vpc.this[0].urn
}