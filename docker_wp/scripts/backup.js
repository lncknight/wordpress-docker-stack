let CronJob = require('cron').CronJob;
let { exec } = require('child_process')
let { promisify } = require('util')
let execSync = promisify(exec)
let { chain, trim } = require('lodash')
let _ = require('lodash')
let moment = require('moment')
let bb = require('bluebird')
let dotenv = require('dotenv')
let path = require('path')
let AWS = require('aws-sdk')
let fs = require('fs')

// TODO add options
// const argv = require("yargs")
//   .option('account', {
//     alias: ['a'],
//     description: 'AWS Account',
//     type: 'string',
//     default: 'aaaa'
//   })
//   .option('cost', {
//     description: 'get cost',
//     type: 'boolean',
//     default: false
//   })
//   .argv



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

  BACKUP_S3_WP_UPLOADS_PREFIX,

  BACKUP_S3_WP_DATA_PREFIX,
  BACKUP_S3_BUCKET,
  BACKUP_DISABLE,
  BACKUP_WP_EXCLUDE_FOLDERS,

  BACKUP_WP_CRON = '15 9 * * *',

  PROJECT_ROOT = '/var/www/html',
  // AWS_BIN = '/opt/homebrew/bin/aws',

} = process.env

// init aws and config with access key and secret key
AWS.config.update({
  accessKeyId: BACKUP_AWS_ACCESS_KEY_ID,
  secretAccessKey: BACKUP_AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
})
let s3 = new AWS.S3()

console.log({
  BACKUP_DISABLE,
  BACKUP_S3_WP_DATA_PREFIX,
})

// wp data
let backupWpData = async () => {

  if (BACKUP_DISABLE === "1"){
    console.log('backup disabled', {BACKUP_DISABLE})
    return 
  }

  if (!BACKUP_S3_WP_DATA_PREFIX){
    console.log('backup disabled', {BACKUP_S3_WP_DATA_PREFIX})
    return
  }

  console.log(`starting backup /data`)

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
  commandParts.push(`${PROJECT_ROOT}/ ${backupDir}`)
  let command = commandParts.join(' ')
  console.log('copying..', { command })
  await execSync(command)
  // await execSync(`rsync -rhp --exclude="wp-content" ${PROJECT_ROOT}/ ${backupDir}`)

  console.log('zipping..')
  await execSync(`tar -zcf ${zipPath} ${backupDir}`)

  console.log('uploading..')
  // await execSync(`${AWS_BIN} s3 cp ${zipPath} ${s3Url}`)
  let rs = await s3.putObject({
    Bucket: BACKUP_S3_BUCKET,
    Key: `${BACKUP_S3_WP_DATA_PREFIX}/${folder}.tar.gz`,
    Body: fs.readFileSync(zipPath),
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

  console.log(`starting backup /uploads`)

  let folder = `${moment().format('YMMDD_HHmmss')}-uploads`
  let backupDir = `/tmp/${folder}`
  let zipPath = `/tmp/${folder}.tar.gz`
  let s3Url = `s3://${BACKUP_S3_BUCKET}/${BACKUP_S3_WP_UPLOADS_PREFIX}/${folder}.tar.gz`


  let commandParts = []
  commandParts.push(`rsync -rhp`)
  // --exclude="wp-content/updraft"  
  commandParts.push(`${PROJECT_ROOT}/wp-content/uploads/ ${backupDir}`)
  let command = commandParts.join(' ')
  console.log('copying..', { command })
  await execSync(command)
  // await execSync(`rsync -rhp --exclude="wp-content" ${PROJECT_ROOT}/ ${backupDir}`)

  console.log('zipping..')
  await execSync(`tar -zcf ${zipPath} ${backupDir}`)

  console.log('uploading..')
  // await execSync(`${AWS_BIN} s3 cp ${zipPath} ${s3Url}`)
  let rs = await s3.putObject({
    Bucket: BACKUP_S3_BUCKET,
    Key: `${BACKUP_S3_WP_UPLOADS_PREFIX}/${folder}.tar.gz`,
    Body: fs.readFileSync(zipPath),
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

let backup = async () => {
  await backupWpData()
  await backupWpUploads()
}

let main = async () => {
  // enable args to trigger backup & backupWpUploads directly
  // e.g. node backup.js backup
  // e.g. node backup.js backupWpUploads
  let args = process.argv.slice(2)
  // console.log({args})
  if (args.length > 0){
    let func = args[0]
    if (func === 'data'){
      console.log('backup-ing data...')
      await backupWpData()
    }
    else if (func === 'uploads'){
      console.log('backup-in uploads...')
      await backupWpUploads()
    }
    else {
      console.log('invalid func', {func})
    }
  }
  // if no args, run cron
  else if (args.length === 0){
    console.log('starting cron..', {BACKUP_WP_CRON})
    // live
    new CronJob(BACKUP_WP_CRON, backup, null, true, 'Asia/Hong_Kong');
  }
}
main()