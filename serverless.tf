resource "null_resource" "deploy_serverless" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = "serverless deploy --stage dev"
  }
}