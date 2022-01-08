// import * as iam from "aws-cdk-lib/aws-iam";
// import * as eks from "aws-cdk-lib/aws-eks";
// import { Stack, StackProps } from "aws-cdk-lib";
// import { Construct } from "constructs";
// import { RDSStack } from "./rds-stack";
// import { PolicyStatement } from "aws-cdk-lib/aws-iam";
// import { DNSStack } from "./dns-stack";
// import { EKSStack } from "./eks-stack";
// import { VPCStack } from "./vpc-stack";
// import { CertStack } from "./cert-stack";

// export interface BootstrapStackProps extends StackProps {
//   name: string;
//   vpc: VPCStack;
//   rds: RDSStack;
//   dns: DNSStack;
//   cluster: EKSStack;
//   cert: CertStack;
// }
// export class BootstrapStack extends Stack {
//   constructor(scope: Construct, id: string, props?: BootstrapStackProps) {
//     super(scope, id, props);

//     const { name, rds, dns, cluster, cert } = props!;

//     //
//     // External DNS
//     //

//     // External DNS: Namespace

//     // External DNS: Service Account
//     // const dnsSA = cluster.cluster.addServiceAccount(
//     // const dnsSA = new eks.ServiceAccount(this, "ExternalDNSServiceAccount", {
//     //   cluster: cluster.cluster,
//     //   namespace: "external-dns",
//     //   name: "external-dns",
//     // });
//     // dnsSA.node.addDependency(dnsNamespace);
//     // dnsSA.addToPrincipalPolicy(
//     //   new PolicyStatement({
//     //     effect: iam.Effect.ALLOW,
//     //     resources: [dns.zone.hostedZoneArn],
//     //     actions: ["route53:ChangeResourceRecordSets"],
//     //   })
//     // );
//     // dnsSA.addToPrincipalPolicy(
//     //   new PolicyStatement({
//     //     effect: iam.Effect.ALLOW,
//     //     resources: ["*"],
//     //     actions: ["route53:ListHostedZones", "route53:ListResourceRecordSets"],
//     //   })
//     // );

//     // External DNS: Add Helm Chart
//     // const externalDNSChart = new eks.HelmChart(this, "ExternalDNS", {
//     //   cluster: cluster.cluster,
//     //   chart: "external-dns",
//     //   repository: "https://kubernetes-sigs.github.io/external-dns",
//     //   namespace: "external-dns",
//     //   release: "route53",
//     //   version: "1.7.0",
//     //   values: {
//     //     serviceAccount: {
//     //       create: false,
//     //       name: dnsSA.serviceAccountName,
//     //       annotations: {
//     //         "eks.amazonaws.com/role-arn": dnsSA.role.roleArn,
//     //       },
//     //     },
//     //     domainFilters: [dns.zone.zoneName],
//     //     policy: "sync",
//     //     txtOwnerId: dns.zone.hostedZoneId,
//     //     sources: ["istio-virtualservice", "istio-gateway"],
//     //     extraArgs: [`--exclude-domains=*.${dns.zone.zoneName}`],
//     //     serviceMonitor: {
//     //       enabled: false,
//     //     },
//     //   },
//     // });
//     // externalDNSChart.node.addDependency(dnsNamespace);

//     //
//     // External Secrets
//     //

//     // External Secrets: Namespace
//     // const secretsNamespace = cluster.cluster.addManifest(

//     // External Secrets: Service Account
//     // const secretsSA = cluster.cluster.addServiceAccount(
//     // const secretsSA = new eks.ServiceAccount(
//     //   this,
//     //   "ExternalSecretsServiceAccount",
//     //   {
//     //     cluster: cluster.cluster,
//     //     namespace: "argocd",
//     //     name: "external-secrets",
//     //   }
//     // );
//     // secretsSA.node.addDependency(argoCDNamespace);
//     // secretsSA.node.addDependency(secretsNamespace);
//     // secretsSA.addToPrincipalPolicy(
//     //   new PolicyStatement({
//     //     effect: iam.Effect.ALLOW,
//     //     resources: ["*"],
//     //     actions: [
//     //       "secretsmanager:GetResourcePolicy",
//     //       "secretsmanager:GetSecretValue",
//     //       "secretsmanager:DescribeSecret",
//     //       "secretsmanager:ListSecretVersionIds",
//     //     ],
//     //   })
//     // );

//     // External Secrets: Add Helm Chart
//     // const secretsHelm = cluster.cluster.addHelmChart("ExternalSecrets", {
//     // const secretsHelm = new eks.HelmChart(this, "ExternalSecrets", {
//     //   cluster: cluster.cluster,
//     //   chart: "external-secrets",
//     //   repository: "https://charts.external-secrets.io",
//     //   namespace: "external-secrets",
//     //   release: "aws-sm",
//     //   version: "0.3.10",
//     //   values: {
//     //     installCRDs: true,
//     //   },
//     //   wait: true,
//     // });
//     // secretsHelm.node.addDependency(secretsNamespace);

