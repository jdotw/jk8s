import { Stack, StackProps } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { VPCStack } from "./vpc-stack";

export interface RDSStackProps extends StackProps {
  vpc: VPCStack;
}
export class RDSStack extends Stack {
  constructor(scope: Construct, id: string, props?: RDSStackProps) {
    super(scope, id, props);

    this.db = new rds.DatabaseInstance(this, "db-instance", {
      vpc: props!.vpc.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13_4,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO
      ),
      credentials: rds.Credentials.fromGeneratedSecret("postgres"),
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 105,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(0),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
      publiclyAccessible: false,
    });

    new cdk.CfnOutput(this, "Endpoint", {
      value: this.db.instanceEndpoint.hostname,
    });

    new cdk.CfnOutput(this, "SecretName", {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      value: this.db.secret?.secretName!,
    });
  }

  readonly db: DatabaseInstance;
}
