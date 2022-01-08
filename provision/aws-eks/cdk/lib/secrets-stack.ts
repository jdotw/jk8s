import * as route53 from "aws-cdk-lib/aws-route53";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface SecretsStackProps extends StackProps {}
export class SecretsStack extends Stack {
  constructor(scope: Construct, id: string, props?: SecretsStackProps) {
    super(scope, id, props);

    // Policy: In-cluster retrieval of secrets
    const clusterSecretsPolicy = new iam.ManagedPolicy(
      this,
      "ClusterSecretsPolicy",
      {
        managedPolicyName: "ClusterSecretsPolicy",
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: ["*"],
            actions: [
              "secretsmanager:GetResourcePolicy",
              "secretsmanager:GetSecretValue",
              "secretsmanager:DescribeSecret",
              "secretsmanager:ListSecretVersionIds",
            ],
          }),
        ],
      }
    );
    new cdk.CfnOutput(this, "ClusterSecretsPolicyARN", {
      value: clusterSecretsPolicy.managedPolicyArn,
      description: "Policy for in-cluster manipulation of Route53",
      exportName: "ClusterSecretsPolicyARN",
    });
  }
  readonly zone: route53.PublicHostedZone;
}
