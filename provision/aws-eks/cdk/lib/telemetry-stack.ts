import { Stack, StackProps } from "aws-cdk-lib";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { RDSStack } from "./rds-stack";
import * as eks from "aws-cdk-lib/aws-eks";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface TelemetryStackProps extends StackProps {
  vpc: Vpc;
  rds: RDSStack;
  cluster: eks.Cluster;
}

export class TelemetryStack extends Stack {
  constructor(scope: Construct, id: string, props?: TelemetryStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // props?.rds.db.connections.allowFrom();
    // dbInstance.connections.allowFrom(ec2Instance, ec2.Port.tcp(5432));
  }
}
