let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.rpc || {}).uri

chai.use(chaiHttp)
describe('TomoChain RPC', () => {
    if (!uri) {
        return
    }

    describe('/POST gasPrice', () => {
        it('it should get gasPrice', (done) => {
            let url = uri
            chai.request(url)
                .post('/')
                .send({ "jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":73 })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    done()
                })
        })
    })

    describe('/GET proxystatus', () => {
        it('it should GET proxystatus', (done) => {
            let url = urljoin(uri, 'proxystatus')
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
