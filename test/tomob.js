let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomob || {}).uri

chai.use(chaiHttp)
describe('TomoB', () => {
    if (!uri) {
        return
    }

    describe('/GET site', () => {
        let url = uri
        it(`/GET ${url}`, (done) => {
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
        let url = urljoin(uri, '/api/deposit/monitor/status')
        it(`GET ${url}`, (done) => {
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
        let url = urljoin(uri, '/api/withdraw/monitor/status')
        it(`GET ${url}`, (done) => {
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
/*
    describe('/GET check producer', () => {
        let url = urljoin('https://dex.binance.org/api/v1/transactions?address=bnb19kknvzy2wg6al7n43ref9pxz6cyzkq347230q6&txType=TRANSFER&txAsset=TOMOB-4BC&side=RECEIVE')
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    if (res.body.tx.length === 0) return done()
                    let txAge = res.body.tx[0].txAge
                    if (txAge > 500) {
                        let txHash = res.body.tx[0].txHash
                        url = urljoin(uri, `/api/withdraw/getByBnbTransaction/${txHash}`)
                        return chai.request(url)
                            .get('')
                            .end((err, resW) => {
                                resW.should.have.status(200)
                                resW.should.be.json
                                expect(resW.body.bnbTransaction).to.equal(txHash, 'TxHash not found')
                                done()
                            })
                    } else {
                        done()
                    }
                })
        })
    })
*/
})
