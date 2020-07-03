let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let BigNumber = require('bignumber.js')
let TomoXJS = require('tomoxjs')
let Stats = require('../stats/tomodex')
let uri = (config.tomodex || {}).uri
let moment = require('moment')
let pairs = []
let lendingPairs = []

chai.use(chaiHttp)
describe('TomoDex', () => {
    if (!uri) {
        return
    }

    let tomox = new TomoXJS(uri, urljoin(uri, 'socket'))

    describe('/GET site', () => {
        let url = uri
        it(`GET ${url}`, (done) => {
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

    describe('/GET get owner balance', () => {
        let balances = config.tomodex.balances
        if ((balances || []).length <= 0) return
        balances.forEach(address => {
            let url = urljoin(uri, 'api/account', address)
            it(`GET ${url}`, (done) => {
                chai.request(url)
                    .get('')
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        let tokenBalances = res.body.data.tokenBalances
                        let data = []
                        let inUsdBalance = 0
                        Object.keys(tokenBalances).forEach(k => {
                            let balance = new BigNumber(tokenBalances[k].balance).dividedBy(10 ** tokenBalances[k].decimals).toFixed(6).toString(10)
                            inUsdBalance = inUsdBalance + parseFloat(tokenBalances[k].inUsdBalance)
                            data.push({
                                address: address,
                                tokenAddress: tokenBalances[k].address,
                                tokenSymbol: tokenBalances[k].symbol,
                                type: 'raw',
                                value: parseFloat(balance)
                            })
                            data.push({
                                address: address,
                                tokenAddress: tokenBalances[k].address,
                                tokenSymbol: tokenBalances[k].symbol,
                                type: 'usd',
                                value: tokenBalances[k].inUsdBalance
                            })

                        })
                        data.push({
                            address: address,
                            tokenAddress: 'total',
                            tokenSymbol: 'total',
                            type: 'usd',
                            value: inUsdBalance
                        })

                        if (data.length > 0) {
                            Stats.saveBalances(data)
                        }

                        done()
                    })
            })
        })
    })

    describe('/GET all relayers', () => {
        let url = urljoin(uri, 'api/relayer/all')
        it(`GET ${url}`, (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let relayers = res.body.data
                    let map = relayers.map((relayer) => {
                        let spotVolume = parseFloat((new BigNumber(relayer.spotVolume).dividedBy(10 ** 6)).toString(10))
                        return Stats.push({
                            table: 'volumes',
                            type: 'spot',
                            domain: relayer.domain || 'empty',
                            name: relayer.name || 'empty',
                            address: relayer.address,
                            value: spotVolume
                        }).then(() => {
                            let lendingVolume = parseFloat((new BigNumber(relayer.lendingVolume).dividedBy(10 ** 6)).toString(10))
                            let totalVolume = spotVolume + lendingVolume
                            return Stats.push({
                                table: 'volumes',
                                type: 'lending',
                                domain: relayer.domain || 'empty',
                                name: relayer.name || 'empty',
                                address: relayer.address,
                                value: lendingVolume
                            }).then(() => {
                                return Stats.push({
                                    table: 'volumes',
                                    type: 'total',
                                    domain: relayer.domain || 'empty',
                                    name: relayer.name || 'empty',
                                    address: relayer.address,
                                    value: totalVolume
                                })
                            })
                        })
                    })
                    return Promise.all(map).then(() => done()).catch(() => done())
                })
        })
    })

    describe('/GET pairs', () => {
        let url = urljoin(uri, 'api/pairs')
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    pairs = res.body.data
                    done()
                })
        })
    })

    describe('/GET lending pairs', () => {
        let url = urljoin(uri, 'api/lending/pairs')
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    lendingPairs = res.body.data
                    done()
                })
        })
    })


    describe('/GET trades', () => {
        let url = urljoin(uri, 'api/trades')
        it(`GET ${url}`, (done) => {
            let allTotal = 0
            let map = pairs.map((p) => {
                return new Promise((resolve, reject) =>  {
                    chai.request(url)
                        .get('')
                        .query({
                            baseToken: p.baseTokenAddress,
                            quoteToken: p.quoteTokenAddress,
                            sortType: 'dec',
                            sortBy: 'time'
                        })
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            let trades = res.body.data.trades
                            let total = res.body.data.total
                            allTotal = allTotal + parseInt(total)
                            expect(moment().diff(trades[0].createdAt, 'seconds')).to.be.below(config.tomodex['duration'], `${p.baseTokenSymbol}/${p.quoteTokenSymbol} no new trades`)
                            Stats.saveTotalTrades({
                                pair: p.baseTokenSymbol + p.quoteTokenSymbol,
                                env: process.env.NODE_ENV,
                                value: total
                            })
                            return resolve()
                        })
                })
            })
            Promise.all(map).then(() => {
                Stats.saveTotalTrades({
                    pair: 'all',
                    env: process.env.NODE_ENV,
                    value: allTotal
                })
                done()
            }).catch(() => done())
        })
    })

    describe('/GET lending trades', () => {
        let url = urljoin(uri, 'api/lending/trades')
        it(`GET ${url}`, (done) => {
            let allTotal = 0
            let map = lendingPairs.map((p) => {
                return new Promise((resolve, reject) =>  {
                    chai.request(url)
                        .get('')
                        .query({
                            lendingToken: p.lendingTokenAddress,
                            term: p.term,
                            sortType: 'dec',
                            sortBy: 'time'
                        })
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            // let trades = res.body.data.trades
                            let total = res.body.data.total
                            allTotal = allTotal + parseInt(total)
                            // expect(moment().diff(trades[0].createdAt, 'seconds')).to.be.below(config.tomodex['duration'], `${p.baseTokenSymbol}/${p.quoteTokenSymbol} no new trades`)
                            Stats.saveTotalTrades({
                                pair: p.term + p.lendingTokenSymbol,
                                env: process.env.NODE_ENV,
                                value: total
                            })
                            return resolve()
                        })
                })
            })
            Promise.all(map).then(() => {
                Stats.saveTotalTrades({
                    pair: 'lending_all',
                    env: process.env.NODE_ENV,
                    value: allTotal
                })
                done()
            }).catch(() => done())
        })
    })

    describe('/GET total, 1d, 7d, 30d users', () => {
        let url = urljoin(uri, 'stats/trades/users/count?relayerAddress=0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84')
        it(`GET ${url}`, (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    Stats.saveTotalUsers({
                        pair: 'all',
                        duration: 'all',
                        env: process.env.NODE_ENV,
                        value: res.body.data.activeUser
                    })
                    done()
                })
        })

        let url1d = urljoin(uri, 'stats/trades/users/count?relayerAddress=0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84&duration=1d')
        it(`GET ${url1d}`, (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            chai.request(url1d)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    Stats.saveTotalUsers({
                        pair: 'all',
                        duration: '24h',
                        env: process.env.NODE_ENV,
                        value: res.body.data.activeUser
                    })
                    done()
                })
        })

        let url7d = urljoin(uri, 'stats/trades/users/count?relayerAddress=0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84&duration=7d')
        it(`GET ${url7d}`, (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            chai.request(url7d)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    Stats.saveTotalUsers({
                        pair: 'all',
                        duration: '7d',
                        env: process.env.NODE_ENV,
                        value: res.body.data.activeUser
                    })
                    done()
                })
        })

        let url30d = urljoin(uri, 'stats/trades/users/count?relayerAddress=0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84&duration=30d')
        it(`GET ${url30d}`, (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            chai.request(url30d)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    Stats.saveTotalUsers({
                        pair: 'all',
                        duration: '30d',
                        env: process.env.NODE_ENV,
                        value: res.body.data.activeUser
                    })
                    done()
                })
        })
    })

    describe('/GET spot/lending 7d, 30d volumes', () => {
        let urlspot7d = urljoin(uri, 'api/relayer/volume?type=7d')
        it(`GET ${urlspot7d}`, (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            chai.request(urlspot7d)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let v = (new BigNumber(res.body.data.totalVolume).dividedBy(10 ** 6)).toFixed(4).toString(10)
                    Stats.push({
                        table: 'volumes',
                        type: 'spot7d',
                        domain: 'dex.tomochain.com',
                        name: 'tomodex',
                        address: '0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84',
                        value: v
                    })
                    done()
                })
        })

        let urlspot30d = urljoin(uri, 'api/relayer/volume?type=30d')
        it(`GET ${urlspot30d}`, (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            chai.request(urlspot30d)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let v = (new BigNumber(res.body.data.totalVolume).dividedBy(10 ** 6)).toFixed(4).toString(10)
                    Stats.push({
                        table: 'volumes',
                        type: 'spot30d',
                        domain: 'dex.tomochain.com',
                        name: 'tomodex',
                        address: '0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84',
                        value: v
                    })
                    done()
                })
        })

        let urll7d = urljoin(uri, 'api/relayer/lending?type=7d')
        it(`GET ${urll7d}`, (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            chai.request(urll7d)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let v = (new BigNumber(res.body.data.totalVolume).dividedBy(10 ** 6)).toFixed(4).toString(10)
                    Stats.push({
                        table: 'volumes',
                        type: 'lending7d',
                        domain: 'dex.tomochain.com',
                        name: 'tomodex',
                        address: '0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84',
                        value: v
                    })
                    done()
                })
        })

        let urll30d = urljoin(uri, 'api/relayer/lending?type=30d')
        it(`GET ${urll30d}`, (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            chai.request(urll30d)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let v = (new BigNumber(res.body.data.totalVolume).dividedBy(10 ** 6)).toFixed(4).toString(10)
                    Stats.push({
                        table: 'volumes',
                        type: 'lending30d',
                        domain: 'dex.tomochain.com',
                        name: 'tomodex',
                        address: '0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84',
                        value: v
                    })
                    done()
                })
        })
    }


    describe('/WS markets', () => {
        it(`WS markets ${urljoin(uri, 'socket')}`, (done) => {
            let p = new Promise((resolve, reject) =>  {
                let timer = null
                tomox.watchMarkets().then(ws => {
                    ws.on('message', (message) => {
                        let msg = JSON.parse(message)
                        timer = setTimeout(() => {
                            ws.close()
                            clearTimeout(timer)
                            expect(1).to.equal(0, 'Websocket timeout')
                            return reject()
                        }, 60 * 1000)

                        expect(msg).to.have.property('channel', 'markets') 
                        expect(msg.event.payload.pairData.length).to.above(0, 'Websocket Markets is down')
                        clearTimeout(timer)
                        ws.close()
                        return resolve()
                    })
                }).catch(e => {
                    expect(1).to.equal(0, String(e))
                    clearTimeout(timer)
                    return reject()
                })
            })

            p.then(() => done()).catch(() => done())
        })
    })
    
    describe('/WS orderbook', () => {
        it(`WS orderbook ${urljoin(uri, 'socket')}`, (done) => {
            let pair = pairs[0]
            let p = new Promise((resolve, reject) =>  {
                let timer = null

                tomox.watchOrderBook({
                    baseToken: pair.baseTokenAddress,
                    quoteToken: pair.quoteTokenAddress
                }).then(ws => {
                    ws.on('message', (message) => {
                        let msg = JSON.parse(message)
                        timer = setTimeout(() => {
                            ws.close()
                            clearTimeout(timer)
                            expect(1).to.equal(0, 'Websocket timeout')
                            return reject()
                        }, 60 * 1000)

                        expect(msg).to.have.property('channel', 'orderbook') 
                        expect(msg.event.payload.pairName, `Websocket Orderbook ${pair.baseTokenSymbol}/${pair.quoteTokenSymbol} is down`).to.not.be.null
                        clearTimeout(timer)
                        ws.close()
                        return resolve()
                    })
                }).catch(e => {
                    expect(1).to.equal(0, String(e))
                    clearTimeout(timer)
                    return reject()
                })
            })

            p.then(() => done()).catch(() => done())
        })
    })

    describe('/GET orderbook', () => {
        let url = urljoin(uri, 'api/orderbook')
        it(`GET ${url}`, (done) => {
            let map = pairs.map((p) => {
                return new Promise((resolve, reject) =>  {
                    chai.request(url)
                        .get('')
                        .query({
                            baseToken: p.baseTokenAddress,
                            quoteToken: p.quoteTokenAddress
                        })
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            if (process.env.NODE_ENV !== 'devnet') {
                                expect(res.body.data.asks.length).to.above(0, `Asks ${p.baseTokenSymbol}/${p.quoteTokenSymbol} is empty`)
                                expect(res.body.data.bids.length).to.above(0, `Bids ${p.baseTokenSymbol}/${p.quoteTokenSymbol} is empty`)
                            }
                            if ((res.body.data.bids.length > 0) && (res.body.data.asks.length > 0)) {	
                                let ask = new BigNumber(res.body.data.asks[0].pricepoint)	
                                let bid = new BigNumber(res.body.data.bids[0].pricepoint)	
                                let b = ask.isGreaterThanOrEqualTo(bid)	
                                expect(b).to.equal(true, `${p.baseTokenSymbol}/${p.quoteTokenSymbol} ask=${res.body.data.asks[0].pricepoint} bid=${res.body.data.bids[0].pricepoint}`) 
                            }
                            return resolve()
                        })
                })
            })
            Promise.all(map).then(() => done()).catch(() => done())
        })
    })

    describe('/GET orderbookInDb', () => {
        let url = urljoin(uri, 'api/orderbook/db')
        it(`GET ${url}`, (done) => {
            let map = pairs.map((p) => {
                return new Promise((resolve, reject) =>  {
                    chai.request(url)
                        .get('')
                        .query({
                            baseToken: p.baseTokenAddress,
                            quoteToken: p.quoteTokenAddress
                        })
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            if (res.body.data.bids.length > 0 && res.body.data.asks.length > 0) {
                                let ask = new BigNumber(res.body.data.asks[0].pricepoint)
                                let bid = new BigNumber(res.body.data.bids[0].pricepoint)
                                let b = ask.isGreaterThanOrEqualTo(bid)
                                expect(b).to.equal(true, `${p.baseTokenSymbol}/${p.quoteTokenSymbol} ask=${res.body.data.asks[0].pricepoint} bid=${res.body.data.bids[0].pricepoint}`) 
                            }
                            return resolve()
                        })
                })
            })
            Promise.all(map).then(() => done()).catch(() => done())
        })
    })

    describe('/GET coingecko apis', () => {
        let url = urljoin(uri, 'api/coingecko/pairs')
        it(`GET ${url}`, (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    expect(res.body.length).to.above(0, 'Empty pairs')
                    done()
                })
        })
    })

    describe('/GET coinmarketcap apis', () => {
        let url = urljoin(uri, 'api/coinmarketcap/markets')
        it(`GET ${url}`, (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    expect(res.body.length).to.above(0, 'Empty markets')
                    done()
                })
        })
    })

})
