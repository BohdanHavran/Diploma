variable "bucket_name" {
  description = "The name of the bucket"
  type        = string
  default     = ""
}

variable "region" {
  description = "The region where the bucket resides"
  type        = string
  default     = "fra1"
}

variable "acl" {
  description = "Canned ACL applied on bucket creation"
  type        = string
  default     = "private"
}

variable "force_destroy" {
  description = "The bucket will only be destroyed if empty"
  type        = string
  default     = "true"
}

variable "policy" {
  type        = any
  default     = null
  description = "The text of the policy."
}

variable "cors_rule" {
  type = list(object({
    allowed_headers = list(string)
    allowed_methods = list(string)
    allowed_origins = list(string)
    expose_headers  = list(string)
    max_age_seconds = number
  }))
  default     = null
  description = "CORS Configuration specification for this bucket"
}

variable "lifecycle_rule" {
  type        = list(any)
  default     = []
  description = "A configuration of object lifecycle management (documented below)."
}

variable "expiration" {
  type        = list(any)
  default     = []
  description = "Specifies a time period after which applicable objects expire (documented below)."
}

variable "cdn_enabled" {
  type = object({
    enabled                 = bool
    digitalocean_domain_id  = string
    domain_name             = string
    cert_name               = string
    ttl                     = string
  })
  default = {
    enabled                 = false
    digitalocean_domain_id  = null
    domain_name             = null
    cert_name               = null
    ttl                     = null
  }
}