let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomomaster || {}).uri

const SLASHED_NODES_THRESHOLD = 25

chai.use(chaiHttp)
describe('TomoMaster', () => {
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

    describe('/GET masternodes', () => {
        let url = urljoin(uri, 'api/candidates/masternodes')
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    done()
                })
        })
    })

    describe('/GET crawler status', () => {
        let url = urljoin(uri, '/api/candidates/crawlStatus')
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    res.body.should.be.equal(true)
                    done()
                })
        })
    })

    describe('/GET slashedMNs', () => {
        let url = urljoin(uri, '/api/candidates/slashedMNs')
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    res.body.total.should.be.below(SLASHED_NODES_THRESHOLD, 'too many slashed masternodes')
                    done()
                })
        })
    })

    describe('/GET isMasternode', () => {
        ((config.tomomaster || {}).masternodes || []).forEach((address) => {
            let url = urljoin(uri, '/api/candidates/', address, 'isMasternode')
            it(`GET ${url}`, (done) => {
                chai.request(url)
                    .get('/')
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.body.should.be.equal(1, `${address} it is not a masternode`)
                    })
                done()
            })
        })
    })

})

