let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomowallet || {}).uri

if (!uri) {
    return
}

chai.use(chaiHttp)
describe('TomoWallet', () => {
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
		it('it should GET site', (done) => {
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
})
