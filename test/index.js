const request = require('request')
const urljoin = require('url-join')

afterEach(async function() {
    if (this.currentTest.state === 'failed') {
        let slackUri = process.env.SLACK_URI
        let p = new Promise(async (resolve, reject) => {
            let url = urljoin(slackUri)
            let data = {
                text: JSON.stringify(this.currentTest)
            }
            let options = {
                method: 'POST',
                url: url,
                json: true,
                headers: {
                    'content-type': 'application/json'
                },
                body: data
            }
            request(options, (error, response, body) => {
                if (error) {
                    return reject(error)
                }
                if (response.statusCode !== 200 && response.statusCode !== 201) {
                    return reject(body)
                }

                let ret = body.result || {}
                ret.capacity = new BigNumber(ret.capacity).dividedBy(1e+18).toString(10)
                return resolve(ret)

            })

        })
        await p
    }
})
