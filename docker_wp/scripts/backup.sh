#!/usr/bin/env sh

export FOLDER=$(date +"%Y%m%d_%s")
export BACKUP_DIR="/tmp/$FOLDER/"
export ZIP="/tmp/${FOLDER}.tar.gz"
export S3_URL="s3://${BACKUP_S3_BUCKET}/${BACKUP_S3_WP_DATA_PREFIX}/${FOLDER}.tar.gz"

# TODO update exclude folders
printenv >> /tmp/debug.log
echo "$S3_URL" >> /tmp/debug.log
echo "rsync -razhp --exclude="wp-content" /var/www/html/ $BACKUP_DIR" >> /tmp/debug.log
# rsync -razhp --exclude="wp-content/uploads" \
#  --exclude="wp-content/updraft" \
#  /var/www/html/ $BACKUP_DIR
rsync -razhp --exclude="wp-content" /var/www/html/ $BACKUP_DIR

# /usr/bin/mysqldump -uroot -pxxxxxxxx -hmysql video > /tmp/$FOLDER/db.sql
# /usr/bin/mysqldump -u$DB_USER -p$DB_PASSWD -h$DB_HOST $DB_NAME > /tmp/$FOLDER/db.sql
# TODO remove DEBUG
# echo /tmp/$FOLDER/db.sql >> /tmp/debug.log
# echo "/usr/bin/mysqldump -u$DB_USER -p$DB_PASSWD -h$DB_HOST $DB_NAME" >> /tmp/debug.log
# echo $(whoami) >> /tmp/debug.log
# echo $(file /tmp/$FOLDER/db.sql) >> /tmp/debug.log
# echo $(wc -l /tmp/$FOLDER/db.sql) >> /tmp/debug.log

echo "----------- copy DONE -----------" >> /tmp/debug.log


tar -zcf $ZIP $BACKUP_DIR
echo "----------- zip DONE -----------" >> /tmp/debug.log

echo "--------- uploading to ${S3_URL} -------------" >> /tmp/debug.log
/usr/local/bin/aws s3 cp $ZIP $S3_URL
# aws s3 cp $ZIP $S3_URL
echo "----------- upload DONE -----------" >> /tmp/debug.log

echo "----------- cleaning up -----------" >> /tmp/debug.log
rm -rf $BACKUP_DIR
rm -rf $ZIP
