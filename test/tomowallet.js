let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let moment = require('moment')
let uri = (config.tomowallet || {}).uri

chai.use(chaiHttp)
describe('TomoWallet', () => {
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
    
    describe('/GET candidate', () => {
        it('it should GET candidate', (done) => {
            if (process.env.NODE_ENV === 'testnet') return done()
            let url = urljoin(uri, 'api/candidates?limit=10&page=1')
            chai.request(url)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    done()
                })
        })
    })

    describe('/GET reward', () => {
        it('it should GET site', (done) => {
            if (process.env.NODE_ENV !== 'mainnet') return done()
            let url = urljoin(uri, `api/rewards/0x8a124F2BC942f1E14174885c750A905555E88CC9?page=1&limit=1&type=EPOCH`)
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json

                    let rewardedAt = res.body[0].rewardedAt
                    expect(moment().diff(moment.unix(rewardedAt), 'hours')).to.be.below(2, moment.unix(rewardedAt).utc().format())
                    done()
                })
        })
    })
})
