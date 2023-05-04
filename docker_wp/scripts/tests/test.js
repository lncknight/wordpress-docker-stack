// WIP
let assert = require('assert')

let db

// wait for database connection before starting tests
before(async function() {
  db = await collections.dbReady()
  this.message = {
    phoneNumber: '611112222',
    phoneCountryCode: '852',
  }
})


after(async function() {
  // mongoDB disconnect
  let client = collections.getCurrentDbClient()
  client && await client.close()
})


describe('WA stickyness', async () => {
    
  after(async function() {
    console.table(this.lastResult)
  })

  it('test calculateStickynessByPhoneNumberUsingRedis', async function () {
    // set timeout logner
    this.timeout(30 * 1000)

    let tStart = Date.now()

    let stickyPhones = await calculateStickynessByPhoneNumberUsingRedis(this.message, this.devices)
    // console.log(stickyPhones)

    // result should be array type
    assert.ok(Array.isArray(stickyPhones))
    // array is not empty
    assert.ok(stickyPhones.length > 0)    
    // assert process time is less than 1 seconds
    assert.ok(Date.now() - tStart < 10000)
 
    this.lastResult = stickyPhones
  });
});