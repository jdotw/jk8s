import * as iam from "aws-cdk-lib/aws-iam";
import * as eks from "aws-cdk-lib/aws-eks";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as cdk from "aws-cdk-lib";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RDSStack } from "./rds-stack";
import { ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { DNSStack } from "./dns-stack";
import { VPCStack } from "./vpc-stack";
import { NodegroupAmiType } from "aws-cdk-lib/aws-eks";
// import { ArgoCDStack } from "./argocd-stack";

export interface EKSStackProps extends StackProps {
  name: string;
  vpc: VPCStack;
  rds: RDSStack;
  dns: DNSStack;
}
export class EKSStack extends Stack {
  constructor(scope: Construct, id: string, props?: EKSStackProps) {
    super(scope, id, props);

    const { name, rds, dns } = props!;

    // EKS Cluster

    const clusterAdmin = new iam.Role(this, "AdminRole", {
      assumedBy: new iam.AccountRootPrincipal(),
    });

    this.cluster = new eks.Cluster(this, `${name}Cluster`, {
      clusterName: name,
      mastersRole: clusterAdmin,
      version: eks.KubernetesVersion.V1_21,
      defaultCapacity: 0,
    });

    new cdk.CfnOutput(this, "ClusterARN", {
      value: this.cluster.clusterArn,
      description: "Cluster ARN",
      exportName: "ClusterARN",
    });

    new cdk.CfnOutput(this, "ClusterName", {
      value: this.cluster.clusterName,
      description: "Cluster Name",
      exportName: "ClusterName",
    });

    const nodeGroup = this.cluster.addNodegroupCapacity(`${name}NodeGroup`, {
      amiType: NodegroupAmiType.BOTTLEROCKET_X86_64,
      minSize: 6,
      desiredSize: 8,
      maxSize: 10,
    });

    // rds.db.connections.allowFrom(this.cluster, ec2.Port.tcp(5432));

    // Container Registry

    const ecrUser = new iam.User(this, "ECRUser", {
      userName: "ecr",
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonEC2ContainerRegistryPowerUser"
        ),
      ],
    });

    const repository = new ecr.Repository(this, "Repo", {
      imageScanOnPush: true,
    });
  }

  readonly cluster: eks.Cluster;
  readonly dnsServiceAccountName: string;
  readonly dnsServiceAccountARN: string;
  readonly secretsServiceAccountName: string;
  readonly secretsServiceAccountARN: string;
}
