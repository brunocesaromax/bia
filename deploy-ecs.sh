#!/bin/bash
set -euo pipefail

# ============================================================
# deploy-ecs.sh — Build, push e deploy da imagem BIA no ECS
# ============================================================

ECR_REGISTRY="658886689790.dkr.ecr.us-east-1.amazonaws.com"
AWS_REGION="us-east-1"
IMAGE_NAME="bia"

# Valores padrão (sem ALB)
CLUSTER="cluster-bia-app"
SERVICE="service-bia"
TASK_DEF="task-def-bia"

TAG=""
USE_ALB=false

# ------------------------------------------------------------
# Ajuda
# ------------------------------------------------------------
exibir_ajuda() {
  cat <<EOF

Uso: ./deploy-ecs.sh [opcoes]

Opcoes:
  --tag <commit-hash>   Deploy ou rollback de uma tag especifica ja existente no ECR.
                        Se omitido, usa o commit atual e faz build + push.
  --alb                 Usa recursos com ALB (cluster-bia-alb, service-bia-alb, task-def-bia-alb).
                        Se omitido, usa recursos sem ALB (padrao).
  --help                Exibe esta ajuda.

Exemplos:
  ./deploy-ecs.sh                     # deploy com commit atual, sem ALB
  ./deploy-ecs.sh --alb               # deploy com commit atual, com ALB
  ./deploy-ecs.sh --tag abc1234       # rollback para abc1234, sem ALB
  ./deploy-ecs.sh --tag abc1234 --alb # rollback para abc1234, com ALB

EOF
}

# ------------------------------------------------------------
# Parse de argumentos
# ------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag)
      if [[ -z "${2:-}" ]]; then
        echo "Erro: --tag requer um valor (commit hash)." >&2
        exit 1
      fi
      TAG="$2"
      shift 2
      ;;
    --alb)
      USE_ALB=true
      shift
      ;;
    --help)
      exibir_ajuda
      exit 0
      ;;
    *)
      echo "Opcao desconhecida: $1" >&2
      exibir_ajuda
      exit 1
      ;;
  esac
done

# ------------------------------------------------------------
# Selecionar recursos conforme modo ALB
# ------------------------------------------------------------
if [[ "$USE_ALB" == true ]]; then
  CLUSTER="cluster-bia-alb"
  SERVICE="service-bia-alb"
  TASK_DEF="task-def-bia-alb"
  echo "Modo: com ALB"
else
  echo "Modo: sem ALB"
fi

echo "Cluster:         $CLUSTER"
echo "Service:         $SERVICE"
echo "Task Definition: $TASK_DEF"

# ------------------------------------------------------------
# Modo deploy (sem --tag): build e push da imagem
# ------------------------------------------------------------
if [[ -z "$TAG" ]]; then
  echo ""
  echo "Capturando commit hash atual..."
  TAG=$(git rev-parse --short HEAD)
  echo "Tag: $TAG"

  echo ""
  echo "Autenticando no ECR..."
  aws ecr get-login-password --region "$AWS_REGION" \
    | docker login --username AWS --password-stdin "$ECR_REGISTRY"

  echo ""
  echo "Construindo imagem Docker..."
  docker build -t "$IMAGE_NAME" .

  echo ""
  echo "Tagueando imagem..."
  docker tag "$IMAGE_NAME:latest" "$ECR_REGISTRY/$IMAGE_NAME:$TAG"
  docker tag "$IMAGE_NAME:latest" "$ECR_REGISTRY/$IMAGE_NAME:latest"

  echo ""
  echo "Enviando imagem para o ECR..."
  docker push "$ECR_REGISTRY/$IMAGE_NAME:$TAG"
  docker push "$ECR_REGISTRY/$IMAGE_NAME:latest"

  echo ""
  echo "Imagem enviada com sucesso: $ECR_REGISTRY/$IMAGE_NAME:$TAG"
else
  echo ""
  echo "Modo rollback — usando tag existente: $TAG"
  echo "Build e push ignorados."
fi

# ------------------------------------------------------------
# Ler task definition atual e registrar nova revisao
# ------------------------------------------------------------
NOVA_IMAGE="$ECR_REGISTRY/$IMAGE_NAME:$TAG"

echo ""
echo "Lendo task definition atual: $TASK_DEF..."
TASK_DEF_JSON=$(aws ecs describe-task-definition \
  --task-definition "$TASK_DEF" \
  --region "$AWS_REGION" \
  --query "taskDefinition")

echo "Atualizando imagem do container para: $NOVA_IMAGE"
CONTAINER_DEFS=$(echo "$TASK_DEF_JSON" \
  | jq --arg img "$NOVA_IMAGE" \
    '[.containerDefinitions[] | .image = $img]')

# Montar payload apenas com campos aceitos pelo register-task-definition
REGISTER_PAYLOAD=$(echo "$TASK_DEF_JSON" | jq \
  --argjson containerDefs "$CONTAINER_DEFS" \
  '{
    family: .family,
    containerDefinitions: $containerDefs,
    networkMode: .networkMode,
    cpu: .cpu,
    memory: .memory,
    executionRoleArn: .executionRoleArn,
    taskRoleArn: .taskRoleArn
  }
  | with_entries(select(.value != null and .value != ""))')

echo ""
echo "Registrando nova revisao da task definition..."
NOVA_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --region "$AWS_REGION" \
  --cli-input-json "$REGISTER_PAYLOAD" \
  --query "taskDefinition.taskDefinitionArn" \
  --output text)

echo "Nova revisao registrada: $NOVA_TASK_DEF_ARN"

# ------------------------------------------------------------
# Atualizar o service com a nova revisao
# ------------------------------------------------------------
echo ""
echo "Atualizando service $SERVICE no cluster $CLUSTER..."
aws ecs update-service \
  --region "$AWS_REGION" \
  --cluster "$CLUSTER" \
  --service "$SERVICE" \
  --task-definition "$NOVA_TASK_DEF_ARN" \
  --output text \
  --query "service.serviceArn" > /dev/null

echo ""
echo "Deploy concluido com sucesso!"
echo "  Cluster:          $CLUSTER"
echo "  Service:          $SERVICE"
echo "  Imagem:           $NOVA_IMAGE"
echo "  Task Definition:  $NOVA_TASK_DEF_ARN"
