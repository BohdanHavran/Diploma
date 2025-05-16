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
  source      = "./modules/vpc"
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
      node_count = 1
      min_nodes  = 1
      max_nodes  = 2
      size       = "s-1vcpu-2gb"
      labels     = { "cluster" = "critical", }
      tags       = ["demo"]
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