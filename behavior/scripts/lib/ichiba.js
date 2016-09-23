'use strict'

const request = require('request')

let carouselify = (ichibaResult) => {
    return {
        items: ichibaResult.Items.slice(0, 5).map((item) => {
            let data = item.Item
            
            return {
                'media_url': data.mediumImageUrls[0].imageUrl,
                'media_type': 'image/jpeg',
                // description is overrated
                //'description': data.itemCaption.substring(0, 100),
                title: data.itemName.substring(0, 80),
                actions: [{
                    type: 'link',
                    text: 'View',
                    uri: data.affiliateUrl ? data.affiliateUrl : data.itemUrl,
                }]
            }
        })
    }

}

module.exports = (keyword, next) => {
    let requestUrl = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20140222?format=json&keyword=${encodeURIComponent(keyword)}&affiliateId=14c57ba7.c92fb9a6.14c57ba8.efedfbe5&applicationId=1075485740553130539`
    request(requestUrl, (err, res, body) => {
        if (err) {
            throw new Error(err)
        }

        if (body) {
            const parsedResult = JSON.parse(body)
            next(carouselify(parsedResult))
        } else {
            next(false)
        }
    })
}