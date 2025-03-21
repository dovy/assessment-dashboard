locals {
  resource_name = format("%s-%s",
    var.resource_name,
    "portal"
  )
}

resource "aws_iam_role" "lambda_iam_role" {
  name               = "${local.resource_name}-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Allow reading from S3
resource "aws_iam_role_policy" "lambda_s3_policy" {
  name = "${local.resource_name}-portal-policy"
  role = aws_iam_role.lambda_iam_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "athena:StartQueryExecution",
          "athena:GetQueryExecution",
          "athena:GetQueryResults"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
           # The bucket itself
          "arn:aws:s3:::${var.bucket_name}",
          # All objects within the bucket
          "arn:aws:s3:::${var.bucket_name}/*"
        ]
      },
#   {
#         Effect = "Allow"
#         Action = [
#           "s3:GetObject",
#           "s3:ListBucket"
#         ]
#         Resource = [
#           "arn:aws:s3:::*",
#         ]
#       },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_attach_AWSLambdaBasicExecutionRole" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_iam_role.name
}

# Attach additional policies needed for Athena, S3, etc.
resource "aws_iam_role_policy_attachment" "lambda_attach_AthenaAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonAthenaFullAccess"
  role       = aws_iam_role.lambda_iam_role.name
}

data "archive_file" "lambda_query_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/src-${random_string.r.result}.zip"
}

resource "random_string" "r" {
  length  = 16
  special = false
}

resource "aws_lambda_function" "athena_portal" {
  function_name    = local.resource_name
  handler          = "app.lambda_handler"
  role             = aws_iam_role.lambda_iam_role.arn
  runtime          = var.runtime
  filename         = "${path.module}/src-${random_string.r.result}.zip"
  source_code_hash = filebase64sha256(data.archive_file.lambda_query_zip.output_path)
  memory_size      = var.memory_size
  timeout          = var.timeout

  # Optionally specify environment variables for your Lambda if needed
  environment {
    variables = {
      ATHENA_DATABASE         = var.athena_logs_database_name
      ATHENA_TABLE            = var.athena_logs_table_name
      S3_BUCKET_NAME          = var.bucket_name
      S3_PREFIX               = "centralized"
      ACCOUNT_ID              = var.aws_account_id
      REGION                  = var.aws_region
      RESOURCE_NAME           = var.resource_name
      POWERTOOLS_SERVICE_NAME = "${local.resource_name}-query"
      ATHENA_WORKGROUP        = var.aws_athena_workgroup.name
    }
  }
  layers = [
    "arn:aws:lambda:${var.aws_region}:017000801446:layer:AWSLambdaPowertoolsPythonV3-${replace(var.runtime, ".", "")}-x86_64:5"
  ]
  tags       = var.tags
  depends_on = [data.archive_file.lambda_query_zip]
}

resource "aws_cloudwatch_log_group" "log_group" {
  name = "/aws/lambda/${aws_lambda_function.athena_portal.id}"
  tags = merge(var.tags, { ExportToS3 = "true" })
}

#########################################
# 4) Create Lambda Function URL (Public)#
#########################################
resource "aws_lambda_function_url" "public_lambda_url" {
  function_name      = aws_lambda_function.athena_portal.arn
  authorization_type = "NONE"
}
