#!/bin/sh

CLUSTER_NAME=$(aws cloudformation describe-stacks --stack-name EKSStack --query "Stacks[0].Outputs[?OutputKey=='ClusterName'].OutputValue" --output text)
SECRETS_ROLE_ARN=$(aws cloudformation describe-stacks --stack-name SecretsStack --query "Stacks[0].Outputs[?OutputKey=='ClusterSecretsPolicyARN'].OutputValue" --output text)
DNS_ROLE_ARN=$(aws cloudformation describe-stacks --stack-name DNSStack --query "Stacks[0].Outputs[?OutputKey=='ClusterDNSPolicyARN'].OutputValue" --output text)
USER_ARN=$(aws iam get-user --query 'User.Arn' --output text)

FQDN=$(aws cloudformation describe-stacks --stack-name DNSStack --query "Stacks[0].Outputs[?OutputKey=='FQDN'].OutputValue" --output text)
ZONE_ID=$(aws cloudformation describe-stacks --stack-name DNSStack --query "Stacks[0].Outputs[?OutputKey=='ZoneID'].OutputValue" --output text)

EKSCTL_VERSION=$(eksctl version)
if [[ $? != 0 ]]; then
  echo "ERROR: eksctl not installed"
  exit 1
fi

echo "CLUSTER_NAME: $CLUSTER_NAME"
echo "SECRETS: $SECRETS_ROLE_ARN"
echo "DNS: $DNS_ROLE_ARN"
echo "USER: $USER_ARN"
echo "FQDN: $FQDN"
echo "ZONE_ID: $ZONE_ID"

# Create Namespaces

kubectl apply -f manifests/jk8s-namespace.yaml
kubectl apply -f manifests/external-dns-namespace.yaml
kubectl apply -f manifests/external-secrets-namespace.yaml
kubectl apply -f manifests/cert-manager-namespace.yaml

# Grant AWS User master access to cluster

kubectl patch -n kube-system configmap aws-auth \
  --patch "{\"data\":{\"mapUsers\":\"[{\\\"userarn\\\":\\\"${USER_ARN}\\\",\\\"username\\\":\\\"${USER_ARN}\\\",\\\"groups\\\":[\\\"system:masters\\\"]}]\"}}"

# Create Service Accounts

eksctl utils associate-iam-oidc-provider --cluster=$CLUSTER_NAME --approve

eksctl create iamserviceaccount --cluster=$CLUSTER_NAME \
  --name=external-dns \
  --namespace=external-dns \
  --attach-policy-arn=$DNS_ROLE_ARN \
  --approve
eksctl create iamserviceaccount --cluster=$CLUSTER_NAME \
  --name=cert-manager \
  --namespace=cert-manager \
  --attach-policy-arn=$DNS_ROLE_ARN \
  --approve  

# Create Service Account for External Secrets 
# Note: This is created in the namespace where the secrets are used
eksctl create iamserviceaccount --cluster=$CLUSTER_NAME \
  --name=external-secrets \
  --namespace=jk8s \
  --attach-policy-arn=$SECRETS_ROLE_ARN \
  --approve

# Add Helm Chart Repo
helm repo add jk8s https://jdotw.github.io/jk8s
helm repo update

# Install jk8s bootstrap Helm Chart
FQDN=$FQDN ZONE_ID=$ZONE_ID envsubst < values.yaml | helm upgrade jk8s jk8s/jk8s --install -n jk8s --create-namespace -f -