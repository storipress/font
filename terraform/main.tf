terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.54.1"
    }
  }

  cloud {
    organization = "Storipress"
    workspaces {
      name = "fonts"
    }
  }

  required_version = "~> 1.5.0"
}

provider "aws" {
  region     = "us-east-1"
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

resource "aws_s3_object" "fonts" {
  for_each    = fileset("../dist/", "**/*")
  bucket      = "storipress"
  key         = "assets/storipress/${each.value}"
  source      = "../dist/${each.value}"
  source_hash = filemd5("../dist/${each.value}")
}
