# localize-joi

## Add localizable string objects in your joi schema:

* translate, is_machine_translated, is_dirty, value, and language are all required properties
* localizedString is a required tag in order for translation to occur

name: Joi.object().keys({
         translate: Joi.boolean().required(),
         is_machine_translated: Joi.boolean().required(),
         is_dirty: Joi.boolean().required(),
         value: Joi.string().required(),
         language: Joi.string().allow(null).required()
       }).tags(['localizedString'])

## Provide configuration

(only Google Translate API is supported at this time)

var config = {
  translationProvider: 'google',
  apiKey: 'yourGoogleApiKey'
};

## Initialize instance
var Localize = require('localize-joi');
var localize = new Localize(config);

## Run translation
localize.translate(joiSchema, jsonObject, 'zh-CN', (err, result) => {

  // do something here

});