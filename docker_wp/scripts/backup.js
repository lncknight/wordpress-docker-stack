let CronJob = require('cron').CronJob;
let  { exec } = require('child_process')
let  { promisify } = require('util')
let execSync = promisify(exec)
let _ = require('lodash')
let moment = require('moment')
let bb = require('bluebird')
let {
  BACKUP_S3_WP_DATA_PREFIX,
  BACKUP_S3_BUCKET,
  BACKUP_DISABLE,
} = process.env

let backup = async () => {

  if (BACKUP_DISABLE){
    return 
  }

  let folder = moment().format('YMMDD_HHmmss')
  let backupDir = `/tmp/${folder}`
  let zipPath = `/tmp/${folder}.tar.gz`
  let s3Url = `s3://${BACKUP_S3_BUCKET}/${BACKUP_S3_WP_DATA_PREFIX}/${folder}.tar.gz`


  console.log('copying..')
  await execSync(`rsync -rhp --exclude="wp-content/updraft" --exclude="wp-content/uploads" /var/www/html/ ${backupDir}`)
  // await execSync(`rsync -rhp --exclude="wp-content" /var/www/html/ ${backupDir}`)

  console.log('zipping..')
  await execSync(`tar -zcf ${zipPath} ${backupDir}`)
  
  console.log('uploading..')
  await execSync(`/usr/local/bin/aws s3 cp ${zipPath} ${s3Url}`)

  console.log('cleaning up..')
  await bb.all([
    execSync(`rm -rf ${backupDir}`),
    execSync(`rm -rf ${zipPath}`),
  ])

  console.log('DONE')

  console.log({
    folder,
    backupDir,
    zipPath,
    s3Url
  })
}

// backup() // test now
// new CronJob('*/45 * * * * *', backup, null, true, 'Asia/Hong_Kong'); // test run

// live
new CronJob('0 13 * * *', backup, null, true, 'Asia/Hong_Kong');
