let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomobridge || {}).uri
let BigNumber = require('bignumber.js')

chai.use(chaiHttp)
describe('TomoBridge', () => {
    if (!uri) {
        return
    }

    describe('/GET site', () => {
        it('it should GET site', (done) => {
            let url = uri
            chai.request(url)
                .get('/')
                .end((err, res) => {
                    if (res.status !== 401) {
                        res.should.have.status(200)
                        res.should.be.html
                    }
                    done()
                })
        })
    })

    describe('/GET eth fee balance', () => {
        it('it should have enough balance for the tx fee', (done) => {
            let address = config.tomobridge.usdtFeeWallet
            if (!address) {
                return done()
            }
            let apiKey = process.env.ETHERSCAN_APIKEY || config.etherscanApiKey
            let url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
            chai.request(url)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let balance = parseFloat((new BigNumber(res.body.result)).dividedBy(1e18).toString(10))
                    console.log(`address=${address} balance=${balance}`)
                    expect(balance).to.above(0.05, 'Not enough balance for wallet fee')
                    done()
                })
        })
    })
})
