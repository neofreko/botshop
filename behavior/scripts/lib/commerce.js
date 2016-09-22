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
                return false
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
                let searchResult = {
                    keyword: client.getConversationState().keyword.value,
                }

                client.addResponse('app:response:name:commerce/search_result', searchResult)
                client.done()
            }
        })
    }
}