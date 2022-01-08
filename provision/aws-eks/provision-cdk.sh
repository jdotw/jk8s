#!/bin/zsh

CDK_DEFAULT_ACCOUNT=498964035443
CDK_DEFAULT_REGION=ap-southeast-2
STACK_NAME=customer

cd cdk
STACK_NAME=$STACK_NAME cdk deploy --all

SECRETS_ROLE_ARN=$(aws cloudformation describe-stacks --stack-name SecretsStack --query "Stacks[0].Outputs[?OutputKey=='ClusterSecretsPolicyARN'].OutputValue" --output text)
DNS_ROLE_ARN=$(aws cloudformation describe-stacks --stack-name DNSStack --query "Stacks[0].Outputs[?OutputKey=='ClusterDNSPolicyARN'].OutputValue" --output text)

echo "SECRETS: $SECRETS_ROLE_ARN"
echo "DNS: $DNS_ROLE_ARN"