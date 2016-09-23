'use strict'
let util = require('./lib/util')
exports.handle = function handle(client) {

  const introduceSelf = client.createStep({
    satisfied() {
      return false
    },

    prompt() {
      let baseClassification = client.getMessagePart().classification.base_type.value
      let subType = client.getMessagePart().classification.sub_type.value
      let hello = 'Hello'
      
      if (baseClassification == 'greeting' && subType == 'temporal') {
        hello = client.getMessagePart().content
      }
      
      client.addTextResponse(`${hello}. I can help you search any e-commerce item\nTell me any keyword to look for`)
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