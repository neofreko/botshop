'use strict'

let ichiba = require('./ichiba')
let util = require('./util')

module.exports = client => {
    return {

        collectKeyword: client.createStep({
            satisfied() {
                return Boolean(client.getConversationState().keyword)
            },

            extractInfo() {
                const keyword = util.firstOfEntityRole(client.getMessagePart(), 'keyword')

                if (keyword) {
                    client.updateConversationState({
                        keyword,
                    })

                    console.log('User provide keyword:', keyword.value)
                }
            },


            prompt() {
                client.addResponse('app:response:name:prompt/keyword')
                client.expect(client.getStreamName(), ['decline', 'commerce_query'])
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
                        client.addResponse('app:response:name:commerce/search_result', {keyword})
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