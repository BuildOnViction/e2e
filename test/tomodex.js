let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let BigNumber = require('bignumber.js')
let uri = (config.tomodex || {}).uri
let moment = require('moment')

chai.use(chaiHttp)
describe('TomoDex', () => {
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

    describe('/GET trades', () => {
        it('it should GET trades', (done) => {
            let url = urljoin(uri, 'api/trades')
            chai.request(url)
                .get('')
                .query({
                    baseToken: config.get('tomodex.baseToken'),
                    quoteToken: config.get('tomodex.quoteToken'),
                    sortType: 'desc',
                    sortBy: 'time'
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let trades = res.body.data.trades
                    expect(moment().diff(trades[0].createdAt, 'seconds')).to.be.below(300)
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
                    done()
                })
        })
    })

    describe('/GET orderbook', () => {
        it('it should GET orderbook', (done) => {
            let url = urljoin(uri, 'api/orderbook')
            chai.request(url)
                .get('')
                .query({
                    baseToken: config.get('tomodex.baseToken'),
                    quoteToken: config.get('tomodex.quoteToken'),
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    if (process.env.NODE_ENV === 'devnet') return done()
                    if ((res.body.data.bids.length > 0) && (res.body.data.asks.length > 0)) {	
                        let ask = new BigNumber(res.body.data.asks[0].pricepoint)	
                        let bid = new BigNumber(res.body.data.bids[0].pricepoint)	
                        let b = ask.isGreaterThanOrEqualTo(bid)	
                        expect(b).to.equal(true)	
                    }
                    done()
                })
        })
    })

    describe('/GET orderbookInDb', () => {
        it('it should GET orderbookInDb', (done) => {
            if (process.env.NODE_ENV !== 'devnet') return done()
            let url = urljoin(uri, 'api/orderbook/db')
            chai.request(url)
                .get('')
                .query({
                    baseToken: config.get('tomodex.baseToken'),
                    quoteToken: config.get('tomodex.quoteToken'),
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    if (res.body.data.bids.length > 0 && res.body.data.asks.length > 0) {
                        let ask = new BigNumber(res.body.data.asks[0].pricepoint)
                        let bid = new BigNumber(res.body.data.bids[0].pricepoint)
                        let b = ask.isGreaterThanOrEqualTo(bid)
                        expect(b).to.equal(true)
                    }
                    done()
                })
        })
    })
})
