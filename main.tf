resource "digitalocean_project" "diploma" {
  name        = "Gremcy"
  purpose     = "Operational / Developer tooling"
  resources = [
    module.k8s.urn,
    module.vpc.vpc_urn
  ]
  is_default  = "true"
}

module "vpc" {
  source      = "./module/vpc"
  enabled     = true
  name        = "vpc-diploma"
  region      = "fra1"
  ip_range    = "10.10.0.0/16"
  description = "Diploma"
}

module "k8s" {
  source = "./module/k8s"

  name            = "Diploma"
  environment     = "prod"
  region          = "fra1"
  cluster_version = "1.32.2-do.1"
  vpc_uuid        = module.vpc.vpc_id

  node_pools = {
    default_node = {
      name       = "Diploma"
      node_count = 2
      min_nodes  = 2
      max_nodes  = 3
      auto_scale = true
      size       = "s-2vcpu-4gb"
      labels     = { "cluster" = "critical", }
      tags       = ["Diploma"]
      taint = [
        {
          key    = "name"
          value  = "default"
          effect = "NoSchedule"
        }
      ]
    }
  }
}