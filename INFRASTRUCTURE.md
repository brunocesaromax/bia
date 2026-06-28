# BIA — Documentação de Infraestrutura

> **Projeto:** BIA (Built Intelligence Agent / Formação AWS)
> **Versão:** 4.2.0
> **Região AWS:** us-east-1
> **Account ID:** 658886689790
> **Última atualização:** 2026-06-28

---

## Visão Geral da Arquitetura

```
                              INTERNET
                                 |
                        [ Route 53 / DNS ]
                            bcv.dev.br
               +------------------+------------------+
               |                                     |
   imersao-aws-ia.bcv.dev.br       imersao-aws-ia-dev.bcv.dev.br
               |                                     |
               +------------------+------------------+
                                  |
                             [ ALB unico ]
                     bia-alb-2091615362.us-east-1.elb.amazonaws.com
                                  |
               +------------------+------------------+
               |                                     |
       [ ECS Service ]                     [ ECS Service ]
       service-bia-alb                     service-bia-alb-dev
       task-def-bia-alb                    task-def-bia-alb-dev
       (Dockerfile — URL principal)        (Dockerfile.dev — URL dev)
               |                                     |
               +------------------+------------------+
                                  |
                     [ ECS Cluster unico ]
                     cluster-bia-alb  (com ALB)
                     cluster-bia-app  (sem ALB)
                                  |
               +------------------+------------------+
               |                                     |
        [ ECR Image ]                   [ RDS PostgreSQL — mesmo BD ]
  658886689790.dkr.ecr               bia.ckfawmc080wt.us-east-1
  .us-east-1.amazonaws               .rds.amazonaws.com
        .com/bia                          porta 5432
                                  |
                     [ Secrets Manager ] (opcional)
                     Credenciais do banco via secret

     [ EC2 bia-dev — Maquina de build/desenvolvimento ]
     t3.micro / us-east-1a / porta 3001
```

### Fluxo de CI/CD (CodeBuild)

```
[ GitHub Push ] --> [ CodeBuild ]
                        |
                  buildspec.yml
                        |
                  docker build .
                        |
                  docker push ECR
                        |
                 imagedefinitions.json
                        |
                  [ ECS deploy ]
```

---

## Componentes e Responsabilidades

| Componente | Tecnologia | Responsabilidade |
|---|---|---|
| Frontend | React 18 + Vite | SPA de gerenciamento de tarefas |
| Backend | Node.js + Express 4 | API REST + serve o build do React |
| Banco de dados | PostgreSQL 17 | Persistência das tarefas |
| ORM | Sequelize 6 | Migrations e acesso ao banco |
| Container | Docker (node:22-slim) | Empacotamento da aplicação |
| Registro de imagens | AWS ECR | Armazenamento de imagens Docker |
| Orquestração | AWS ECS (Fargate) | Execução dos containers em produção |
| Balanceador | AWS ALB | Distribuição de tráfego (modo ALB) |
| Banco prod | AWS RDS (PostgreSQL) | Banco gerenciado em produção |
| Segredos | AWS Secrets Manager | Credenciais de banco (opcional) |
| CI/CD | AWS CodeBuild | Build automatizado via buildspec.yml |
| Dev EC2 | Amazon EC2 (t3.micro) | Ambiente de desenvolvimento |
| Acesso remoto | AWS SSM | Acesso seguro à EC2 sem SSH |

---

## Configuração dos Containers

### Dockerfile (Producao)

**Arquivo:** `Dockerfile`

```
Base:       public.ecr.aws/docker/library/node:22.22.1-slim
Porta:      8080
Comando:    npm start
VITE_API_URL: https://imersao-aws-ia.bcv.dev.br
```

**Etapas de build:**
1. Atualiza npm para v11
2. Instala `curl` via apt
3. Copia e instala dependencias raiz (`npm install`)
4. Copia e instala dependencias do client (`npm install --legacy-peer-deps`)
5. Copia todos os arquivos
6. Executa `vite build` do frontend com a URL de API de producao
7. Remove devDependencies do client (`npm prune --production`)
8. Expoe porta 8080 e inicia com `npm start`

