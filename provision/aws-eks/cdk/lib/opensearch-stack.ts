import { Stack, StackProps } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as opensearch from "aws-cdk-lib/aws-opensearchservice";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { VPCStack } from "./vpc-stack";
import { domain } from "process";

export interface OpenSearchStackProps extends StackProps {
  vpc: VPCStack;
}
export class OpenSearchStack extends Stack {
  constructor(scope: Construct, id: string, props?: OpenSearchStackProps) {
    super(scope, id, props);

    const masterUserSecret = new secretsmanager.Secret(
      this,
      "MasterUserSecret"
    );

    // const masterUserSecret = new secretsmanager.Secret(
    //   this,
    //   "MasterUserSecret",
    //   {
    //     generateSecretString: {
    //       secretStringTemplate: JSON.stringify({ username: "master-user" }),
    //       generateStringKey: "password",
    //     },
    //   }
    // );

    const prodDomain = new opensearch.Domain(this, "Domain", {
      version: opensearch.EngineVersion.OPENSEARCH_1_0,
      capacity: {
        masterNodes: 3,
        masterNodeInstanceType: "m4.large.search",
        dataNodes: 3,
        dataNodeInstanceType: "m4.large.search",
      },
      ebs: {
        volumeSize: 20,
      },
      zoneAwareness: {
        availabilityZoneCount: 3,
      },
      logging: {
        slowSearchLogEnabled: true,
        appLogEnabled: true,
        slowIndexLogEnabled: true,
      },
      enforceHttps: true,
      nodeToNodeEncryption: true,
      encryptionAtRest: {
        enabled: true,
      },
      fineGrainedAccessControl: {
        masterUserName: "master-user",
        masterUserPassword: masterUserSecret.secretValue,
      },
    });

    new cdk.CfnOutput(this, "OpenSearchDomain", {
      value: prodDomain.domainEndpoint,
      description: "OpenSearch Domain",
      exportName: "OpenSearchDomain",
    });

    new cdk.CfnOutput(this, "MasterUserSecretName", {
      value: masterUserSecret.secretName,
      description: "OpenSearch Master User Secret Name",
      exportName: "MasterUserSecretName",
    });
  }

  readonly db: DatabaseInstance;
}