//     // External Secrets: AWS Secrets Manager Manifest
//     // const secretsManifest = cluster.cluster.addManifest(
//     // const secretsManifest = new eks.KubernetesManifest(
//     //   this,
//     //   "ExternalSecretsManifest",
//     //   {
//     //     cluster: cluster.cluster,
//     //     manifest: [
//     //       {
//     //         apiVersion: "external-secrets.io/v1alpha1",
//     //         kind: "SecretStore",
//     //         metadata: {
//     //           name: "secrets-store-aws-sm",
//     //           namespace: "argocd",
//     //         },
//     //         spec: {
//     //           provider: {
//     //             aws: {
//     //               service: "SecretsManager",
//     //               region: "ap-southeast-2",
//     //               auth: {
//     //                 jwt: {
//     //                   serviceAccountRef: {
//     //                     name: secretsSA.serviceAccountName,
//     //                   },
//     //                 },
//     //               },
//     //             },
//     //           },
//     //         },
//     //       },
//     //     ],
//     //   }
//     // );
//     // secretsManifest.node.addDependency(secretsHelm);
//     // secretsManifest.node.addDependency(argoCDNamespace);

//     // External Secrets: ArgoCD Repo Secret
//     // const argoCDRepoSecret = new eks.KubernetesManifest(
//     //   this,
//     //   "ArgoCDRepoSecretManifest",
//     //   {
//     //     cluster: cluster.cluster,
//     //     manifest: [
//     //       {
//     //         apiVersion: "external-secrets.io/v1alpha1",
//     //         kind: "ExternalSecret",
//     //         metadata: {
//     //           name: "github-credentials",
//     //           namespace: "argocd",
//     //         },
//     //         spec: {
//     //           refreshInterval: "1h",
//     //           secretStoreRef: {
//     //             name: "secrets-store-aws-sm",
//     //             kind: "SecretStore",
//     //           },
//     //           target: {
//     //             name: "github-credentials",
//     //             creationPolicy: "Owner",
//     //             template: {
//     //               metadata: {
//     //                 labels: {
//     //                   "argocd.argoproj.io/secret-type": "repo-creds",
//     //                 },
//     //               },
//     //             },
//     //           },
//     //           dataFrom: [
//     //             {
//     //               key: "github-credentials",
//     //             },
//     //           ],
//     //         },
//     //       },
//     //     ],
//     //   }
//     // );
//     // argoCDRepoSecret.node.addDependency(argoCDNamespace);
//     // argoCDRepoSecret.node.addDependency(secretsManifest);

//     //
//     // Certificate Manager
//     //

//     // Certificate Manager: Namespace
//     // const certManagerNamespace = cluster.cluster.addManifest(
//     // const certManagerNamespace = new eks.KubernetesManifest(
//     //   this,
//     //   "CertManagerNamespace",
//     //   {
//     //     cluster: cluster.cluster,
//     //     manifest: [
//     //       {
//     //         apiVersion: "v1",
//     //         kind: "Namespace",
//     //         metadata: {
//     //           name: "cert-manager",
//     //         },
//     //       },
//     //     ],
//     //   }
//     // );

//     // Certificate Manager: Service Accont
//     // const certManagerSA = cluster.cluster.addServiceAccount(
//     // const certManagerSA = new eks.ServiceAccount(
//     //   this,
//     //   "CertManagerServiceAccount",
//     //   {
//     //     cluster: cluster.cluster,
//     //     namespace: "cert-manager",
//     //     name: "cert-manager",
//     //   }
//     // );
//     // certManagerSA.node.addDependency(certManagerNamespace);
//     // certManagerSA.addToPrincipalPolicy(
//     //   new PolicyStatement({
//     //     effect: iam.Effect.ALLOW,
//     //     resources: ["arn:aws:route53:::change/*"],
//     //     actions: ["route53:GetChange"],
//     //   })
//     // );
//     // certManagerSA.addToPrincipalPolicy(
//     //   new PolicyStatement({
//     //     effect: iam.Effect.ALLOW,
//     //     resources: [dns.zone.hostedZoneArn],
//     //     actions: [
//     //       "route53:ChangeResourceRecordSets",
//     //       "route53:ListResourceRecordSets",
//     //     ],
//     //   })
//     // );
//     // certManagerSA.addToPrincipalPolicy(
//     //   new PolicyStatement({
//     //     effect: iam.Effect.ALLOW,
//     //     resources: ["*"],
//     //     actions: ["route53:ListHostedZonesByName"],
//     //   })
//     // );

