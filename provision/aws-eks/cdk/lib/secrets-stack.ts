import * as route53 from "aws-cdk-lib/aws-route53";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface SecretsStackProps extends StackProps {}
export class SecretsStack extends Stack {
  constructor(scope: Construct, id: string, props?: SecretsStackProps) {
    super(scope, id, props);

    // Policy: JK8S (Default) Secrets Retrieval Policy
    const jk8sSecretsPolicy = new iam.ManagedPolicy(this, "JK8SSecretsPolicy", {
      managedPolicyName: "JK8SSecretsPolicy",
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
    });
    new cdk.CfnOutput(this, "JK8SSecretsPolicyARN", {
      value: jk8sSecretsPolicy.managedPolicyArn,
      description: "Policy for JK8S (Default) Secrets Retrieval",
      exportName: "JK8SSecretsPolicyARN",
    });

    // Policy: Telemetry Secrets Retrieval Policy
    const telemetrySecretsPolicy = new iam.ManagedPolicy(
      this,
      "TelemetrySecretsPolicy",
      {
        managedPolicyName: "TelemetrySecretsPolicy",
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
    new cdk.CfnOutput(this, "TelemetrySecretsPolicyARN", {
      value: telemetrySecretsPolicy.managedPolicyArn,
      description: "Policy for Telemetry Secrets Retrieval",
      exportName: "TelemetrySecretsPolicyARN",
    });

    // Policy: App Secrets Retrieval Policy
    const appSecretsPolicy = new iam.ManagedPolicy(this, "AppSecretsPolicy", {
      managedPolicyName: "AppSecretsPolicy",
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
    });
    new cdk.CfnOutput(this, "AppSecretsPolicyARN", {
      value: appSecretsPolicy.managedPolicyArn,
      description: "Policy for App Secrets Retrieval",
      exportName: "AppSecretsPolicyARN",
    });
  }
}
