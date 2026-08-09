#!/bin/bash
set -e
set -o pipefail

# Deploy completo do projeto BIA: frontend (S3) + backend (ECS)
#
# Uso: ./deploy.sh <hom|prod>

cd "$(dirname "$0")"
source ./deploy.env

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "hom" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "[ERRO] Ambiente inválido: '$ENVIRONMENT'. Uso: ./deploy.sh <hom|prod>"
  exit 1
fi

echo "=============================================="
echo " Deploy BIA — ambiente: $ENVIRONMENT"
echo "=============================================="

echo ""
echo "----- [1/4] Frontend: instalando dependências e gerando build (Vite) -----"
echo "VITE_API_URL=$API_URL"
cd client
npm install
VITE_API_URL=$API_URL npm run build
cd ..
echo "[OK] Build do frontend gerado em client/build/"

echo ""
echo "----- [2/4] Frontend: enviando build para o S3 -----"
echo "Destino: $S3_BUCKET (profile: $AWS_PROFILE)"
aws s3 sync ./client/build/ "$S3_BUCKET" --profile "$AWS_PROFILE"
echo "[OK] Frontend publicado no S3"

echo ""
echo "----- [3/4] Backend: build da imagem Docker e push para o ECR -----"
./build.sh
echo "[OK] Imagem publicada no ECR"

echo ""
echo "----- [4/4] Backend: atualizando o serviço no ECS -----"
echo "Cluster: $ECS_CLUSTER | Service: $ECS_SERVICE"
aws ecs update-service --cluster "$ECS_CLUSTER" --service "$ECS_SERVICE" --force-new-deployment > /dev/null
echo "[OK] Novo deployment disparado no ECS"

echo ""
echo "=============================================="
echo " Deploy finalizado com sucesso — ambiente: $ENVIRONMENT"
echo "=============================================="
