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

    describe('/GET deposit BTC txs', () => {
        let url = urljoin(uri, 'api/transactions/getWrapTxs')
        it(`GET ${url}`, (done) => {
            let query = {
                coin: 'btc',
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
                        table: 'txdeposit',
                        name: 'BTC',
                        address: 'BTC',
                        value: res.body.Total
                    })
                    txs.forEach(tx => {
                        let inTx = tx.InTx
                        let outTx = tx.OutTx
                        let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                        if (delay > 3000) {
                            expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ${new BigNumber(inTx.Amount).dividedBy(10 ** 8).toString(10)} BTC deposit ${inTx.Hash} delay ${delay}`)
                        }
                    })
                    done()
                })
        })
    })

    describe('/GET deposit ETH txs', () => {
        let url = urljoin(uri, 'api/transactions/getWrapTxs')
        it(`GET ${url}`, (done) => {
            let query = {
                coin: 'eth',
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
                        table: 'txdeposit',
                        name: 'ETH',
                        address: 'ETH',
                        value: res.body.Total
                    })
                    txs.forEach(tx => {
                        let inTx = tx.InTx
                        let outTx = tx.OutTx
                        let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                        if (delay > 1500) {
                            expect(new BigNumber(inTx.Amount).dividedBy(10 ** 18).toFixed(8)).to.equal(new BigNumber(outTx.Amount).dividedBy(10 ** 18).toFixed(8), `Stuck ${new BigNumber(inTx.Amount).dividedBy(10 ** 18).toString(10)} ETH deposit ${inTx.Hash} delay ${delay}`)
                        }
                    })
                    done()
                })
        })
    })

    describe('/GET deposit USDT txs', () => {
        let url = urljoin(uri, 'api/transactions/getWrapTxs')
        it(`GET ${url}`, (done) => {
            let query = {
                coin: 'usdt',
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
                        table: 'txdeposit',
                        name: 'USDT',
                        address: 'USDT',
                        value: res.body.Total
                    })
                    txs.forEach(tx => {
                        let inTx = tx.InTx
                        let outTx = tx.OutTx
                        let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                        if (delay > 1500) {
                            expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ${new BigNumber(inTx.Amount).dividedBy(10 ** 6).toString(10)} USDT deposit ${inTx.Hash} delay ${delay}`)
                        }
                    })
                    done()
                })
        })
    })

    describe('/GET deposit YFI txs', () => {
        let url = urljoin(uri, 'api/transactions/getWrapTxs')
        it(`GET ${url}`, (done) => {
            let query = {
                coin: 'yfi',
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
                        table: 'txdeposit',
                        name: 'YFI',
                        address: 'YFI',
                        value: res.body.Total
                    })
                    txs.forEach(tx => {
                        let inTx = tx.InTx
                        let outTx = tx.OutTx
                        let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                        if (delay > 1500) {
                            expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ${new BigNumber(inTx.Amount).dividedBy(10 ** 6).toString(10)} YFI deposit ${inTx.Hash} delay ${delay}`)
                        }
                    })
                    done()
                })
        })
    })

    describe('/GET deposit ERC20 token txs', () => {
        let url = urljoin(uri, 'api/transactions/getWrapTxs')
        let erc20Tokens = config.tomobridge.erc20.tokens
        erc20Tokens.forEach((t) => {
            it(`GET ${url}?coin=${t.symbol.toLowerCase()}`, (done) => {
                let query = {
                    coin: t.symbol.toLowerCase(),
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
                            table: 'txdeposit',
                            name: t.symbol,
                            address: t.symbol,
                            value: res.body.Total
                        })
                        txs.forEach(tx => {
                            let inTx = tx.InTx
                            let outTx = tx.OutTx
                            let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                            if (delay > 1500) {
                                expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ${new BigNumber(inTx.Amount).dividedBy(Math.pow(10, t.decimals)).toString(10)} ${t.symbol} deposit ${inTx.Hash} delay ${delay}`)
                            }
                        })
                        done()
                    })
            })
        })
    })


    describe('/GET withdraw BTC txs', () => {
        let url = urljoin(uri, 'api/transactions/getUnwrapTxs')
        it(`GET ${url}`, (done) => {
            let query = {
                coin: 'btc',
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
                        table: 'txwithdraw',
                        name: 'BTC',
                        address: 'BTC',
                        value: res.body.Total
                    })
                    txs.forEach(tx => {
                        let inTx = tx.InTx
                        let outTx = tx.OutTx
                        let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                        if (delay > 3000) {
                            expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ${new BigNumber(inTx.Amount).dividedBy(10 ** 8).toString(10)} BTC withdraw ${inTx.Hash} delay ${delay}`)
                        }
                    })
                    done()
                })
        })
    })

    describe('/GET withdraw ETH txs', () => {
        let url = urljoin(uri, 'api/transactions/getUnwrapTxs')
        it(`GET ${url}`, (done) => {
            let query = {
                coin: 'eth',
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
                        table: 'txwithdraw',
                        name: 'ETH',
                        address: 'ETH',
                        value: res.body.Total
                    })
                    txs.forEach(tx => {
                        let inTx = tx.InTx
                        let outTx = tx.OutTx
                        let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                        if (delay > 1500
                                && inTx.Hash != '0x28e8728e391d78a28d293a0762ff7c77ff4186fbc193e5b960695d5dcb5c0ded') {
                            expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ${new BigNumber(inTx.Amount).dividedBy(10 ** 18).toString(10)} ETH withdraw ${inTx.Hash} delay ${delay} seconds`)
                        }
                    })
                    done()
                })
        })
    })

    describe('/GET withdraw USDT txs', () => {
        let url = urljoin(uri, 'api/transactions/getUnwrapTxs')
        it(`GET ${url}`, (done) => {
            let query = {
                coin: 'usdt',
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
                        table: 'txwithdraw',
                        name: 'USDT',
                        address: 'USDT',
                        value: res.body.Total
                    })
                    txs.forEach(tx => {
                        let inTx = tx.InTx
                        let outTx = tx.OutTx
                        let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                        if (delay > 1500 
                            && inTx.Hash != '0x00e04be5d1085c4839cc0947a8f45e591f83a5e1f2373686f0b7a19edd70509b'
                            && inTx.Hash != '0x728b0d698fe50514196f175137c63bff4c29d45c8f4af6f10910067f56f493a7') {
                            expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ${new BigNumber(inTx.Amount).dividedBy(10 ** 6).toString(10)} USDT withdraw ${inTx.Hash} delay ${delay} seconds`)
                        }
                    })
                    done()
                })
        })
    })

    describe('/GET withdraw YFI txs', () => {
        let url = urljoin(uri, 'api/transactions/getUnwrapTxs')
        it(`GET ${url}`, (done) => {
            let query = {
                coin: 'yfi',
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
                        table: 'txwithdraw',
                        name: 'YFI',
                        address: 'YFI',
                        value: res.body.Total
                    })
                    txs.forEach(tx => {
                        let inTx = tx.InTx
                        let outTx = tx.OutTx
                        let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                        if (delay > 1500) {
                            expect(inTx.Amount).to.equal(outTx.Amount, `Stuck ${new BigNumber(inTx.Amount).dividedBy(10 ** 18).toString(10)} YFI withdraw ${inTx.Hash} delay ${delay} seconds`)
                        }
                    })
                    done()
                })
        })
    })

    describe('/GET withdraw ERC20 tokens txs', () => {
        let url = urljoin(uri, 'api/transactions/getUnwrapTxs')
        let erc20Tokens = config.tomobridge.erc20.tokens
        erc20Tokens.forEach((t) => {
            it(`GET ${url}?coin=${t.symbol.toLowerCase()}`, (done) => {
                let query = {
                    coin: t.symbol.toLowerCase(),
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
                            table: 'txwithdraw',
                            name: t.symbol,
                            address: t.symbol,
                            value: res.body.Total
                        })
                        txs.forEach(tx => {
                            let inTx = tx.InTx
                            let outTx = tx.OutTx
                            let delay = moment().diff(moment.unix(tx.CreatedAt), 'seconds')
                            if (delay > 1500) {
                                expect(new BigNumber(inTx.Amount).dividedBy(10 ** 18).toFixed(8)).to.equal(new BigNumber(outTx.Amount).dividedBy(10 ** 18).toFixed(8),`Stuck ${new BigNumber(inTx.Amount).dividedBy(Math.pow(10, t.decimals)).toString(10)} ${t.symbol} withdraw ${inTx.Hash} delay ${delay} seconds`)
                            }
                        })
                        done()
                    })
            })
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
                    expect(balance).to.above(0.2, `Not enough balance for ethUnlockWallet02 ${address}`)
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
                    expect(balance).to.above(0.2, `Not enough balance for ethUnlockWallet01 ${address}`)
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
                    expect(balance).to.above(0.2, 'Not enough balance for wallet fee')
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

            let yfi = config.tomobridge.lockedYFI
            if (yfi) {
                let url = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e&address=${yfi}&tag=latest&apikey=${apiKey}`
                let p = new Promise((resolve, reject) =>  {
                    return chai.request(url)
                        .get('/')
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            let balance = parseFloat((new BigNumber(res.body.result)).dividedBy(1e18).toString(10))
                            return Stats.push({
                                table: 'coins',
                                name: 'YFI',
                                address: yfi,
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

            let trc21yfi = config.tomobridge.trc21YFI

            if (trc21yfi) {
                let p = new Promise((resolve, reject) =>  {
                    return tomojs.tomoz.getTokenInformation(trc21yfi).then(data => {
                        let totalSupply = data.totalSupply
                        return Stats.push({
                            table: 'trc21tokens',
                            name: 'YFI',
                            address: trc21yfi,
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
})
