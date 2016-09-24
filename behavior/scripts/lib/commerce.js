'use strict'

let ichiba = require('./ichiba')
let util = require('./util')

module.exports = client => {
    return {

        collectKeyword: client.createStep({
            satisfied() {
                return Boolean(client.getConversationState().keyword) || Boolean(client.getConversationState().keyword_candidate)
            },

            extractInfo() {
                const keyword = util.firstOfEntityRole(client.getMessagePart(), 'keyword')

                if (keyword) {
                    client.updateConversationState({
                        keyword,
                    })

                    console.log('User provide keyword:', keyword.value)
                } else {
                    client.updateConversationState({
                        keyword_candidate: {
                            value: client.getMessagePart().content
                        },
                        keyword: {
                            value: client.getMessagePart().content
                        },
                    })
                }
            },


            prompt() {
                client.addResponse('app:response:name:prompt/keyword')

                client.done()
            }
        }),

        confirmKeyword: client.createStep({
            satisfied() {
                // only run when we are not sure
                return Boolean(client.getConversationState().keyword_candidate)
            },

            prompt() {
                let baseClassification = client.getMessagePart().classification.base_type.value
                if (baseClassification === 'affirmative') {
                    client.updateConversationState({
                        keyword: client.getConversationState().keyword_candidate,
                    })
                    return 'init.proceed'
                } else if (baseClassification === 'decline') {
                    client.updateConversationState({
                        keyword: null, // Clear the keyword so it's re-asked
                        keyword_candidate: null,
                    })

                    client.addResponse('app:response:name:prompt/keyword')
                    client.done()
                }

                client.addResponse('app:response:name:prompt/keyword_confirmation', {
                    keyword_candidate: client.getConversationState().keyword_candidate,
                })

                // If the next message is a 'decline', like 'don't know'
                // An 'affirmative', like 'yeah', or 'that's right'
                // or a ticker, the stream 'commerce' will be run
                client.expect('commerce', ['affirmative', 'decline', 'commerce_search'])
                client.done()
            }
        }),

        provideResult: client.createStep({
            satisfied() {
                return false
            },
            prompt() {
                let keyword = client.getConversationState().keyword.value
                    //client.addResponse('app:response:name:commerce/search_result', searchResult)
                ichiba(keyword, (res) => {
                    if (res) {
                        console.log(res)
                        client.addResponse('app:response:name:commerce/search_result', {
                            keyword
                        })
                        client.addCarouselListResponse(res)
                    } else {
                        client.addTextResponse('Sorry, I cannot found any item matching your query. Try something else')
                    }
                    client.done()
                })

                client.updateConversationState({
                    keyword: null,
                })
            }
        })
    }
}