---
cssclasses: ltr
tags: [terraform, devops , commands, virtual]  
created: 2021-04-22 14:49
modified: 2021-05-25 14:06
type: Document
title: Terraform
layout: layouts/post.njk
---


## Installing 
Windows users:
1. Go to https://www.terraform.io/downloads.html
2. Press 64-bit:
3. Extract the zip file (you just downloaded).
4. Move terraform.exe file to C:\Windows\System32

Validation:
Open a CMD / Terminal and run: 
```powershell
terraform –v
```
Any response other than “terraform is not recognized” is good


## AWS Configuration
### Login as Yakikim2
![[Attachments/Pasted image 20210419100244.png]]

### Lunch instance at EC2
![](static/Pasted%20image%2020210419100627.png)
![[Attachments/Pasted image 20210419100627.png]]
### Define user at IAM
you should define user with the proper credentials as well as "AWS Identity and Access Management"  credential.

![[Attachments/Pasted image 20210419101516.png]]
then you will generate and backup the access+secret key at the "Security credentials" tab

### Generate the SSH Key pair
At EC2 you should create a "Key pair" that latly you will use it in VNC tool like [[YakisSite/Putty]]
![[Attachments/Pasted image 20210419102127.png]]


### Edis the file https://github.com/Dgotlieb/SimpleTerraform/blob/main/main.tf 
finally it looks (In MY case) as:
```
provider "aws" {
  region = "us-west-2"
  access_key = "AKIA3H4ALTA4AI57N7OC"
  secret_key = "P8ajJLaMkleVB4hs7UOzd5Cnssu5SievRVhtoLzp"
}

resource "aws_instance" "example" {
  ami           = "ami-02701bcdc5509e57b"
  key_name		= "custom_key"
  instance_type = "t2.micro"
  vpc_security_group_ids = ["${aws_security_group.instance.id}"]
  user_data = <<-EOF
              #!/bin/bash
              sudo apt update
              yes | sudo apt install nginx
              EOF
  
  tags = {
    Name = "terraform-example"
  }
}

resource "aws_security_group" "instance" {
  name = "terraform-example-instance"
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Add Output
output "public_ip" {
  value       = "aws_instance.example.public_ip"
  description = "The public IP of the web server"
}
```

### Terraform Init and apply

```
terraform init

terraform plan

terraform apply
```
Then type 'yes' and the instances will be created.  
when we wnat to use the IP for the SSH connection, we can send the command
```
terraform destroy
```
and the IP will be displayd (DONT approve the destroy..)

-----------------------------------------------
# About Terraform


=========

- Website: https://www.terraform.io
- Forums: [HashiCorp Discuss](https://discuss.hashicorp.com/c/terraform-core)
- Documentation: [https://www.terraform.io/docs/](https://www.terraform.io/docs/)
- Tutorials: [HashiCorp's Learn Platform](https://learn.hashicorp.com/terraform)
- Certification Exam: [HashiCorp Certified: Terraform Associate](https://www.hashicorp.com/certification/#hashicorp-certified-terraform-associate)

<img alt="Terraform" src="https://www.terraform.io/assets/images/logo-hashicorp-3f10732f.svg" width="600px">

Terraform is a tool for building, changing, and versioning infrastructure safely and efficiently. Terraform can manage existing and popular service providers as well as custom in-house solutions.

The key features of Terraform are:

- **Infrastructure as Code**: Infrastructure is described using a high-level configuration syntax. This allows a blueprint of your datacenter to be versioned and treated as you would any other code. Additionally, infrastructure can be shared and re-used.

- **Execution Plans**: Terraform has a "planning" step where it generates an *execution plan*. The execution plan shows what Terraform will do when you call apply. This lets you avoid any surprises when Terraform manipulates infrastructure.

- **Resource Graph**: Terraform builds a graph of all your resources, and parallelizes the creation and modification of any non-dependent resources. Because of this, Terraform builds infrastructure as efficiently as possible, and operators get insight into dependencies in their infrastructure.

- **Change Automation**: Complex changesets can be applied to your infrastructure with minimal human interaction. With the previously mentioned execution plan and resource graph, you know exactly what Terraform will change and in what order, avoiding many possible human errors.

For more information, see the [introduction section](http://www.terraform.io/intro) of the Terraform website.

Getting Started & Documentation
-------------------------------
Documentation is available on the [Terraform website](http://www.terraform.io):
  - [Intro](https://www.terraform.io/intro/index.html)
  - [Docs](https://www.terraform.io/docs/index.html)

If you're new to Terraform and want to get started creating infrastructure, please check out our [Getting Started guides](https://learn.hashicorp.com/terraform#getting-started) on HashiCorp's learning platform. There are also [additional guides](https://learn.hashicorp.com/terraform#operations-and-development) to continue your learning.

Show off your Terraform knowledge by passing a certification exam. Visit the [certification page](https://www.hashicorp.com/certification/) for information about exams and find [study materials](https://learn.hashicorp.com/terraform/certification/terraform-associate) on HashiCorp's learning platform.

Developing Terraform
--------------------

This repository contains only Terraform core, which includes the command line interface and the main graph engine. Providers are implemented as plugins, and Terraform can automatically download providers that are published on [the Terraform Registry](https://registry.terraform.io). HashiCorp develops some providers, and others are developed by other organizations. For more information, see [Extending Terraform](https://www.terraform.io/docs/extend/index.html).

To learn more about compiling Terraform and contributing suggested changes, please refer to [the contributing guide](.github/CONTRIBUTING.md).

To learn more about how we handle bug reports, please read the [bug triage guide](./BUGPROCESS.md).

## License
[Mozilla Public License v2.0](https://github.com/hashicorp/terraform/blob/main/LICENSE)
