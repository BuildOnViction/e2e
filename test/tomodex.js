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

    describe('/GET trades', () => {
        let url = urljoin(uri, 'api/trades')
        it(`GET ${url}`, (done) => {
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
                            expect(moment().diff(trades[0].createdAt, 'seconds')).to.be.below(config.tomodex['duration'], `${p.baseTokenSymbol}/${p.quoteTokenSymbol} no new trades`)
                            return resolve()
                        })
                })
            })
            Promise.all(map).then(() => done()).catch(() => done())
        })
    })

    describe('/WS markets', () => {
        it(`WS ${urljoin(uri, 'socket')}`, (done) => {
            let p = new Promise((resolve, reject) =>  {
                let timer = null
                timer = setTimeout(() => {
                    expect(1).to.equal(0, 'Websocket timeout')
                    return reject()
                }, 60 * 1000)

                tomox.watchMarkets().then(ws => {
                    ws.on('message', (message) => {
                        let msg = JSON.parse(message)
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
        it(`WS ${urljoin(uri, 'socket')}`, (done) => {
            let pair = pairs[0]
            let p = new Promise((resolve, reject) =>  {
                let timer = null
                timer = setTimeout(() => {
                    expect(1).to.equal(0, 'Websocket timeout')
                    return reject()
                }, 60 * 1000)

                tomox.watchOrderBook({
                    baseToken: pair.baseTokenAddress,
                    quoteToken: pair.quoteTokenAddress
                }).then(ws => {
                    ws.on('message', (message) => {
                        let msg = JSON.parse(message)
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
                        let volume = parseFloat((new BigNumber(relayer.spotVolume).dividedBy(10 ** 6)).toString(10))
                        return Stats.push({
                            table: 'volumes',
                            type: 'spot',
                            domain: relayer.domain || 'empty',
                            name: relayer.name || 'empty',
                            address: relayer.address,
                            value: volume
                        }).then(() => {
                            let volume = parseFloat((new BigNumber(relayer.lendingVolume).dividedBy(10 ** 6)).toString(10))
                            return Stats.push({
                                table: 'volumes',
                                type: 'lending',
                                domain: relayer.domain || 'empty',
                                name: relayer.name || 'empty',
                                address: relayer.address,
                                value: volume
                            })
                        })
                    })
                    return Promise.all(map).then(() => done()).catch(() => done())
                })
        })
    })
})
