resource "digitalocean_kubernetes_cluster" "this" {
  count                = var.enabled ? 1 : 0
  name                 = "${var.name}-cluster"
  region               = var.region
  version              = var.cluster_version
  vpc_uuid             = var.vpc_uuid
  auto_upgrade         = var.auto_upgrade
  surge_upgrade        = var.surge_upgrade
  ha                   = var.ha
  registry_integration = var.registry_integration

  dynamic "node_pool" {
    for_each = local.default_node_pool
    content {
      name       = lookup(node_pool.value, "name", node_pool.key)
      size       = lookup(node_pool.value, "size", "s-1vcpu-2gb")
      node_count = lookup(node_pool.value, "auto_scale", true) ? null : lookup(node_pool.value, "node_count", 1)
      auto_scale = lookup(node_pool.value, "auto_scale", true)
      min_nodes  = lookup(node_pool.value, "min_nodes", 1)
      max_nodes  = lookup(node_pool.value, "max_nodes", 2)
      tags       = lookup(node_pool.value, "tags", [])
      labels     = lookup(node_pool.value, "labels", {})

      dynamic "taint" {
        for_each = lookup(node_pool.value, "taint", [])
        content {
          key    = lookup(taint.value, "key", null)
          value  = lookup(taint.value, "value", null)
          effect = lookup(taint.value, "effect", null)
        }
      }
    }
  }

  dynamic "maintenance_policy" {
    for_each = var.auto_upgrade ? [1] : []
    content {
      day        = var.maintenance_policy.day
      start_time = var.maintenance_policy.start_time
    }
  }
  tags = var.tags
}

resource "digitalocean_kubernetes_node_pool" "this" {
  for_each   = var.enabled ? local.remaining_node_pools : {}
  cluster_id = digitalocean_kubernetes_cluster.this[*].id

  name       = lookup(each.value, "name", each.key)
  size       = lookup(each.value, "size", "s-1vcpu-2gb")
  node_count = lookup(each.value, "auto_scale", true) ? null : lookup(each.value, "node_count", 1)
  auto_scale = lookup(each.value, "auto_scale", true)
  min_nodes  = lookup(each.value, "min_nodes", 1)
  max_nodes  = lookup(each.value, "max_nodes", 2)
  tags       = lookup(each.value, "tags", [])
  labels     = lookup(each.value, "labels", {})

  dynamic "taint" {
    for_each = lookup(each.value, "taint", [])
    content {
      key    = taint.value["key"]
      value  = taint.value["value"]
      effect = taint.value["effect"]
    }
  }
}

resource "kubernetes_secret" "this" {
  metadata {
    name = "docker-cfg"
  }

  data = {
    ".dockerconfigjson" = var.docker_credentials != "" ? var.docker_credentials : base64encode("{}")
  }

  type = "kubernetes.io/dockerconfigjson"
}