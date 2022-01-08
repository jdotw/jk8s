#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { RDSStack } from "../lib/rds-stack";
import { TelemetryStack } from "../lib/telemetry-stack";
import { EKSStack } from "../lib/eks-stack";
import { VPCStack } from "../lib/vpc-stack";
import { DNSStack } from "../lib/dns-stack";
import { CertStack } from "../lib/cert-stack";
import { SecretsStack } from "../lib/secrets-stack";
import { OpenSearchStack } from "../lib/opensearch-stack";

const name = process.env.STACK_NAME;

if (!name) {
  console.error("ERROR: STACK_NAME environment variable must be set");
  process.exit(1);
}

const app = new cdk.App();

const vpc = new VPCStack(app, "VPCStack", {});

const secrets = new SecretsStack(app, "SecretsStack", {});

const dns = new DNSStack(app, "DNSStack", {
  name,
});

const rds = new RDSStack(app, "RDSStack", {
  vpc,
});

const cluster = new EKSStack(app, "EKSStack", {
  name,
  vpc,
  rds,
  dns,
});

const opensearch = new OpenSearchStack(app, "OpenSearchStack", { vpc });

const cert = new CertStack(app, "CertStack", {
  name,
  dns,
});

// const bs = new BootstrapStack(app, "BootstrapStack", {
//   name,
//   vpc,
//   rds,
//   dns,
//   cluster,
//   cert,
// });
