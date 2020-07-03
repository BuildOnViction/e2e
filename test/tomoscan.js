let chai = require('chai')
let chaiHttp = require('chai-http')
let expect = chai.expect
let should = chai.should()
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomoscan || {}).uri

chai.use(chaiHttp)
describe('TomoScan', () => {
    if (!uri) {
        return
    }

    describe('/GET site', () => {
        let url = uri
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.html
                    done()
                })
        })
    })

    describe('/GET reward crawler status', () => {
        let url = urljoin(uri, '/api/rewards/alerts/status')
        it(`GET ${url}`, (done) => {
            if (process.env.NODE_ENV === 'devnet') return done()
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    res.body.isSlow.should.equal(false, 'Reward crawler is down')
                    done()
                })
        })
    })

    describe('/GET txs crawler', () => {
        let txUrl = urljoin(uri, 'api/txs?page=1&limit=1')
        it(`GET ${txUrl}`, (done) => {
            let url = urljoin(uri, '/api/blocks?page=1&limit=1')
            chai.request(url)
                .get('')
                .end((err, resBlock) => {
                    chai.request(txUrl)
                        .get('')
                        .end((err, resTx) => {
                            resBlock.should.have.status(200)
                            resTx.should.have.status(200)
                            resBlock.should.be.json
                            resTx.should.be.json
                            resTx.body.items[0].blockNumber = resTx.body.items[0].blockNumber + 100
                            resTx.body.items[0].blockNumber.should.above(resBlock.body.items[0].number, 'Tx Cralwer is down')
                            done()
                        })
                })
        })
    })

    describe('/GET trc21 token holers', () => {
        let url = urljoin(uri, '/api/token-holders/trc21?page=1&limit=1&address=0x3c6475f8b4200e0a6acf5aeb2b44b769a3d37216')
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    expect(res.body.items.length).to.above(0, 'empty holders')
                    expect(res.body.items[0].quantityNumber).to.above(0, 'Wrong holder balance')
                    done()
                })
        })
    })
})
