let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomodex || {}).uri

if (!uri) {
    return
}

chai.use(chaiHttp)
describe('TomoDex', () => {
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

	describe('/GET trades', () => {
		it('it should GET trades', (done) => {
            let url = urljoin(uri, 'api/trades')
			chai.request(url)
				.get('')
				.end((err, res) => {
					res.should.have.status(200)
					res.should.be.json
					done()
				})
		})
	})

	describe('/GET pairs', () => {
		it('it should GET trades', (done) => {
            let url = urljoin(uri, 'api/pairs')
			chai.request(url)
				.get('')
				.end((err, res) => {
					res.should.have.status(200)
					res.should.be.json
					done()
				})
		})
	})
})
