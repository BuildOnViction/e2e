let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let expect = chai.expect
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomoissuer || {}).uri

if (!uri) {
    return
}

chai.use(chaiHttp)
describe('TomoIssuer', () => {
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
})
