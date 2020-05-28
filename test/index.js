afterEach(function() {
    if (this.currentTest.state === 'failed') {
        console.log('test result', this.currentTest.err)
    }
})
