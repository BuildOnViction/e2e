let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomochain || {}).uri

chai.use(chaiHttp)
describe('TomoChain website', () => {
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

    describe('/GET get-tomox script', () => {
        let url = urljoin(uri, 'get-tomox.sh')
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.have.header('content-type', 'text/plain');
                    done()
                })
        })
    })
})
