terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = ">= 2.28.1"
    }
  }
}

provider "kubernetes" {
  host  = digitalocean_kubernetes_cluster.this[*].endpoint
  token = digitalocean_kubernetes_cluster.this[*].kube_config[0].token
  cluster_ca_certificate = base64decode(
    digitalocean_kubernetes_cluster.this[*].kube_config[0].cluster_ca_certificate
  )
}