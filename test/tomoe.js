let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomoe || {}).uri
let BigNumber = require('bignumber.js')
let Stats = require('../stats/tomobridge')
let TomoJS = require('tomojs')
let moment = require('moment')

chai.use(chaiHttp)
describe('TOMOE', () => {
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

    describe('/GET TOMOE to TOMO txs', () => {
        let url = urljoin(uri, 'api/transactions/getSwapTxs?type=withdraw')
        it(`GET ${url}`, (done) => {
            let query = {
                limit: 8,
                page: 1
            }
            chai.request(url)
                .get('/')
                .query(query)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let txs = res.body.Data
                    Stats.push({
                        table: 'txburntomoe',
                        name: 'TOMOE',
                        address: 'TOMOE',
                        value: res.body.Total
                    })
                    txs.forEach(tx => {
                        let inTx = tx.InTx
                        let outTx = tx.OutTx
                        let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                        if (delay > 1500) {
                            expect(new BigNumber(inTx.Amount).dividedBy(10 ** 18).toFixed(8)).to.equal(new BigNumber(outTx.Amount).dividedBy(10 ** 18).toFixed(8), `Stuck ${new BigNumber(inTx.Amount).dividedBy(Math.pow(10, 18)).toString(10)} TOMOE to TOMO ${inTx.Hash} delay ${delay}`)
                        }
                    })
                    done()
                })
        })
    })

    describe('/GET TOMO to TOMOE txs', () => {
        let url = urljoin(uri, 'api/transactions/getSwapTxs?type=deposit')
        it(`GET ${url}`, (done) => {
            let query = {
                limit: 10,
                page: 1
            }
            chai.request(url)
                .get('/')
                .query(query)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let txs = res.body.Data
                    Stats.push({
                        table: 'txminttomoe',
                        name: 'TOMOE',
                        address: 'TOMOE',
                        value: res.body.Total
                    })
                    txs.forEach(tx => {
                        let inTx = tx.InTx
                        let outTx = tx.OutTx
                        let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                        if (delay > 1500) {
                            expect(new BigNumber(inTx.Amount).dividedBy(10 ** 18).toFixed(8)).to.equal(new BigNumber(outTx.Amount).dividedBy(10 ** 18).toFixed(8),`Stuck ${new BigNumber(inTx.Amount).dividedBy(Math.pow(10, 18)).toString(10)} TOMO to TOMOE ${inTx.Hash} delay ${delay} seconds`)
                        }
                    })
                    done()
                })
        })
    })

    describe('/GET eth unlock wallet 02 balance', () => {
        let address = config.tomoe.ethUnlockWallet02
        let apiKey = process.env.ETHERSCAN_APIKEY || config.etherscanApiKey
        let url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
        it(`GET ${url}`, (done) => {
            if (!address) {
                return done()
            }
            chai.request(url)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let balance = parseFloat((new BigNumber(res.body.result)).dividedBy(1e18).toString(10))
                    expect(balance).to.above(1, `Not enough balance for ethUnlockWallet02 ${address}`)
                    return Stats.push({
                        table: 'ethUnlockWallet02',
                        name: 'ETH',
                        address: address,
                        value: balance
                    }).then(() => done()).catch(() => done())
                })
        })
    })

    describe('/GET eth unlock wallet 01 balance', () => {
        let address = config.tomoe.ethUnlockWallet01
        let apiKey = process.env.ETHERSCAN_APIKEY || config.etherscanApiKey
        let url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
        it(`GET ${url}`, (done) => {
            if (!address) {
                return done()
            }
            chai.request(url)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let balance = parseFloat((new BigNumber(res.body.result)).dividedBy(1e18).toString(10))
                    expect(balance).to.above(1, `Not enough balance for ethUnlockWallet01 ${address}`)
                    return Stats.push({
                        table: 'ethUnlockWallet01',
                        name: 'ETH',
                        address: address,
                        value: balance
                    }).then(() => done()).catch(() => done())
                })
        })
    })

    /*
    describe('/GET erc20 locked balance', () => {
        let erc20Tokens = config.tomobridge.erc20.tokens
        let apiKey = process.env.ETHERSCAN_APIKEY || config.etherscanApiKey
        erc20Tokens.forEach((t) => {
            it(`${t.symbol} ${t.erc20Address} locked balance`, (done) => {
                let url = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${t.erc20Address}&address=${config.tomobridge.erc20.lockedAddress}&tag=latest&apikey=${apiKey}`
                chai.request(url)
                    .get('/')
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        let balance = parseFloat((new BigNumber(res.body.result)).dividedBy(Math.pow(10, t.decimals)).toString(10))
                        Stats.push({
                            table: 'coins',
                            name: t.symbol,
                            address: t.trc21Address,
                            value: balance
                        })
                        done()
                    })
            })
        })
    })

    describe('/GET erc20 total supply', () => {
        let erc20Tokens = config.tomobridge.erc20.tokens
        let tomojs = new TomoJS('https://rpc.tomochain.com')
        erc20Tokens.forEach((t) => {
            it(`${t.symbol} ${t.trc21Address} total supply`, (done) => {
                tomojs.tomoz.getTokenInformation(t.trc21Address).then(data => {
                    let totalSupply = data.totalSupply
                    Stats.push({
                        table: 'trc21tokens',
                        name: t.symbol,
                        address: t.trc21Address,
                        value: totalSupply
                    })
                })
                done()
            })
        })
    })
    */
})
