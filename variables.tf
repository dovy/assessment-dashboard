variable "tags" {
  default = {}
  type    = map(string)
}

variable "bucket_name" {
  type = string
}
variable "aws_region" {
  type = string
}
variable "aws_account_id" {
  type = string
}
variable "resource_name" {
  type = string
}
variable "athena_logs_database_name" {
  type = string
}
variable "aws_athena_workgroup" {
  description = "Default workgroup to query from."
}
variable "athena_logs_table_name" {
  type = string
}
variable "runtime" {
  description = "Runtime for the Lambda function (e.g., python3.9, nodejs14.x)"
  type        = string
  default     = "python3.10"
}
variable "memory_size" {
  description = "Memory size for the Lambda function"
  type        = number
  default     = 128
}
variable "timeout" {
  description = "Timeout in seconds for the Lambda function"
  type        = number
  default     = 900
}