//     // Certificate Manager: Add Helm Chart
//     // const certManagerHelm = cluster.cluster.addHelmChart("CertManagerHelm", {
//     // const certManagerHelm = new eks.HelmChart(this, "CertManagerHelm", {
//     //   cluster: cluster.cluster,
//     //   chart: "cert-manager",
//     //   repository: "https://charts.jetstack.io",
//     //   namespace: "cert-manager",
//     //   release: "route53",
//     //   version: "v1.6.1",
//     //   values: {
//     //     installCRDs: true,
//     //     serviceAccount: {
//     //       create: false,
//     //       name: certManagerSA.serviceAccountName,
//     //       annotations: {
//     //         "eks.amazonaws.com/role-arn": certManagerSA.role.roleArn,
//     //       },
//     //     },
//     //     securityContext: {
//     //       fsGroup: 1001,
//     //     },
//     //     prometheus: {
//     //       enabled: true,
//     //       // servicemonitor: {
//     //       //   enabled: true,
//     //       // },
//     //     },
//     //   },
//     //   wait: true,
//     // });

//     // Certificate Manager: Lets Encrypt Issuer (Staging)
//     // const letsEnryptStaging = cluster.cluster.addManifest(
//     // const letsEnryptStaging = new eks.KubernetesManifest(
//     //   this,
//     //   "LetsEncryptStagingManifest",
//     //   {
//     //     cluster: cluster.cluster,
//     //     manifest: [
//     //       {
//     //         apiVersion: "cert-manager.io/v1",
//     //         kind: "ClusterIssuer",
//     //         metadata: {
//     //           name: "letsencrypt-staging",
//     //           namespace: "external-dns",
//     //         },
//     //         spec: {
//     //           acme: {
//     //             server:
//     //               "https://acme-staging-v02.api.letsencrypt.org/directory",
//     //             email: `dns@${dns.zone.zoneName}`,
//     //             privateKeySecretRef: {
//     //               name: "letsencrypt-staging",
//     //             },
//     //             solvers: [
//     //               {
//     //                 dns01: {
//     //                   route53: {
//     //                     region: "us-east-1",
//     //                     hostedZoneID: dns.zone.hostedZoneId,
//     //                   },
//     //                 },
//     //               },
//     //             ],
//     //           },
//     //         },
//     //       },
//     //     ],
//     //   }
//     // );
//     // letsEnryptStaging.node.addDependency(certManagerHelm);

//     // Bootstrap Helm Chart

//     const chart = new eks.HelmChart(this, "BootstrapHelmChart", {
//       cluster: cluster.cluster,
//       repository: `https://jdotw.github.io/jk8s`,
//       chart: "jk8s",
//       release: "jk8s",
//       namespace: "jk8s",
//       createNamespace: true,
//       values: {
//         dns: {
//           fqdn: dns.zone.zoneName,
//           externalDNS: {
//             enabled: true,
//             zoneID: dns.zone.hostedZoneId,
//             aws: {
//               serviceAccountName: dnsSA.serviceAccountName,
//             },
//           },
//         },
//         tls: {
//           certManager: {
//             enabled: true,
//             email: `admin@${dns.zone.zoneName}`,
//             aws: {
//               serviceAccountName: certManagerSA.serviceAccountName,
//             },
//             selfSigned: {
//               enabled: false,
//             },
//             letsEncrypt: {
//               staging: {
//                 enabled: true,
//                 email: `admin@${dns.zone.zoneName}`,
//                 route53: {
//                   zoneID: dns.zone.hostedZoneId,
//                 },
//               },
//             },
//           },
//         },
//         secrets: {
//           externalSecrets: {
//             enabled: true,
//             aws: {
//               secretsManager: {
//                 serviceAccountName: secretsSA.serviceAccountName,
//               },
//             },
//           },
//         },
//         // name: name,
//         // rdsHost: rds.db.dbInstanceEndpointAddress,
//         // rdsPort: rds.db.dbInstanceEndpointPort,
//         // rdsPasswordSecretName: rds.db.secret?.secretName,
//         // fqdn: dns.zone.zoneName,
//         // zoneID: dns.zone.hostedZoneId,
//         // dnsServiceAccountName: dnsSA.serviceAccountName,
//         // dnsServiceAccountARN: dnsSA.role.roleArn,
//         // secretsServiceAccountName: secretsSA.serviceAccountName,
//         // secretsServiceAccountARN: secretsSA.role.roleArn,
//         // certManagerServiceAccountName: certManagerSA.serviceAccountName,
//         // certManagerServiceAccountARN: certManagerSA.role.roleArn,
//         // wildcardCertARN: cert.wildcardCert.certificateArn,
//         // certEmail: `admin@${name}.12kmps.com`,
//       },
//     });
//   }

//   readonly cluster: eks.Cluster;
// }
