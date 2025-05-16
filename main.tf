resource "digitalocean_kubernetes_cluster" "foo" {
  name    = "foo"
  region  = "nyc1"
  version = "1.22.8-do.1"

  node_pool {
    name       = "front-end-pool"
    size       = "s-2vcpu-2gb"
    node_count = 3
  }
}

resource "digitalocean_kubernetes_node_pool" "bar" {
  cluster_id = digitalocean_kubernetes_cluster.foo.id

  name       = "backend-pool"
  size       = "c-2"
  node_count = 2
  tags       = ["backend"]

  labels = {
    service  = "backend"
    priority = "high"
  }

  taint {
    key    = "workloadKind"
    value  = "database"
    effect = "NoSchedule"
  }
}

resource "digitalocean_kubernetes_node_pool" "autoscale-pool-01" {
  cluster_id = digitalocean_kubernetes_cluster.foo.id
  name       = "autoscale-pool-01"
  size       = "s-1vcpu-2gb"
  auto_scale = true
  min_nodes  = 1
  max_nodes  = 5
}