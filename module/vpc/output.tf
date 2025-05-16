output "vpc_id" {
  value = digitalocean_vpc.default[0].id
}

output "vpc_urn" {
  value = digitalocean_vpc.default[0].urn
}