### Dockerfile.dev (Service Secundario — mesmo cluster e mesmo BD)

**Arquivo:** `Dockerfile.dev`

Identico ao `Dockerfile`, com uma diferenca: a `VITE_API_URL` aponta para o subdominio `-dev`.

```
VITE_API_URL: https://imersao-aws-ia-dev.bcv.dev.br
```

> Este Dockerfile nao representa um ambiente isolado. Ele gera a imagem de um segundo service ECS que roda no **mesmo cluster** e conecta ao **mesmo banco RDS**. A unica diferenca e a URL de API embutida no build do React. Isso permite expor dois endpoints distintos (com dominios diferentes) partindo da mesma infraestrutura compartilhada.

### Dockerfile_checkdisponibilidade (Monitoramento)

**Arquivo:** `Dockerfile_checkdisponibilidade`

Container utilitario baseado em Alpine para testar disponibilidade de URLs.

```
Base:       alpine
Timezone:   America/Sao_Paulo
Intervalo:  a cada 5 segundos
Variaveis:  URL (default: https://www.google.com.br)
```

---

## Docker Compose (Desenvolvimento Local)

**Arquivo:** `compose.yml`

### Servico: server

| Campo | Valor |
|---|---|
| Build | `.` (Dockerfile raiz) |
| Container | `bia` |
| Porta host | `3001` |
| Porta container | `8080` |
| Depende de | `database` |

**Variaveis de ambiente:**

| Variavel | Valor configurado | Descricao |
|---|---|---|
| `DB_USER` | `postgres` | Usuario do banco |
| `DB_PWD` | `yqoEYa7w5AJHgQtx7VSg` | Senha do banco (RDS producao) |
| `DB_HOST` | `bia.ckfawmc080wt.us-east-1.rds.amazonaws.com` | Host do RDS |
| `DB_PORT` | `5432` | Porta do banco |
| `DB_SECRET_NAME` | _(comentado)_ | Nome do secret no Secrets Manager |
| `DB_REGION` | _(comentado)_ | Regiao do Secrets Manager |
| `IS_LOCAL` | _(comentado)_ | `true` para usar credenciais de env |
| `DEBUG_SECRET` | _(comentado)_ | `true` para logar credenciais |

### Servico: database

| Campo | Valor |
|---|---|
| Imagem | `postgres:17.1` |
| Container | `database` |
| Porta host | `5433` |
| Porta container | `5432` |
| Volume | `db:/var/lib/postgresql/data` |

**Variaveis de ambiente:**

| Variavel | Valor |
|---|---|
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | `postgres` |
| `POSTGRES_DB` | `bia` |

> **Atencao:** No compose.yml, o `DB_HOST` aponta para o RDS de producao. Para uso 100% local (sem RDS), remova o comentario de `IS_LOCAL: true` e altere `DB_HOST` para `database`.

---

## Variaveis de Ambiente da Aplicacao

### Servidor Node.js

| Variavel | Padrao | Obrigatorio | Descricao |
|---|---|---|---|
| `PORT` | `8080` (via config) | Nao | Porta do servidor Express |
| `DB_USER` | `postgres` | Sim | Usuario PostgreSQL |
| `DB_PWD` | `postgres` | Sim | Senha PostgreSQL |
| `DB_HOST` | `127.0.0.1` | Sim | Host do banco |
| `DB_PORT` | `5433` | Nao | Porta do banco |
| `DB_SECRET_NAME` | — | Nao | Nome do secret no Secrets Manager |
| `DB_REGION` | — | Condicional | Regiao AWS (obrigatorio se usar Secrets Manager) |
| `IS_LOCAL` | — | Nao | `true` para usar credenciais de ambiente local |
| `DEBUG_SECRET` | — | Nao | `true` para logar informacoes de credenciais |
| `VERSAO_API` | `4.2.0` | Nao | Versao exibida em `/api/versao` |

### Frontend React (tempo de build)

| Variavel | Service principal | Service secundario (-dev) |
|---|---|---|
| `VITE_API_URL` | `https://imersao-aws-ia.bcv.dev.br` | `https://imersao-aws-ia-dev.bcv.dev.br` |

