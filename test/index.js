const request = require('request')
const urljoin = require('url-join')
const Stats = require('../stats/product')
const path = require('path')

afterEach(async function() {

    let product = path.basename(this.currentTest.file, '.js').toUpperCase()
    let env = (process.env.NODE_ENV || 'empty').toUpperCase()
    await Stats.push({
        table: 'statuses',
        product: product,
        env: env,
        status: this.currentTest.state,
        value: 1
    })

    if (this.currentTest.state === 'failed') {
        let slackUri = process.env.SLACK_URI
        let p = new Promise((resolve, reject) => {
            let url = urljoin(slackUri)
            let data = {
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `
\`\`\`
Environment: ${(process.env.NODE_ENV || '').toUpperCase()}
Product: ${product}
Title: ${this.currentTest.title}
Error Message: ${this.currentTest.err.message}
Test File: ${this.currentTest.file}
\`\`\`
                            `
                        }
                    }
                ]

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
          
                return resolve(body)
            })

        })
        await p
    }
})
