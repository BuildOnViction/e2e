let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.maka|| {}).uri

chai.use(chaiHttp)
describe('MM', () => {
    if (!uri || process.env.NODE_ENV !== 'mainnet') {
        return
    }

    describe('/GET site', () => {
        let url = urljoin(uri)
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.html
                    done()
                })
        })
    })

    describe('/GET orderbook', () => {
        let url = urljoin(uri, 'api/v1/order/orderbook?token=TOMO&orderSide=2&orderSize=&countryCode=VN&s=4')
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    done()
                })
        })
    })
})
