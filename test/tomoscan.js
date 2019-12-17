let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let config = require('config')
let urljoin = require('url-join')

chai.use(chaiHttp)
describe('TomoScan', () => {
	describe('/GET site', () => {
		it('it should GET site', (done) => {
            let url = urljoin(config.get('tomoscan.uri'))
			chai.request(url)
				.get('/')
				.end((err, res) => {
					res.should.have.status(200)
					res.should.be.html
					done()
				})
		})
	})

	describe('/GET txs', () => {
		it('it should GET site', (done) => {
            let url = urljoin(config.get('tomoscan.uri'), 'api/txs')
			chai.request(url)
				.get('/')
				.end((err, res) => {
					res.should.have.status(200)
					res.should.be.json
					done()
				})
		})
	})
})