> Esta variavel e embutida em tempo de build pelo Vite. Nao pode ser alterada em runtime. Os dois services compartilham o mesmo cluster ECS e o mesmo banco RDS — a diferenca esta apenas nesta URL baked-in.

---

## Portas e Rede

| Camada | Porta | Protocolo | Destino |
|---|---|---|---|
| Express (container) | 8080 | TCP | Interno ao container |
| Docker Compose (server) | 3001 -> 8080 | TCP | Acesso local ao servidor |
| Docker Compose (database) | 5433 -> 5432 | TCP | Acesso local ao PostgreSQL |
| EC2 (Security Group bia-dev) | 3001 | TCP | `0.0.0.0/0` (acesso publico) |
| RDS | 5432 | TCP | Acesso pela aplicacao no ECS/EC2 |
| ALB | 80 / 443 | TCP | Acesso publico em producao |

---

## Recursos AWS

### ECR — Elastic Container Registry

| Campo | Valor |
|---|---|
| Repositorio | `658886689790.dkr.ecr.us-east-1.amazonaws.com/bia` |
| Regiao | `us-east-1` |
| Tags usadas | `latest` + hash do commit (7 caracteres) |

### ECS — Elastic Container Service

Existem dois modos de deploy (com e sem ALB) e dois services rodando no mesmo cluster.

**Modos de cluster:**

| Recurso | Sem ALB (padrao) | Com ALB |
|---|---|---|
| Cluster | `cluster-bia-app` | `cluster-bia-alb` |
| Service (principal) | `service-bia` | `service-bia-alb` |
| Task Definition (principal) | `task-def-bia` | `task-def-bia-alb` |

**Services que compartilham o mesmo cluster e o mesmo banco RDS:**

| Service | Task Definition | Dockerfile usado | URL do frontend |
|---|---|---|---|
| `service-bia-alb` | `task-def-bia-alb` | `Dockerfile` | `imersao-aws-ia.bcv.dev.br` |
| `service-bia-alb-dev` | `task-def-bia-alb-dev` | `Dockerfile.dev` | `imersao-aws-ia-dev.bcv.dev.br` |

> Os dois services apontam para o mesmo RDS. O sufixo `-dev` no nome do service e no dominio nao indica ambiente isolado — e apenas um segundo service com uma `VITE_API_URL` diferente embutida em tempo de build.

### RDS — Relational Database Service

| Campo | Valor |
|---|---|
| Endpoint | `bia.ckfawmc080wt.us-east-1.rds.amazonaws.com` |
| Porta | `5432` |
| Engine | PostgreSQL |
| Database | `bia` |
| SSL | Obrigatorio (rejectUnauthorized: false) |

### EC2 — Desenvolvimento

| Campo | Valor |
|---|---|
| Nome | `bia-dev` |
| AMI | `ami-02f3f602d23f1659d` |
| Tipo | `t3.micro` |
| Zona | `us-east-1a` |
| Storage | 15 GB gp2 |
| Security Group | `bia-dev` |
| IAM Instance Profile | `role-acesso-ssm` |
| VPC | Default VPC |

### IAM

| Recurso | Finalidade |
|---|---|
| `role-acesso-ssm` | Role da EC2 com acesso ao SSM (`AmazonSSMManagedInstanceCore`) |

### Secrets Manager (opcional)

Quando configurado, substitui `DB_USER` e `DB_PWD` por credenciais gerenciadas.

**Logica de ativacao:** se `DB_SECRET_NAME` estiver definido e nao vazio, o `config/database.js` busca as credenciais no Secrets Manager em vez de usar as variaveis de ambiente.

---

## API Routes

Base path: `/api`

| Metodo | Rota | Descricao | Usa banco? |
|---|---|---|---|
| `GET` | `/api/versao` | Retorna `Bia <versao>` | Nao |
| `GET` | `/api/tarefas` | Lista todas as tarefas | Sim |
| `POST` | `/api/tarefas` | Cria uma nova tarefa | Sim |
| `GET` | `/api/tarefas/:uuid` | Busca tarefa por UUID | Sim |
| `PUT` | `/api/tarefas/update_priority/:uuid` | Atualiza prioridade da tarefa | Sim |
| `DELETE` | `/api/tarefas/:uuid` | Remove uma tarefa | Sim |

