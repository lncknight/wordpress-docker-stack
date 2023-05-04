let CronJob = require('cron').CronJob;
let  { exec } = require('child_process')
let  { promisify } = require('util')
let execSync = promisify(exec)
let _ = require('lodash')
let moment = require('moment')
let bb = require('bluebird')
let dotenv = require('dotenv')
let path = require('path')
let AWS = require('aws-sdk')
let fs = require('fs')


let isTesting = !!_.get(process, 'env.LOCAL')
if (isTesting){
  let envPath = path.resolve(__dirname + '/../../.env')
  console.log('local testing', { envPath })
  dotenv.config({
    path: envPath,
    debug: true
  })
}

let {
  AWS_REGION='ap-southeast-1',
  BACKUP_AWS_ACCESS_KEY_ID,
  BACKUP_AWS_SECRET_ACCESS_KEY,

  BACKUP_S3_PREFIX,
  BACKUP_S3_BUCKET,
  BACKUP_DISABLE,

  DB_USER,
  DB_NAME,
  DB_HOST,
  DB_PASSWD,

  DB_USE_EXTERNAL,

  MYSQL_VERSION_TAG,

  BACKUP_DB_CRON = '15 9 * * *',

  PROJECT_ROOT = '/var/www/html',
  // AWS_BIN = '/opt/homebrew/bin/aws',
  MYSQLDUMP_BIN = '/usr/bin/mysqldump',

} = process.env

// init aws and config with access key and secret key
AWS.config.update({
  accessKeyId: BACKUP_AWS_ACCESS_KEY_ID,
  secretAccessKey: BACKUP_AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
})
let s3 = new AWS.S3()

console.log({
  DB_USE_EXTERNAL,
  BACKUP_S3_PREFIX,
})

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

// TODO should backup no matter use external
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
  let mysqlOpts = MYSQL_VERSION_TAG >= 80 ? `--column-statistics=0` : ''
  await execSync(`${MYSQLDUMP_BIN} -u${DB_USER} -p${DB_PASSWD} -h${DB_HOST} ${mysqlOpts} ${DB_NAME} > /tmp/${folder}/db.sql`)

  console.log('zipping..')
  await execSync(`tar -zcf ${zipPath} ${backupDir}`)
  
  console.log('uploading..')
  // await execSync(`${AWS_BIN} s3 cp ${zipPath} ${s3Url}`)
  let rs = await s3.putObject({
    Bucket: BACKUP_S3_BUCKET,
    Key: `${BACKUP_S3_PREFIX}/${folder}.tar.gz`,
    Body: fs.createReadStream(zipPath),
  }).promise()

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

let main = async () => {
  let args = process.argv.slice(2)
  if (args[0] === 'db'){
    await backup()
  }
  else {
    console.log('starting cron job..')
    // live
    new CronJob(BACKUP_DB_CRON, backup, null, true, 'Asia/Hong_Kong');

    setTimeout(async () => {
      await turnOffDb()
    }, 5000);
  }
}
main()