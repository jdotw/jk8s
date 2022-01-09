import { Stack, StackProps } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as opensearch from "aws-cdk-lib/aws-opensearchservice";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { VPCStack } from "./vpc-stack";

export interface OpenSearchStackProps extends StackProps {
  vpc: VPCStack;
}
export class OpenSearchStack extends Stack {
  constructor(scope: Construct, id: string, props?: OpenSearchStackProps) {
    super(scope, id, props);

    const prodDomain = new opensearch.Domain(this, "Domain", {
      version: opensearch.EngineVersion.OPENSEARCH_1_0,
      capacity: {
        masterNodes: 3,
        dataNodes: 10,
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
    });

    new cdk.CfnOutput(this, "OpenSearchDomain", {
      value: prodDomain.domainEndpoint,
      description: "OpenSearch Domain",
      exportName: "OpenSearchDomain",
    });
  }

  readonly db: DatabaseInstance;
}
