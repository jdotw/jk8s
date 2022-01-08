import * as iam from "aws-cdk-lib/aws-iam";
import * as eks from "aws-cdk-lib/aws-eks";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Stack, StackProps } from "aws-cdk-lib";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { RDSStack } from "./rds-stack";
import { TelemetryStack } from "./telemetry-stack";
import { ManagedPolicy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { DNSStack } from "./dns-stack";
import { EKSStack } from "./eks-stack";
import { VPCStack } from "./vpc-stack";

export interface CertStackProps extends StackProps {
  name: string;
  dns: DNSStack;
}
export class CertStack extends Stack {
  constructor(scope: Construct, id: string, props?: CertStackProps) {
    super(scope, id, props);

    const { name, dns } = props!;

    this.wildcardCert = new acm.Certificate(this, "Certificate", {
      domainName: "*." + name + ".12kmps.com",
      validation: acm.CertificateValidation.fromDns(dns.zone),
    });

    new cdk.CfnOutput(this, "wildcardCertARN", {
      value: this.wildcardCert.certificateArn,
    });
  }

  readonly wildcardCert: acm.Certificate;
}
