let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomob || {}).uri

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
                    res.should.have.status(200)
                    res.should.be.html
                    done()
                })
        })
    })

    describe('/GET deposit', () => {
        it('it should deposit true', (done) => {
            let url = urljoin(uri, '/api/deposit/monitor/status')
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    res.body.status.should.equal(true)
                    done()
                })
        })
    })

    describe('/GET withdraw', () => {
        it('it should withdraw true', (done) => {
            let url = urljoin(uri, '/api/withdraw/monitor/status')
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    res.body.status.should.equal(true)
                    done()
                })
        })
    })
})
