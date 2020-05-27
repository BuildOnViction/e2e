let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomobridge || {}).uri
let BigNumber = require('bignumber.js')
let TomoJS = require('tomojs')
let moment = require('moment')

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

    describe('/GET deposit txs', () => {
        it('it should GET the deposit txs', (done) => {
            let url = urljoin(uri, 'api/transactions/getWrapTxs')
            let map = []
            map.push(new Promise((resolve, reject) =>  {
                let query = {
                    coin: 'btc',
                    limit: 10,
                    page: 1
                }
                return chai.request(url)
                    .get('/')
                    .query(query)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        let txs = res.body.Data
                        txs.forEach(tx => {
                            let inTx = tx.InTx
                            let outTx = tx.OutTx
                            if (moment().diff(tx.CreatedAt, 'seconds') > 3000) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck BTC deposit ${inTx.Hash}`)
                            }
                        })
                        resolve()
                    })
            }))

            map.push(new Promise((resolve, reject) =>  {
                let query = {
                    coin: 'eth',
                    limit: 10,
                    page: 1
                }
                return chai.request(url)
                    .get('/')
                    .query(query)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        let txs = res.body.Data
                        txs.forEach(tx => {
                            let inTx = tx.InTx
                            let outTx = tx.OutTx
                            if (moment().diff(tx.CreatedAt, 'seconds') > 1000) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ETH deposit ${inTx.Hash}`)
                            }
                        })
                        resolve()
                    })
            }))

            map.push(new Promise((resolve, reject) =>  {
                let query = {
                    coin: 'usdt',
                    limit: 8,
                    page: 1
                }
                return chai.request(url)
                    .get('/')
                    .query(query)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        let txs = res.body.Data
                        txs.forEach(tx => {
                            let inTx = tx.InTx
                            let outTx = tx.OutTx
                            if (moment().diff(tx.CreatedAt, 'seconds') > 1000) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck USDT deposit ${inTx.Hash}`)
                            }
                        })
                        resolve()
                    })
            }))

            Promise.all(map).then(() => done()).catch(() => done())
        })
    })

    describe('/GET withdraw txs', () => {
        it('it should GET the withdraw txs', (done) => {
            let url = urljoin(uri, 'api/transactions/getUnwrapTxs')
            let map = []
            map.push(new Promise((resolve, reject) =>  {
                let query = {
                    coin: 'btc',
                    limit: 2,
                    page: 1
                }
                return chai.request(url)
                    .get('/')
                    .query(query)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        let txs = res.body.Data
                        txs.forEach(tx => {
                            let inTx = tx.InTx
                            let outTx = tx.OutTx
                            if (moment().diff(tx.CreatedAt, 'seconds') > 3000) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck BTC withdraw ${inTx.Hash}`)
                            }
                        })
                        resolve()
                    })
            }))

            map.push(new Promise((resolve, reject) =>  {
                let query = {
                    coin: 'eth',
                    limit: 10,
                    page: 1
                }
                return chai.request(url)
                    .get('/')
                    .query(query)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        let txs = res.body.Data
                        txs.forEach(tx => {
                            let inTx = tx.InTx
                            let outTx = tx.OutTx
                            if (moment().diff(tx.CreatedAt, 'seconds') > 1000) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ETH withdraw ${inTx.Hash}`)
                            }
                        })
                        resolve()
                    })
            }))

            map.push(new Promise((resolve, reject) =>  {
                let query = {
                    coin: 'usdt',
                    limit: 10,
                    page: 1
                }
                return chai.request(url)
                    .get('/')
                    .query(query)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        let txs = res.body.Data
                        txs.forEach(tx => {
                            let inTx = tx.InTx
                            let outTx = tx.OutTx
                            if (moment().diff(tx.CreatedAt, 'seconds') > 1000) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck USDT withdraw ${inTx.Hash}`)
                            }
                        })
                        resolve()
                    })
            }))

            Promise.all(map).then(() => done()).catch(() => done())
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

    describe('/GET locked balance and total supply', () => {
        it('it should have enough locked', (done) => {
            let map = []
            let btc = config.tomobridge.lockedBTC
            let apiKey = process.env.ETHERSCAN_APIKEY || config.etherscanApiKey

            if (btc) {
                let url = `https://blockchain.info/q/addressbalance/${btc}`
                let p = new Promise((resolve, reject) =>  {
                    return chai.request(url)
                        .get('/')
                        .end((err, res) => {
                            res.should.have.status(200)
                            let balance = parseFloat((new BigNumber(res.text)).dividedBy(1e8).toString(10))
                            console.log(`token=BTC address=${btc} balance=${balance}`)
                            resolve()
                        })
                })
                map.push(p)

            }

            let eth = config.tomobridge.lockedETH
            if (eth) {
                let url = `https://api.etherscan.io/api?module=account&action=balance&address=${eth}&tag=latest&apikey=${apiKey}`
                let p = new Promise((resolve, reject) =>  {
                    return chai.request(url)
                        .get('/')
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            let balance = parseFloat((new BigNumber(res.body.result)).dividedBy(1e18).toString(10))
                            console.log(`token=ETH address=${eth} balance=${balance}`)
                            resolve()
                        })
                })
                map.push(p)
            }

            let usdt = config.tomobridge.lockedUSDT
            if (usdt) {
                let url = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0xdac17f958d2ee523a2206206994597c13d831ec7&address=${usdt}&tag=latest&apikey=${apiKey}`
                let p = new Promise((resolve, reject) =>  {
                    return chai.request(url)
                        .get('/')
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            let balance = parseFloat((new BigNumber(res.body.result)).dividedBy(1e6).toString(10))
                            console.log(`token=USDT address=${eth} balance=${balance}`)
                            resolve()
                        })
                })
                map.push(p)
            }

            let tomojs = new TomoJS('https://rpc.tomochain.com')
            let trc21usdt = config.tomobridge.trc21USDT

            if (trc21usdt) {
                let p = new Promise((resolve, reject) =>  {
                    return tomojs.tomoz.getTokenInformation(trc21usdt).then(data => {
                        let totalSupply = data.totalSupply
                        console.log(`token=USDT address=${trc21usdt} totalSupply=${totalSupply}`)
                        resolve()
                    }).catch(e => reject(e))
                })
                map.push(p)
            }

            let trc21eth = config.tomobridge.trc21ETH

            if (trc21eth) {
                let p = new Promise((resolve, reject) =>  {
                    return tomojs.tomoz.getTokenInformation(trc21eth).then(data => {
                        let totalSupply = data.totalSupply
                        console.log(`token=ETH address=${trc21eth} totalSupply=${totalSupply}`)
                        resolve()
                    }).catch(e => reject(e))
                })
                map.push(p)
            }

            let trc21btc = config.tomobridge.trc21BTC

            if (trc21btc) {
                let p = new Promise((resolve, reject) =>  {
                    return tomojs.tomoz.getTokenInformation(trc21btc).then(data => {
                        let totalSupply = data.totalSupply
                        console.log(`token=BTC address=${trc21btc} totalSupply=${totalSupply}`)
                        resolve()
                    }).catch(e => reject(e))
                })
                map.push(p)
            }
            
            Promise.all(map).then(() => done()).catch(() => done())
        })
    })
})
