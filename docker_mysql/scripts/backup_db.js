let CronJob = require('cron').CronJob;
let  { exec } = require('child_process')
let  { promisify } = require('util')
let execSync = promisify(exec)
let _ = require('lodash')
let moment = require('moment')
let bb = require('bluebird')
let {
  BACKUP_S3_PREFIX,
  BACKUP_S3_BUCKET,
  BACKUP_DISABLE,

  DB_USER,
  DB_NAME,
  DB_HOST,
  DB_PASSWD,

  DB_USE_EXTERNAL,

  TEST_RUN_CRON,
} = process.env

let turnOffDb = async () => {
  if (DB_USE_EXTERNAL === '0'){
    return 
  }

  try {
    // TODO minor stop supervisord, and turn off restart:always
    // https://stackoverflow.com/questions/14479894/stopping-supervisord-shut-down
    await execSync('supervisorctl stop mysql')
    console.log('stopped local database')
  }
  catch (err){
    console.log('error on stopping database', {
      err
    })
  }
}

let backup = async () => {

  if (BACKUP_DISABLE === "1"){
    console.log('backup disabled, skip')
    return 
  }

  if (!BACKUP_S3_PREFIX){
    console.log('no backup setting, skip')
    return 
  }
  
  let folder = moment().format('YMMDD_HHmmss')
  let backupDir = `/tmp/${folder}`
  let zipPath = `/tmp/${folder}.tar.gz`
  let s3Url = `s3://${BACKUP_S3_BUCKET}/${BACKUP_S3_PREFIX}/${folder}.tar.gz`

  await execSync(`mkdir /tmp/${folder}/`)

  console.log('exporting..')
  // await execSync(`rsync -rhp --exclude="wp-content/updraft" --exclude="wp-content/uploads" /var/www/html/ ${backupDir}`)
  await execSync(`/usr/bin/mysqldump -u${DB_USER} -p${DB_PASSWD} -h${DB_HOST} --column-statistics=0 ${DB_NAME} > /tmp/${folder}/db.sql`)

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

console.log('node-cron started', {
  env: process.env
})

// backup() // test now
let testCronSchedule = '*/45 * * * * *'
if (TEST_RUN_CRON === '0'){
  testCronSchedule = null
}
else if (TEST_RUN_CRON !== '1'){
  testCronSchedule = TEST_RUN_CRON
}

if (testCronSchedule){
  console.log('cron in test mode')
  new CronJob(testCronSchedule, backup, null, true, 'Asia/Hong_Kong'); // test run
}


// live
new CronJob('5 9 * * *', backup, null, true, 'Asia/Hong_Kong');
new CronJob('* * * * *', turnOffDb, null, true, 'Asia/Hong_Kong');
