exports.handle = function handle(client) {

  const sayHello = client.createStep({
    satisfied() {
      return Boolean(client.getConversationState().helloSent)
    },

    prompt() {
      client.addTextResponse('Hello world!')
      client.addTextResponse('I don\'t know much yet, but if you need some pointers on where to get started you should check out the docs – http://docs.init.ai/?key=c0fb-addc-119f')
      client.addTextResponse('Otherwise, head over to Teach (up at the top) and start teaching me!')
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

  const handleGreeting = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      client.addTextResponse('Hello world, I mean human')
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
      greeting: handleGreeting,
      main: 'commerce',
      hi: [sayHello],
      end: [untrained],
      commerce: [commerce.collectKeyword, commerce.provideResult],
    }
  })
}