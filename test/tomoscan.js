let chai = require('chai')
let chaiHttp = require('chai-http')
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
        it('it should GET site', (done) => {
            let url = uri
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
        it('it should GET crawler status', (done) => {
            if (process.env.NODE_ENV === 'devnet') return done()
            let url = urljoin(uri, '/api/rewards/alerts/status')
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    res.body.isSlow.should.equal(false)
                    done()
                })
        })
    })

    describe('/GET txs crawler', () => {
        it('it should GET txs crawler', (done) => {
            let url = urljoin(uri, '/api/blocks?page=1&limit=1')
            chai.request(url)
                .get('')
                .end((err, resBlock) => {
                    url = urljoin(uri, 'api/txs?page=1&limit=1')
                    chai.request(url)
                        .get('')
                        .end((err, resTx) => {
                            resBlock.should.have.status(200)
                            resTx.should.have.status(200)
                            resBlock.should.be.json
                            resTx.should.be.json
                            resTx.body.items[0].blockNumber = resTx.body.items[0].blockNumber + 100
                            resTx.body.items[0].blockNumber.should.above(resBlock.body.items[0].number)
                            done()
                        })
                })
        })
    })
})
