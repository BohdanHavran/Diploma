locals {
  node_pool_keys         = keys(var.node_pools)
  default_node_pool_key  = local.node_pool_keys[0]
  default_node_pool      = { for k, v in var.node_pools : k => v if k == local.default_node_pool_key }
  remaining_node_pools   = { for k, v in var.node_pools : k => v if k != local.default_node_pool_key }

  has_docker_credentials = try(length(var.docker_credentials) > 0, false)
}