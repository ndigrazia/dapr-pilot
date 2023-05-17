# dapr-pilot


## start microK8s

microk8s start

## install dapr using helm
helm repo add dapr https://dapr.github.io/helm-charts/
helm repo update
microk8s kubectl create namespace dapr-system
helm install dapr dapr/dapr --namespace dapr-system


## search charts
helm search repo dapr --devel --versions


## install redis

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install redis bitnami/redis --namespace redis
NAME: redis
LAST DEPLOYED: Mon May 15 13:46:12 2023
NAMESPACE: redis
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: redis
CHART VERSION: 17.10.3
APP VERSION: 7.0.11

** Please be patient while the chart is being deployed **

Redis&reg; can be accessed on the following DNS names from within your cluster:

    redis-master.redis.svc.cluster.local for read/write operations (port 6379)
    redis-replicas.redis.svc.cluster.local for read-only operations (port 6379)

To get your password run:

    export REDIS_PASSWORD=$(kbuectl get secret --namespace redis redis -o jsonpath="{.data.redis-password}" | base64 -d)

To connect to your Redis&reg; server:

1. Run a Redis&reg; pod that you can use as a client:

   kubectl run --namespace redis redis-client --restart='Never'  --env REDIS_PASSWORD=$REDIS_PASSWORD  --image docker.io/bitnami/redis:7.0.11-debian-11-r7 --command -- sleep infinity

   Use the following command to attach to the pod:

   kubectl exec --tty -i redis-client \
   --namespace redis -- bash

2. Connect using the Redis&reg; CLI:
   REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h redis-master
   REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h redis-replicas

To connect to your database from outside the cluster execute the following commands:

    kubectl port-forward --namespace redis svc/redis-master 6379:6379 &
    REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h 127.0.0.1 -p 6379
    

## check Dapr install

kubectl get pods --namespace dapr-system


## apply dapr component
 
microk8s kubectl apply -f ../dapr/kubernetes/redis-state.yaml -n default


## dapr dashboard on k8s
dapr dashboard -k


## dapr run local

dapr run --app-id people-processor --resources-path ../dapr/self-hosted/resources/redis/ --app-port 3000 --app-protocol http --dapr-http-port 3501 -- npm run start

dapr run --app-port 3000 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- npm start

dapr run --app-id order-processor --dapr-http-port 3501


## Building your image
cd people
docker build . -t dapr-pilot/node-people-server


## Run the image
cd people
docker compose up

## Stop the image

docker compose down

## Go inside the container

docker exec -it <container id> /bin/bash
