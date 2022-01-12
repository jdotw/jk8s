#!/bin/zsh

CDK_DEFAULT_ACCOUNT=498964035443
CDK_DEFAULT_REGION=ap-southeast-2
STACK_NAME=customer

cd cdk
STACK_NAME=$STACK_NAME cdk deploy --all

