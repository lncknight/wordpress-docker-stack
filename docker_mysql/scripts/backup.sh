#!/usr/bin/env sh

export FOLDER=$(date +"%Y%m%d_%s")
export BACKUP_DIR="/tmp/${FOLDER}"
export ZIP="/tmp/${FOLDER}.tar.gz"


mkdir /tmp/$FOLDER/
# /usr/bin/mysqldump -uroot -pxxxxxxxx -hmysql video > /tmp/$FOLDER/db.sql
/usr/bin/mysqldump -u$DB_USER -p$DB_PASSWD -h$DB_HOST $DB_NAME > /tmp/$FOLDER/db.sql
# TODO remove DEBUG
echo /tmp/$FOLDER/db.sql >> /tmp/debug.log
echo "/usr/bin/mysqldump -u$DB_USER -p$DB_PASSWD -h$DB_HOST $DB_NAME" >> /tmp/debug.log
echo $(whoami) >> /tmp/debug.log
echo $(file /tmp/$FOLDER/db.sql) >> /tmp/debug.log
echo $(wc -l /tmp/$FOLDER/db.sql) >> /tmp/debug.log

echo "----------- dump DONE -----------"

tar -zcf $ZIP $BACKUP_DIR
echo "----------- zip DONE -----------"

export S3_MONGO_FOLDER=video-db_dump
export S3_URL="s3://${BACKUP_S3_BUCKET}/${BACKUP_S3_PREFIX}/${FOLDER}.tar.gz"
echo "--------- uploading to ${S3_URL} -------------"
/usr/local/bin/aws s3 cp $ZIP $S3_URL
# aws s3 cp $ZIP $S3_URL
echo "----------- upload DONE -----------"

echo "----------- cleaning up -----------"
rm -rf $BACKUP_DIR
rm -rf $ZIP
