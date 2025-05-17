resource "digitalocean_project" "pharmacy" {
  name        = "Pharmacy"
  purpose     = "Operational / Developer tooling"
  resources = [
    module.k8s.urn[0],
    module.mysql.database_cluster_urn[0]
  ]
  is_default  = "true"
}


module "vpc" {
  source      = "./module/vpc"
  enabled     = true
  name        = "vpc-pharmacy"
  region      = "fra1"
  ip_range    = "10.10.0.0/16"
  description = "Pharmacy"
}

module "container-registry" {
  source                 = "./module/container_registry"
  name                   = "pharmacy"
  environment            = "prod"
  region                 = "fra1"
  subscription_tier_slug = "basic"
}

module "k8s" {
  source = "./module/k8s"

  name            = "pharmacy"
  environment     = "prod"
  region          = "fra1"
  cluster_version = "1.32.2-do.1"
  vpc_uuid        = module.vpc.vpc_id

  docker_credentials = module.container-registry.docker_credentials

  node_pools = {
    default_node = {
      name       = "pharmacy"
      node_count = 2
      min_nodes  = 2
      max_nodes  = 3
      auto_scale = true
      size       = "s-2vcpu-4gb"
      labels     = { "cluster" = "critical", }
      tags       = ["pharmacy"]
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

module "mysql" {
  source                       = "./module/db"
  name                         = "pharmacy"
  environment                  = "prod"
  region                       = "fra1"
  cluster_engine               = "mysql"
  cluster_version              = "8"
  cluster_size                 = "db-s-1vcpu-1gb"
  cluster_node_count           = 1
  cluster_private_network_uuid = module.vpc.vpc_id
  mysql_sql_mode               = "ANSI,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,STRICT_ALL_TABLES,ALLOW_INVALID_DATES"
  cluster_maintenance = {
    maintenance_hour = "02:00:00"
    maintenance_day  = "saturday"
  }
  databases = ["Pharmacy"]

  users = [
    {
      name              = "Pharmacy",
      mysql_auth_plugin = "mysql_native_password"
    }
  ]

  create_firewall = false
  firewall_rules = [
    {
      type  = "ip_addr"
      value = "0.0.0.0"
    }
  ]
}