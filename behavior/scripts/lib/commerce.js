let ichiba = require('./ichiba')

const firstOfEntityRole = function(message, entity, role) {
    role = role || 'generic';

    const slots = message.slots
    const entityValues = message.slots[entity]
    const valsForRole = entityValues ? entityValues.values_by_role[role] : null

    return valsForRole ? valsForRole[0] : null
}

module.exports = client => {
    return {

        collectKeyword: client.createStep({
            satisfied() {
                return client.getConversationState().keyword
            },

            extractInfo() {
                const keyword = firstOfEntityRole(client.getMessagePart(), 'keyword')

                if (keyword) {
                    client.updateConversationState({
                        keyword,
                    })

                    console.log('User provide keyword:', keyword.value)
                }
            },


            prompt() {
                client.addResponse('app:response:name:prompt/keyword')
                client.done()
            }
        }),

        provideResult: client.createStep({
            satisfied() {
                return false
            },

            prompt() {
                //client.addResponse('app:response:name:commerce/search_result', searchResult)
                ichiba(client.getConversationState().keyword.value, (res) => {
                    if (res) {
                        console.log(res)
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