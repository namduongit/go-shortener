# Run Postgres on Docker
docker run

# Run Redis on Docker
docker run \
--name redis-container \
--hostname redis \
-v /home/namduongit/Others/Volumes/redis:/data \
-p 6379:6379 \
redis

# Run MinIO on Docker
docker run \
--name minio-container \
--hostname minio \
-v /home/namduongit/Others/Volumes/minio:/data \
-p 9000:9000 \
-p 9001:9001 \
minio/minio server /data --console-address ":9001"