Todas as demais rotas retornam o `index.html` do React (fallback para React Router).

---

## Fluxo de Build e Deploy

### 1. Build manual via script (EC2 ou local)

```bash
# Build simples (apenas build + push, sem deploy ECS)
./build.sh

# Build + deploy no ECS com ALB (usa commit atual)
./deploy-ecs.sh --alb

# Build + deploy no ECS sem ALB (usa commit atual)
./deploy-ecs.sh

# Rollback para uma tag especifica (sem novo build)
./deploy-ecs.sh --tag abc1234 --alb
./deploy-ecs.sh --tag abc1234

# Deploy rapido: build + force-new-deployment no cluster com ALB
./deploy.sh
```

**O que `deploy-ecs.sh` faz:**
1. Captura o hash curto do commit atual como tag
2. Autentica no ECR via `aws ecr get-login-password`
3. Executa `docker build`
4. Taggeia a imagem com `latest` e com o hash do commit
5. Faz push das duas tags para o ECR
6. Le a task definition atual via `aws ecs describe-task-definition`
7. Substitui a imagem do container pela nova tag
8. Registra nova revisao da task definition via `aws ecs register-task-definition`
9. Atualiza o service via `aws ecs update-service`

### 2. Build automatizado via CodeBuild

**Arquivo:** `buildspec.yml`

| Fase | Acoes |
|---|---|
| `pre_build` | Login no ECR; define `REPOSITORY_URI` e `IMAGE_TAG` (hash do commit) |
| `build` | `docker build -t $REPOSITORY_URI:latest .`; taggeia com o hash |
| `post_build` | Push das tags `latest` e commit; gera `imagedefinitions.json` |

**Artefato gerado:** `imagedefinitions.json`

```json
[{"name":"bia","imageUri":"658886689790.dkr.ecr.us-east-1.amazonaws.com/bia:<commit-hash>"}]
```

Este artefato e usado pelo pipeline ECS para atualizar o service automaticamente.

---

## Configuracao do Banco de Dados

**Arquivo:** `config/database.js`

**Logica de conexao:**

```
DB_HOST indefinido OU == "database" OU == "127.0.0.1" OU == "localhost"
    --> Conexao LOCAL (sem SSL)
Caso contrario:
    --> Conexao REMOTA (SSL obrigatorio, rejectUnauthorized: false)
```

**Logica de credenciais:**

```
DB_SECRET_NAME definido e nao vazio?
    SIM --> Busca credenciais no AWS Secrets Manager
            (usa fromEnv() se IS_LOCAL=true, usa role da instancia caso contrario)
    NAO --> Usa DB_USER e DB_PWD das variaveis de ambiente
```

**Porta padrao:** `config/default.json` define `server.port = 8080`.

**Migrations:** gerenciadas pelo Sequelize CLI.

```bash
# Arquivo de migracao existente:
database/migrations/20210924000838-criar-tarefas.js

# Executar migrations:
npx sequelize db:migrate
```

---

## Como Replicar a Infraestrutura do Zero

### Pre-requisitos

- AWS CLI configurado com permissoes adequadas
- Docker instalado
- Node.js 22 e npm 11
- `jq` instalado

### Passo 1 — Criar IAM Role para EC2

```bash
cd scripts/
./criar_role_ssm.sh
```

Cria a role `role-acesso-ssm` com a policy `AmazonSSMManagedInstanceCore`.

### Passo 2 — Criar Security Group

```bash
vpc_id=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true \
  --query "Vpcs[0].VpcId" --output text)

aws ec2 create-security-group \
  --group-name bia-dev \
  --description "Security group BIA dev" \
  --vpc-id $vpc_id

sg_id=$(aws ec2 describe-security-groups \
  --group-names bia-dev \
  --query "SecurityGroups[0].GroupId" --output text)

# Liberar porta 3001
aws ec2 authorize-security-group-ingress \
  --group-id $sg_id \
  --protocol tcp --port 3001 --cidr 0.0.0.0/0
```

