let CronJob = require('cron').CronJob;
let { exec } = require('child_process')
let { promisify } = require('util')
let execSync = promisify(exec)
let { chain, trim } = require('lodash')
let moment = require('moment')
let bb = require('bluebird')
let {
  BACKUP_S3_WP_UPLOADS_PREFIX,

  BACKUP_S3_WP_DATA_PREFIX,
  BACKUP_S3_BUCKET,
  BACKUP_DISABLE,
  BACKUP_WP_EXCLUDE_FOLDERS,

  TEST_RUN_CRON,
} = process.env

// wp data
let backup = async () => {

  if (BACKUP_DISABLE === "1"){
    return 
  }

  if (!BACKUP_S3_WP_DATA_PREFIX){
    return
  }

  let folder = `${moment().format('YMMDD_HHmmss')}-data`
  let backupDir = `/tmp/${folder}`
  let zipPath = `/tmp/${folder}.tar.gz`
  let s3Url = `s3://${BACKUP_S3_BUCKET}/${BACKUP_S3_WP_DATA_PREFIX}/${folder}.tar.gz`


  let commandParts = []
  commandParts.push(`rsync -rhp`)
  chain(BACKUP_WP_EXCLUDE_FOLDERS)
    .split(',')
    .map(r => {
      commandParts.push(`--exclude="${trim(r)}"`)
    })
    .value()
  // --exclude="wp-content/updraft"  
  commandParts.push(`/var/www/html/ ${backupDir}`)
  let command = commandParts.join(' ')
  console.log('copying..', { command })
  await execSync(command)
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

// wp-content/uploads 
let backupWpUploads = async () => {

  if (BACKUP_DISABLE === "1"){
    console.log('backup disabled', {BACKUP_DISABLE})
    return 
  }

  if (!BACKUP_S3_WP_UPLOADS_PREFIX){
    console.log('backup disabled', {BACKUP_S3_WP_UPLOADS_PREFIX})
    return
  }

  let folder = `${moment().format('YMMDD_HHmmss')}-uploads`
  let backupDir = `/tmp/${folder}`
  let zipPath = `/tmp/${folder}.tar.gz`
  let s3Url = `s3://${BACKUP_S3_BUCKET}/${BACKUP_S3_WP_UPLOADS_PREFIX}/${folder}.tar.gz`


  let commandParts = []
  commandParts.push(`rsync -rhp`)
  // --exclude="wp-content/updraft"  
  commandParts.push(`/var/www/html/wp-content/uploads/ ${backupDir}`)
  let command = commandParts.join(' ')
  console.log('copying..', { command })
  await execSync(command)
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
let testCronSchedule = '*/10 * * * * *'
if (TEST_RUN_CRON === '0'){
  testCronSchedule = null
}
else if (TEST_RUN_CRON !== '1'){
  testCronSchedule = TEST_RUN_CRON
}
if (!!testCronSchedule){
  console.log('test mode', {testCronSchedule})
  new CronJob(testCronSchedule, backup, null, true, 'Asia/Hong_Kong'); // test run
  new CronJob(testCronSchedule, backupWpUploads, null, true, 'Asia/Hong_Kong'); // test run
}

// live
new CronJob('0 5 * * *', backup, null, true, 'Asia/Hong_Kong');
new CronJob('0 10 * * *', backupWpUploads, null, true, 'Asia/Hong_Kong');
