let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let url = (config.tomodocs || {}).uri
chai.use(chaiHttp)
describe('TomoDocs', () => {
    if (!url) {
        return
    }
    describe(`/GET site docs`, () => {
        it('it should GET site', (done) => {
            chai.request(url)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.html
                    done()
                })
        })
    })
})