### Passo 3 — Lancar EC2 de Desenvolvimento (opcional)

```bash
cd scripts/
./lancar_ec2_zona_a.sh
```

Instancia EC2 `t3.micro` na zona `us-east-1a` com o user-data que instala:
Docker, Docker Compose v2, Node.js, AWS CLI v2, jq, Python 3.11, uv.

**Validar recursos criados:**

```bash
./validar_recursos_zona_a.sh
```

### Passo 4 — Criar repositorio ECR

```bash
aws ecr create-repository \
  --repository-name bia \
  --region us-east-1
```

### Passo 5 — Criar banco RDS PostgreSQL

```bash
aws rds create-db-instance \
  --db-instance-identifier bia \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password <SENHA> \
  --db-name bia \
  --allocated-storage 20 \
  --region us-east-1
```

Anote o endpoint gerado e configure nas variaveis de ambiente.

### Passo 6 — Build e push da imagem para ECR

```bash
# Na raiz do projeto:
./build.sh
```

Ou manualmente:

```bash
ECR_REGISTRY="658886689790.dkr.ecr.us-east-1.amazonaws.com"
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin $ECR_REGISTRY
docker build -t bia .
docker tag bia:latest $ECR_REGISTRY/bia:latest
docker push $ECR_REGISTRY/bia:latest
```

### Passo 7 — Criar cluster e task definition ECS

Crie um cluster ECS (Fargate) com o nome `cluster-bia-app` ou `cluster-bia-alb`.

Crie a task definition `task-def-bia` (ou `task-def-bia-alb`) com:
- Container: `bia`
- Imagem: `658886689790.dkr.ecr.us-east-1.amazonaws.com/bia:latest`
- Porta: `8080`
- Variaveis de ambiente: `DB_USER`, `DB_PWD`, `DB_HOST`, `DB_PORT`

### Passo 8 — Deploy no ECS

```bash
# Com ALB:
./deploy-ecs.sh --alb

# Sem ALB:
./deploy-ecs.sh
```

### Passo 9 — Executar migrations no banco

Conecte-se ao container em execucao ou via EC2 e execute:

```bash
DB_HOST=<endpoint-rds> DB_USER=postgres DB_PWD=<senha> \
  npx sequelize db:migrate
```

### Validacao pos-deploy

```bash
# Checar versao da API (sem banco):
curl https://imersao-aws-ia.bcv.dev.br/api/versao

# Checar tarefas (com banco):
curl https://imersao-aws-ia.bcv.dev.br/api/tarefas
```

---

## Desenvolvimento Local

### Iniciar ambiente completo

```bash
# Unix:
./rodar_app_local_unix.sh
```

O script executa em ordem:
1. `docker compose up -d database` — sobe o PostgreSQL local na porta 5433
2. `npm install` — instala dependencias do backend
3. `npm run build --prefix client` — faz build do React
4. `npx sequelize db:migrate` — executa migrations no banco local
5. `npm start` — inicia o servidor na porta 8080

### Iniciar/parar EC2 de dev

```bash
# Ligar:
./scripts/ligar_bia_local.sh

# Desligar (economizar custos):
./scripts/parar_bia_local.sh
```

### Verificar disponibilidade via container

```bash
# Verificar URL do ALB:
./check-disponibilidade.sh

# Verificar URL customizada:
url="https://imersao-aws-ia.bcv.dev.br" \
  docker run --rm -ti \
  -e URL=$url \
  $(docker build -q -f Dockerfile_checkdisponibilidade .)
```

---

## Estrutura de Arquivos de Infraestrutura

