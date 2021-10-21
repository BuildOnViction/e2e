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

    describe('/WS OHLCV', () => {
        it(`WS OHLCV ${urljoin(uri, 'socket')}`, (done) => {
            let pair = pairs[0]
            let p = new Promise((resolve, reject) =>  {
                let timer = null

                tomox.watchOHLCV({
                    baseToken: pair.baseTokenAddress,
                    quoteToken: pair.quoteTokenAddress,
                    units: 'hour',
                    duration: 1
                }).then(ws => {
                    ws.on('message', (message) => {
                        let msg = JSON.parse(message)
                        timer = setTimeout(() => {
                            ws.close()
                            clearTimeout(timer)
                            expect(1).to.equal(0, 'Websocket timeout')
                            return reject()
                        }, 60 * 1000)

                        expect(msg).to.have.property('channel', 'ohlcv')
                        expect(msg.event.payload.length).to.above(0, `Websocket OHLCV ${pair.baseTokenSymbol}/${pair.quoteTokenSymbol} is down`)
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

})
