let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomobridge || {}).uri

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
                    done()
                })
        })
    })

})