```
bia/
├── Dockerfile                    # Imagem do service principal (VITE_API_URL imersao-aws-ia)
├── Dockerfile.dev                # Imagem do service secundario (VITE_API_URL imersao-aws-ia-dev) — mesmo cluster e BD
├── Dockerfile_checkdisponibilidade  # Container utilitario de monitoramento
├── compose.yml                   # Docker Compose para desenvolvimento local
├── buildspec.yml                 # Pipeline AWS CodeBuild
├── build.sh                      # Build + push para ECR (atalho)
├── deploy.sh                     # Build + force-new-deployment no ALB
├── deploy-ecs.sh                 # Deploy completo com suporte a rollback
├── check-disponibilidade.sh      # Teste de disponibilidade do ALB
├── rodar_app_local_unix.sh       # Inicializar ambiente local (Unix)
├── rodar_app_local_windows.bat   # Inicializar ambiente local (Windows)
├── config/
│   ├── database.js               # Configuracao Sequelize + logica Secrets Manager
│   ├── express.js                # Configuracao do Express (porta, rotas, CORS)
│   └── default.json              # Configuracoes padrao (porta 8080)
├── database/
│   └── migrations/
│       └── 20210924000838-criar-tarefas.js
├── .sequelizerc                  # Caminhos do Sequelize CLI
├── .dockerignore                 # Arquivos excluidos do build Docker
└── scripts/
    ├── criar_role_ssm.sh         # Cria IAM role para EC2
    ├── ec2_principal.json        # Trust policy da role EC2
    ├── lancar_ec2_zona_a.sh      # Lanca EC2 de dev na zona A
    ├── user_data_ec2_zona_a.sh   # User data: instala Docker, Node, AWS CLI
    ├── validar_recursos_zona_a.sh  # Valida recursos criados na zona A
    ├── ligar_bia_local.sh        # Liga instancia EC2 bia-dev
    ├── parar_bia_local.sh        # Para instancia EC2 bia-dev
    └── ecs/
        ├── unix/
        │   ├── build.sh          # Build + push (template com SEU_REGISTRY)
        │   ├── deploy.sh         # deploy.sh (template)
        │   ├── deploy-ecs.sh     # deploy-ecs.sh (copia do raiz)
        │   ├── check-disponibilidade.sh
        │   └── testar-latencia.sh  # Testa latencia e cache CloudFront
        └── windows/
            ├── build.bat
            ├── deploy.bat
            └── check-disponibilidade.bat
```

---

## Dominios e Endpoints

| Service | URL | Descricao |
|---|---|---|
| Principal (`service-bia-alb`) | `https://imersao-aws-ia.bcv.dev.br` | Service principal — mesmo cluster e mesmo RDS |
| Secundario (`service-bia-alb-dev`) | `https://imersao-aws-ia-dev.bcv.dev.br` | Segundo service no mesmo cluster — mesmo RDS, `VITE_API_URL` diferente |
| ALB direto | `http://bia-alb-2091615362.us-east-1.elb.amazonaws.com` | Acesso direto ao ALB (sem HTTPS) |
| Local (Docker Compose) | `http://localhost:3001` | Desenvolvimento local via compose.yml |

> O sufixo `-dev` no dominio `imersao-aws-ia-dev.bcv.dev.br` nao representa um ambiente de testes separado. E um segundo service ECS no mesmo cluster, conectado ao mesmo banco de dados RDS, com uma `VITE_API_URL` diferente embutida na imagem Docker no momento do build.

---

## Observacoes de Seguranca

1. **Credenciais no compose.yml:** A senha do RDS esta em texto plano no `compose.yml`. Use variaveis de ambiente ou AWS Secrets Manager em ambientes sensiveis.
2. **SSL no RDS:** A conexao remota usa SSL com `rejectUnauthorized: false`. Para maior seguranca, configure o certificado CA correto.
3. **Security Group:** A porta 3001 esta aberta para `0.0.0.0/0` no ambiente de dev. Restrinja ao necessario em producao.
4. **Session Secret:** O `index.js` (legado) usa `"some secret here"` como session secret. O servidor principal (`server.js`) usa `config/express.js` que nao configura session, mas revise se necessario.
5. **IAM Role via Instance Profile:** Em producao no ECS, as credenciais AWS sao obtidas automaticamente via task role — nao e necessario configurar `AWS_ACCESS_KEY_ID` ou `AWS_SECRET_ACCESS_KEY`.
