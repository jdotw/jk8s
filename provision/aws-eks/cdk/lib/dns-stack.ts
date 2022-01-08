import * as route53 from "aws-cdk-lib/aws-route53";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface DNSStackProps extends StackProps {
  name: string;
}
export class DNSStack extends Stack {
  constructor(scope: Construct, id: string, props?: DNSStackProps) {
    super(scope, id, props);

    const { name } = props!;

    // Zone
    this.zone = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: `${name}.12kmps.com`,
    });

    // Policy: In-cluster manipulation of zone
    // This policy can be used by both external-dns and
    // cert-manager for DNS record inspection and manipulation
    const clusterDNSPolicy = new iam.ManagedPolicy(this, "ClusterDNSPolicy", {
      managedPolicyName: "ClusterDNSPolicy",
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [this.zone.hostedZoneArn],
          actions: [
            "route53:ChangeResourceRecordSets",
            "route53:ListResourceRecordSets",
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: ["*"],
          actions: ["route53:ListHostedZones", "route53:ListHostedZonesByName"],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: ["arn:aws:route53:::change/*"],
          actions: ["route53:GetChange"],
        }),
      ],
    });
    new cdk.CfnOutput(this, "ClusterDNSPolicyARN", {
      value: clusterDNSPolicy.managedPolicyArn,
      description: "Policy for in-cluster manipulation of Route53",
      exportName: "ClusterDNSPolicyARN",
    });
    new cdk.CfnOutput(this, "FQDN", {
      value: this.zone.zoneName,
      description: "FQDN",
      exportName: "FQDN",
    });
    new cdk.CfnOutput(this, "ZoneID", {
      value: this.zone.hostedZoneId,
      description: "ZoneID",
      exportName: "ZoneID",
    });
  }
  readonly zone: route53.PublicHostedZone;
}
