let chai = require('chai')
let chaiHttp = require('chai-http')
let should = chai.should()
let config = require('config')
let urljoin = require('url-join')
let uri = (config.tomomaster || {}).uri
const SLASHED_NODES_THRESHOLD = 15
if (!uri) {
    return
}

chai.use(chaiHttp)
describe('TomoMaster', () => {
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

	describe('/GET masternodes', () => {
		it('it should GET masternodes', (done) => {
            let url = urljoin(uri, 'api/candidates/masternodes')
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
		it('it should GET crawler status', (done) => {
            let url = urljoin(uri, '/api/candidates/crawlStatus')
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
		it('check number of slashedMNs', (done) => {
                let url = urljoin(uri, '/api/candidates/slashedMNs')
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
		it('it should be masternode', (done) => {
                let address = '0x45b7bd987fa22c9bac89b71f0ded03f6e150ba31'
		if (NODE_ENV === 'testnet') {
		    address = '0xffc679dcdf444d2eeb0491a998e7902b411ccf20'
		}	
                let url = urljoin(uri, '/api/candidates/', address, 'isMasternode')
			chai.request(url)
				.get('/')
				.end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.equal(1, 'it is not a masternode')
                    done()
				})
		})
	})

})

