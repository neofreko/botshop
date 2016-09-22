exports.handle = function handle(client) {

  const introduceSelf = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().helloSent)
    },

    prompt() {
      client.addTextResponse('Hello human')
      client.addTextResponse('I can help you search any e-commerce item')
      client.addTextResponse('Tell me any keyword to look for')
      client.updateConversationState({
        helloSent: true
      })
      client.done()
    }
  })

  const untrained = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addTextResponse('Apologies, but this app needs to go back to school!')
      client.done()
    }
  })

  const handleGoodbye = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addTextResponse('See you later!')
      client.done()
    }
  })

  const commerce = require('./lib/commerce')(client)

  client.runFlow({
    classifications: {
      goodbye: 'goodbye',
      greeting: 'greeting',
      commerce: 'commerce'
    },
    autoResponses: {
      // configure responses to be automatically sent as predicted by the machine learning model
    },
    streams: {
      goodbye: handleGoodbye,
      greeting: [introduceSelf],
      hi: introduceSelf,
      main: 'commerce',
      end: [untrained],
      commerce: [commerce.collectKeyword, commerce.provideResult],
    }
  })
}