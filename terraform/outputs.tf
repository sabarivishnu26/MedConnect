output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.medconnect.id
}

output "public_ip" {
  description = "Public IP Address"
  value       = aws_instance.medconnect.public_ip
}

output "public_dns" {
  description = "Public DNS Name"
  value       = aws_instance.medconnect.public_dns
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.medconnect_sg.id
}