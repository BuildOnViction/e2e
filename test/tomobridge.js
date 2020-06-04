let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomobridge || {}).uri
let BigNumber = require('bignumber.js')
let Stats = require('../stats/tomobridge')
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
        let url = urljoin(uri, 'api/transactions/getWrapTxs')
        it(`GET ${url}`, (done) => {
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
                            let delay = moment().diff(tx.CreatedAt, 'seconds')
                            if (delay > 3000) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck BTC deposit ${inTx.Hash} delay ${delay}`)
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
                            let delay = moment().diff(tx.CreatedAt, 'seconds')
                            if (delay > 1500) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ETH deposit ${inTx.Hash} delay ${delay}`)
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
                            let delay = moment().diff(tx.CreatedAt, 'seconds')
                            if (delay > 1500) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck USDT deposit ${inTx.Hash} delay ${delay}`)
                            }
                        })
                        resolve()
                    })
            }))

            Promise.all(map).then(() => done()).catch(() => done())
        })
    })

    describe('/GET withdraw txs', () => {
        let url = urljoin(uri, 'api/transactions/getUnwrapTxs')
        it(`GET ${url}`, (done) => {
            let map = []
            map.push(new Promise((resolve, reject) =>  {
                let query = {
                    coin: 'btc',
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
                            let delay = moment().diff(tx.CreatedAt, 'seconds')
                            if (delay > 3000) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck BTC withdraw ${inTx.Hash} delay ${delay}`)
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
                            let delay = moment().diff(tx.CreatedAt, 'seconds')
                            if (delay > 1500) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ETH withdraw ${inTx.Hash} delay ${delay} seconds`)
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
                            let delay = moment().diff(tx.CreatedAt, 'seconds')
                            if (delay > 1500) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck USDT withdraw ${inTx.Hash} delay ${delay} seconds`)
                            }
                        })
                        resolve()
                    })
            }))

            Promise.all(map).then(() => done()).catch(() => done())
        })
    })

    describe('/GET eth unlock wallet 02 balance', () => {
        let address = config.tomobridge.ethUnlockWallet02
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
                    expect(balance).to.above(0.05, `Not enough balance for ethUnlockWallet01 ${address}`)
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
        let address = config.tomobridge.ethUnlockWallet01
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
                    expect(balance).to.above(0.05, `Not enough balance for ethUnlockWallet01 ${address}`)
                    return Stats.push({
                        table: 'ethUnlockWallet01',
                        name: 'ETH',
                        address: address,
                        value: balance
                    }).then(() => done()).catch(() => done())
                })
        })
    })

    describe('/GET eth fee balance', () => {
        let address = config.tomobridge.usdtFeeWallet
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
                    expect(balance).to.above(0.05, 'Not enough balance for wallet fee')
                    return Stats.push({
                        table: 'feewallets',
                        name: 'ETH',
                        address: address,
                        value: balance
                    }).then(() => done()).catch(() => done())
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
                            return Stats.push({
                                table: 'coins',
                                name: 'BTC',
                                address: btc,
                                value: balance
                            }).then(() => resolve()).catch(() => resolve())
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
                            return Stats.push({
                                table: 'coins',
                                name: 'ETH',
                                address: eth,
                                value: balance
                            }).then(() => resolve()).catch(() => resolve())
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
                            return Stats.push({
                                table: 'coins',
                                name: 'USDT',
                                address: usdt,
                                value: balance
                            }).then(() => resolve()).catch(() => resolve())
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
                        return Stats.push({
                            table: 'trc21tokens',
                            name: 'USDT',
                            address: trc21usdt,
                            value: totalSupply
                        }).then(() => resolve()).catch(() => resolve())
                    }).catch(e => reject(e))
                })
                map.push(p)
            }

            let trc21eth = config.tomobridge.trc21ETH

            if (trc21eth) {
                let p = new Promise((resolve, reject) =>  {
                    return tomojs.tomoz.getTokenInformation(trc21eth).then(data => {
                        let totalSupply = data.totalSupply
                        return Stats.push({
                            table: 'trc21tokens',
                            name: 'ETH',
                            address: trc21eth,
                            value: totalSupply
                        }).then(() => resolve()).catch(() => resolve())
                    }).catch(e => reject(e))
                })
                map.push(p)
            }

            let trc21btc = config.tomobridge.trc21BTC

            if (trc21btc) {
                let p = new Promise((resolve, reject) =>  {
                    return tomojs.tomoz.getTokenInformation(trc21btc).then(data => {
                        let totalSupply = data.totalSupply
                        return Stats.push({
                            table: 'trc21tokens',
                            name: 'BTC',
                            address: trc21btc,
                            value: totalSupply
                        }).then(() => resolve()).catch(() => resolve())
                    }).catch(e => reject(e))
                })
                map.push(p)
            }
            
            Promise.all(map).then(() => done()).catch(() => done())
        })
    })
})
