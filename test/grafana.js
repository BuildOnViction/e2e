let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.grafana || {}).uri
let Stats = require('../stats/grafana')

chai.use(chaiHttp)
describe('Grafana', () => {
    if (!uri || process.env.NODE_ENV !== 'mainnet') {
        return
    }

    describe('/GET DEX revenue 24H', () => {
        let url = urljoin(config.get('grafana.uri'), '/api/datasources/proxy/5/query')
        let address = '0xdbd09c24a86f5475871f95b0fbc7fa5d1822f9ab'
        let q = {
            q: `SELECT last("value") - first("value") FROM "balances" WHERE ("address" = '${address}') AND ("type" = 'usd') AND ("tokenSymbol" = 'total') AND time >= now() - 1d`,
            db: 'tomodex',
            epoch: 'ms'
        }
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('/')
                .set('Authorization', process.env.GRAFANA_API_KEY || config.get('grafana.apiKey'))
                .query(q)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let value = res.body.results[0].series[0].values[0][1]
                    Stats.saveRevenue({
                        address: address,
                        type: '24h',
                        value: value
                    })

                    done()
                })
        })
    })

    describe('/GET DEX revenue 7D', () => {
        let url = urljoin(config.get('grafana.uri'), '/api/datasources/proxy/5/query')
        let address = '0xdbd09c24a86f5475871f95b0fbc7fa5d1822f9ab'
        let q = {
            q: `SELECT last("value") - first("value") FROM "balances" WHERE ("address" = '${address}') AND ("type" = 'usd') AND ("tokenSymbol" = 'total') AND time >= now() - 7d`,
            db: 'tomodex',
            epoch: 'ms'
        }
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('/')
                .set('Authorization', process.env.GRAFANA_API_KEY || config.get('grafana.apiKey'))
                .query(q)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let value = res.body.results[0].series[0].values[0][1]
                    Stats.saveRevenue({
                        address: address,
                        type: '7d',
                        value: value
                    })

                    done()
                })
        })
    })

    describe('/GET DEX revenue 30D', () => {
        let url = urljoin(config.get('grafana.uri'), '/api/datasources/proxy/5/query')
        let address = '0xdbd09c24a86f5475871f95b0fbc7fa5d1822f9ab'
        let q = {
            q: `SELECT last("value") - first("value") FROM "balances" WHERE ("address" = '${address}') AND ("type" = 'usd') AND ("tokenSymbol" = 'total') AND time >= now() - 30d`,
            db: 'tomodex',
            epoch: 'ms'
        }
        it(`GET ${url}`, (done) => {
            chai.request(url)
                .get('/')
                .set('Authorization', process.env.GRAFANA_API_KEY || config.get('grafana.apiKey'))
                .query(q)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.should.be.json
                    let value = res.body.results[0].series[0].values[0][1]
                    Stats.saveRevenue({
                        address: address,
                        type: '30d',
                        value: value
                    })

                    done()
                })
        })
    })
})
