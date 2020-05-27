let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let BigNumber = require('bignumber.js')
let TomoXJS = require('tomoxjs')
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

    describe('/GET pairs', () => {
        it('it should GET trades', (done) => {
            let url = urljoin(uri, 'api/pairs')
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
        it('it should GET trades', (done) => {
            let url = urljoin(uri, 'api/trades')
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
                            expect(moment().diff(trades[0].createdAt, 'seconds')).to.be.below(config.tomodex['duration'], `${p.baseTokenSymbol}/${p.quoteTokenSymbol}`)
                            return resolve()
                        })
                })
            })
            Promise.all(map).then(() => done()).catch(() => done())
        })
    })

    describe('/WS markets', () => {
        it('it should WS markets', (done) => {
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
                        expect(msg.event.payload.pairData.length).to.above(0)
                        clearTimeout(timer)
                        ws.close()
                        return resolve()
                    })
                }).catch(e => {
                    expect(1).to.equal(0, e)
                    clearTimeout(timer)
                    return reject()
                })
            })

            p.then(() => done()).catch(() => done())
        })
    })

    describe('/GET orderbook', () => {
        it('it should GET orderbook', (done) => {
            let url = urljoin(uri, 'api/orderbook')
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
        it('it should GET orderbookInDb', (done) => {
            let url = urljoin(uri, 'api/orderbook/db')
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
})
