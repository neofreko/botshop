module.exports.firstOfEntityRole = function(message, entity, role) {
    role = role || 'generic';

    //console.log(message)
    const slots = message.slots
    const entityValues = message.slots[entity]
    const valsForRole = entityValues ? entityValues.values_by_role[role] : null

    return valsForRole ? valsForRole[0] : null
}
