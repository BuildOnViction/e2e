let chai = require('chai')
let moment = require('moment')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let BigNumber = require('bignumber.js')
let TomoXJS = require('tomoxjs')
let Stats = require('../stats/tomodex')
let uri = (config.tomodex || {}).uri
const request = require('request')
let pairs = []

chai.use(chaiHttp)
describe('MM', () => {
    if (!uri || process.env.NODE_ENV !== 'mainnet') {
        return
    }

    describe('/GET trader by pair', () => {
        let url = urljoin(uri, 'api/pairs')
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    pairs = res.body.data
                    done()
                })
        })
    })

    describe('/GET trader 1d by pair', () => {
        it(`GET`, (done) => {
            let map = pairs.map(p => {
                let url = urljoin(uri, `stats/trades/users/count?relayerAddress=0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84&duration=1d&baseToken=${p.baseTokenAddress}&quoteToken=${p.quoteTokenAddress}`)
                return new Promise((resolve, reject) =>  {
                    chai.request(url)
                        .get('')
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            Stats.saveTotalUsers({
                                pair: p.baseTokenSymbol + p.quoteTokenSymbol,
                                duration: '24h',
                                env: process.env.NODE_ENV,
                                value: res.body.data.activeUser
                            })
                            return resolve()
                        })
                })
            })
            Promise.all(map).then(() => {
                done()
            }).catch(() => done())
        })
    })

    describe('/GET trader 7d by pair', () => {
        it(`GET`, (done) => {
            let map = pairs.map(p => {
                let url = urljoin(uri, `stats/trades/users/count?relayerAddress=0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84&duration=7d&baseToken=${p.baseTokenAddress}&quoteToken=${p.quoteTokenAddress}`)
                return new Promise((resolve, reject) =>  {
                    chai.request(url)
                        .get('')
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            Stats.saveTotalUsers({
                                pair: p.baseTokenSymbol + p.quoteTokenSymbol,
                                duration: '7d',
                                env: process.env.NODE_ENV,
                                value: res.body.data.activeUser
                            })
                            return resolve()
                        })
                })
            })
            Promise.all(map).then(() => {
                done()
            }).catch(() => done())
        })
    })

    describe('/GET trader 30d by pair', () => {
        it(`GET`, (done) => {
            let map = pairs.map(p => {
                let url = urljoin(uri, `stats/trades/users/count?relayerAddress=0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84&duration=30d&baseToken=${p.baseTokenAddress}&quoteToken=${p.quoteTokenAddress}`)
                return new Promise((resolve, reject) =>  {
                    chai.request(url)
                        .get('')
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            Stats.saveTotalUsers({
                                pair: p.baseTokenSymbol + p.quoteTokenSymbol,
                                duration: '30d',
                                env: process.env.NODE_ENV,
                                value: res.body.data.activeUser
                            })
                            return resolve()
                        })
                })
            })
            Promise.all(map).then(() => {
                done()
            }).catch(() => done())
        })
    })

    describe('/GET trader all by pair', () => {
        it(`GET`, (done) => {
            let map = pairs.map(p => {
                let url = urljoin(uri, `stats/trades/users/count?relayerAddress=0xdE8Bb39eC2DAC88d3F87B62E18CC3A89E298bc84&baseToken=${p.baseTokenAddress}&quoteToken=${p.quoteTokenAddress}`)
                return new Promise((resolve, reject) =>  {
                    chai.request(url)
                        .get('')
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.should.be.json
                            Stats.saveTotalUsers({
                                pair: p.baseTokenSymbol + p.quoteTokenSymbol,
                                duration: 'all',
                                env: process.env.NODE_ENV,
                                value: res.body.data.activeUser
                            })
                            return resolve()
                        })
                })
            })
            Promise.all(map).then(() => {
                done()
            }).catch(() => done())
        })
    })
})
