let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
chai.use(chaiHttp)
describe('DApp', () => {
    let dapps = config.dapps
    dapps.forEach(dapp => {
        describe(`/GET site ${dapp}`, () => {
            it('it should GET site', (done) => {
                let url = dapp
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
})
