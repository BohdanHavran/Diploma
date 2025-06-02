resource "digitalocean_spaces_bucket" "spaces" {
  name   = var.bucket_name
  region = var.region
  acl = var.acl
  force_destroy = var.force_destroy

  dynamic "cors_rule" {
    for_each = var.cors_rule == null ? [] : var.cors_rule
    content {
      allowed_headers = cors_rule.value.allowed_headers
      allowed_methods = cors_rule.value.allowed_methods
      allowed_origins = cors_rule.value.allowed_origins
      max_age_seconds = cors_rule.value.max_age_seconds
    }
  }

  dynamic "lifecycle_rule" {
    for_each = var.lifecycle_rule
    content {
      id                                     = lookup(lifecycle_rule.value, "id", null)
      enabled                                = lookup(lifecycle_rule.value, "enabled", false)
      prefix                                 = lookup(lifecycle_rule.value, "prefix", null)
      abort_incomplete_multipart_upload_days = lookup(lifecycle_rule.value, "abort_incomplete_multipart_upload_days", null)
      dynamic "expiration" {
        for_each = var.expiration
        content {
          date                         = lookup(expiration.value, "date", null)
          days                         = lookup(expiration.value, "days", null)
          expired_object_delete_marker = lookup(expiration.value, "expired_object_delete_marker", false)
        }
      }
      noncurrent_version_expiration {
        days = lookup(lifecycle_rule.value, "noncurrent_version_expiration_days", null)
      }
    }
  }
}

resource "digitalocean_spaces_bucket_policy" "spaces_policy" {
  count  = var.policy != null ? 1 : 0
  region = join("", digitalocean_spaces_bucket.spaces[*].region)
  bucket = join("", digitalocean_spaces_bucket.spaces[*].name)
  policy = var.policy
}

resource "digitalocean_cdn" "spaces_cdn" {
  count  = var.cdn_enabled.enabled ? 1 : 0
  origin           = join("", digitalocean_spaces_bucket.spaces[*].bucket_domain_name)
  ttl              = var.cdn_enabled.ttl
  custom_domain    = "${var.bucket_name}.${var.cdn_enabled.domain_name}"
  certificate_name = "${var.cdn_enabled.cert_name}"
}

# resource "digitalocean_record" "spaces_record" {
#   count  = var.cdn_enabled.enabled ? 1 : 0
#   domain = var.cdn_enabled.digitalocean_domain_id
#   type   = "CNAME"
#   ttl    = var.cdn_enabled.ttl
#   name   = join("", digitalocean_spaces_bucket.spaces[*].name)
#   value  = format("%s.", join("", digitalocean_cdn.spaces_cdn[*].endpoint))
# }