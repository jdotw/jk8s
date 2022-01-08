import { Stack, StackProps } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface VPCStackProps extends StackProps {}

export class VPCStack extends Stack {
  constructor(scope: Construct, id: string, props?: VPCStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, "VPC", {
      cidr: "10.0.0.0/16",
      natGateways: 0,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: "public-subnet-1",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "isolated-subnet-1",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 28,
        },
      ],
    });
  }

  readonly vpc: Vpc;
}
