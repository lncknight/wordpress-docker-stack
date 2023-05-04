// WIP
// restore from backup
// list backups from s3
// download one set of backup from s3
// unzip
// restore to /var/www/html and database

let CronJob = require('cron').CronJob;
let { exec } = require('child_process')
let { promisify } = require('util')
let execSync = promisify(exec)
let { chain, trim } = require('lodash')
let _ = require('lodash')
let moment = require('moment')
let bb = require('bluebird')

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

const AWS_BIN = '/opt/homebrew/bin/aws' // TODO
// const AWS_BIN = '/usr/local/bin/aws' // TODO
const AWS_PROFILE = 'gns-wp'

let {
  // BACKUP_S3_WP_UPLOADS_PREFIX,
  BACKUP_S3_WP_UPLOADS_PREFIX = 'backup2/gns_wp_my_dev-uploads',

  // BACKUP_S3_WP_DATA_PREFIX,
  BACKUP_S3_WP_DATA_PREFIX = 'backup2/gns_wp_my_dev-data',
  
  // BACKUP_S3_BUCKET,
  BACKUP_S3_BUCKET = 'lncknight.gns',

  BACKUP_DISABLE,
  BACKUP_WP_EXCLUDE_FOLDERS,

} = process.env

let restore = async () => {
  // get version argv from 2nd param of command line
  let version = process.argv[2]
  if (!version){
    console.log('version is required')
    return
  }

  let AWS = require('aws-sdk')
  // use aws profile
  AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: AWS_PROFILE})
  let s3 = new AWS.S3()
  let rs = await s3.listObjectsV2({
    Bucket: BACKUP_S3_BUCKET,
    Prefix: `${BACKUP_S3_WP_DATA_PREFIX}/${version}`
  }).promise()
  // console.log(rs)

  // if no objects found or more than 1 object found, 
  // list all objects and prompt user to retry
  if (_.size(rs.Contents) !== 1){
    console.log('no objects found or more than 1 object found, EXIT')
    console.log(_.map(rs.Contents, 'Key'))
    return
  }

  // download to /tmp
  rs = await s3.getObject({
    Bucket: BACKUP_S3_BUCKET,
    Key: _.get(rs, 'Contents[0].Key')
  }).promise()
  // save it to /tmp
  let fs = require('fs')
  fs.writeFileSync(`/tmp/${version}.tar.gz`, rs.Body)
  // unzip
  await execSync(`tar -xzf /tmp/${version}.tar.gz -C /tmp/${version}`)
  // show files
  await execSync(`ls -al /tmp/${version}`)

  // replace current data folder use rsync
  await execSync(`rsync -rhp /tmp/${version}/ /var/www/html/`)

  // done
  console.log('done')

}

restore()