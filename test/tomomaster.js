let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let config = require('config')
let urljoin = require('url-join')

chai.use(chaiHttp)
describe('TomoMaster', () => {
	describe('/GET site', () => {
		it('it should GET site', (done) => {
            let url = urljoin(config.get('tomomaster.uri'))
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
            let url = urljoin(config.get('tomomaster.uri'), 'api/candidates/masternodes')
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
