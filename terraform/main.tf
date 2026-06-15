resource "aws_security_group" "medconnect_sg" {
  name        = "medconnect-sg"
  description = "Security Group for MedConnect"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Frontend (Vite)"
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend API"
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "medconnect-sg"
  }
}

resource "aws_instance" "medconnect" {
  ami                    = "ami-0c803b171269e2d72"
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.medconnect_sg.id]

  tags = {
    Name        = var.instance_name
    Project     = "MedConnect"
    Environment = "Production"
  }
}