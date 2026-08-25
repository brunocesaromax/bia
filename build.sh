#!/bin/bash
set -e
set -o pipefail

cd "$(dirname "$0")"
source ./deploy.env

echo "  > Autenticando no ECR ($ECR_REGISTRY)..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY

echo "  > Buildando imagem Docker (bia)..."
docker build --build-arg VITE_API_URL=$API_URL -t bia .

echo "  > Taggeando imagem como $ECR_REGISTRY/bia:latest..."
docker tag bia:latest $ECR_REGISTRY/bia:latest

echo "  > Enviando imagem para o ECR..."
docker push $ECR_REGISTRY/bia:latest
