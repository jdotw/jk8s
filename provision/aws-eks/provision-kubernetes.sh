#!/bin/sh

CLUSTER_NAME=$(aws cloudformation describe-stacks --stack-name EKSStack --query "Stacks[0].Outputs[?OutputKey=='ClusterName'].OutputValue" --output text)
ARGOCD_SECRETS_ROLE_ARN=$(aws cloudformation describe-stacks --stack-name SecretsStack --query "Stacks[0].Outputs[?OutputKey=='ArgoCDSecretsPolicyARN'].OutputValue" --output text)
TELEMETRY_SECRETS_ROLE_ARN=$(aws cloudformation describe-stacks --stack-name SecretsStack --query "Stacks[0].Outputs[?OutputKey=='TelemetrySecretsPolicyARN'].OutputValue" --output text)
APP_SECRETS_ROLE_ARN=$(aws cloudformation describe-stacks --stack-name SecretsStack --query "Stacks[0].Outputs[?OutputKey=='AppSecretsPolicyARN'].OutputValue" --output text)
DNS_ROLE_ARN=$(aws cloudformation describe-stacks --stack-name DNSStack --query "Stacks[0].Outputs[?OutputKey=='ClusterDNSPolicyARN'].OutputValue" --output text)
USER_ARN=$(aws iam get-user --query 'User.Arn' --output text)

FQDN=$(aws cloudformation describe-stacks --stack-name DNSStack --query "Stacks[0].Outputs[?OutputKey=='FQDN'].OutputValue" --output text)
ZONE_ID=$(aws cloudformation describe-stacks --stack-name DNSStack --query "Stacks[0].Outputs[?OutputKey=='ZoneID'].OutputValue" --output text)

ES_DOMAIN=$(aws cloudformation describe-stacks --stack-name OpenSearchStack --query "Stacks[0].Outputs[?OutputKey=='OpenSearchDomain'].OutputValue" --output text)

ES_SECRET=$(aws cloudformation describe-stacks --stack-name OpenSearchStack --query "Stacks[0].Outputs[?OutputKey=='MasterUserSecretName'].OutputValue" --output text | sed 's/.*:secret:\([^:]*\):.*/\1/' | sed 's/-[^-]*$//')

RDS_SECRET=$(aws cloudformation describe-stacks --stack-name RDSStack --query "Stacks[0].Outputs[?OutputKey=='SecretName'].OutputValue" --output text)

RDS_HOST=$(aws cloudformation describe-stacks --stack-name RDSStack --query "Stacks[0].Outputs[?OutputKey=='Host'].OutputValue" --output text)

KUBECTL_CONFIG=$(aws cloudformation describe-stacks --stack-name EKSStack --query "Stacks[0].Outputs[?starts_with(OutputKey, '${CLUSTER_NAME}ClusterConfigCommand')].OutputValue" --output text)
/bin/sh -c "${KUBECTL_CONFIG}"

EKSCTL_VERSION=$(eksctl version)
if [[ $? != 0 ]]; then
  echo "ERROR: eksctl not installed"
  exit 1
fi

echo "CLUSTER_NAME: $CLUSTER_NAME"
echo "ARGOCD SECRETS: $ARGOCD_SECRETS_ROLE_ARN"
echo "TELEMETRY SECRETS: $TELEMETRY_SECRETS_ROLE_ARN"
echo "APP SECRETS: $APP_SECRETS_ROLE_ARN"
echo "DNS: $DNS_ROLE_ARN"
echo "USER: $USER_ARN"
echo "FQDN: $FQDN"
echo "ZONE_ID: $ZONE_ID"
echo "ES_DOMAIN: $ES_DOMAIN"
echo "ES_SECRET: $ES_SECRET"
echo "RDS_SECRET: $RDS_SECRET"
echo "RDS_HOST: $RDS_HOST"

# Create Namespaces

kubectl apply -f manifests/jk8s-namespace.yaml
kubectl apply -f manifests/external-dns-namespace.yaml
kubectl apply -f manifests/external-secrets-namespace.yaml
kubectl apply -f manifests/cert-manager-namespace.yaml
kubectl apply -f manifests/app-namespace.yaml

# Grant AWS User master access to cluster

kubectl patch -n kube-system configmap aws-auth \
  --patch "{\"data\":{\"mapUsers\":\"[{\\\"userarn\\\":\\\"${USER_ARN}\\\",\\\"username\\\":\\\"${USER_ARN}\\\",\\\"groups\\\":[\\\"system:masters\\\"]}]\"}}"

# Create Service Accounts

eksctl utils associate-iam-oidc-provider --cluster=$CLUSTER_NAME --approve

eksctl create iamserviceaccount --cluster=$CLUSTER_NAME \
  --name=external-dns \
  --namespace=external-dns \
  --attach-policy-arn=$DNS_ROLE_ARN \
  --override-existing-serviceaccounts \
  --approve
eksctl create iamserviceaccount --cluster=$CLUSTER_NAME \
  --name=cert-manager \
  --namespace=cert-manager \
  --attach-policy-arn=$DNS_ROLE_ARN \
  --override-existing-serviceaccounts \
  --approve  

# Create Service Accounts for External Secrets 
# Note: These are created in the namespace where the secrets will be used
#       A separate role is created for each namespace
#       This provides granular control over what secrets can be accessed

# jk8s external secrets
eksctl create iamserviceaccount --cluster=$CLUSTER_NAME \
  --name=external-secrets \
  --namespace=jk8s \
  --attach-policy-arn=$ARGOCD_SECRETS_ROLE_ARN \
  --override-existing-serviceaccounts \
  --approve

# telemetry external secrets
eksctl create iamserviceaccount --cluster=$CLUSTER_NAME \
  --name=external-secrets \
  --namespace=telemetry \
  --attach-policy-arn=$TELEMETRY_SECRETS_ROLE_ARN \
  --override-existing-serviceaccounts \
  --approve

# app external secrets
eksctl create iamserviceaccount --cluster=$CLUSTER_NAME \
  --name=external-secrets \
  --namespace=app \
  --attach-policy-arn=$APP_SECRETS_ROLE_ARN \
  --override-existing-serviceaccounts \
  --approve


# Add Helm Chart Repo
helm repo add jk8s https://jdotw.github.io/jk8s
helm repo update

# Install jk8s bootstrap Helm Chart
FQDN=$FQDN \
  ZONE_ID=$ZONE_ID \
  ES_DOMAIN=$ES_DOMAIN \
  ES_SECRET=$ES_SECRET \
  RDS_SECRET=$RDS_SECRET \
  RDS_HOST=$RDS_HOST \
  envsubst < values.yaml | helm upgrade jk8s jk8s/jk8s --install -n jk8s --create-namespace -f -