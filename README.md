# localize-joi

> Translate your JSON using joi


###Build Status - Master
[ ![Codeship Status for monscierge/cms](https://codeship.com/projects/96ff1310-840a-0134-7db7-320d848032e5/status?branch=master)](https://codeship.com/projects/170446)

###Build Status - Develop
[ ![Codeship Status for monscierge/cms](https://codeship.com/projects/96ff1310-840a-0134-7db7-320d848032e5/status?branch=develop)](https://codeship.com/projects/170446)

## Add localizable string objects in your joi schema:

* translate, is_machine_translated, is_dirty, value, and language are all required properties
* localizedString is a required tag in order for translation to occur

```javascript
...
name: Joi.object().keys({
         translate: Joi.boolean().required(),
         is_machine_translated: Joi.boolean().required(),
         is_dirty: Joi.boolean().required(),
         value: Joi.string().required(),
         language: Joi.string().allow(null).required()
       }).tags(['localizedString'])
...
```
### translate 
a boolean indicating whether the localizableString should be translated
### is_machine_translated
a boolean indicated whether the localizableString should be translated by the translationProvider (i.e. Google)
### is_dirty
a boolean flag indicating whether the text has been changed since last translation
### value
string value to be translated
### language
source language (i.e. 'en') of the text to translate

## Provide configuration

(only Google Translate API is supported at this time)

```javascript
var config = {
  translationProvider: 'google',
  apiKey: 'yourGoogleApiKey'
};
```

## Initialize instance

```javascript
var Localize = require('localize-joi');
var localize = new Localize(config);
```

## Run translation

```javascript
localize.translate(joiSchema, jsonObject, 'zh-CN', (err, result) => {

  // result is your jsonObject with localizableString objects translated in Chinese

});
```

## Full example

```javascript
var config = {
  translationProvider: 'google',
  apiKey: 'yourGoogleApiKey'
};

var Localize = require('localize-joi');
var localize = new Localize(config);
var joi = require('joi');

var joiSchema = Joi.object().keys({
   id: Joi.string().guid(),
   data: Joi.object().keys({
       name: Joi.object().keys({
         translate: Joi.boolean().required(),
         is_machine_translated: Joi.boolean().required(),
         is_dirty: Joi.boolean().required(),
         value: Joi.string().required(),
         language: Joi.string().allow(null).required()
       }).tags(['localizedString']).required(),
       nested: Joi.object().keys({
         nested_name: Joi.object().keys({
           translate: Joi.boolean().required(),
           is_machine_translated: Joi.boolean().required(),
           is_dirty: Joi.boolean().required(),
           value: Joi.string().required(),
           language: Joi.string().allow(null).required()
        }).tags(['localizedString']).required(),
       }),
       description: Joi.object().keys({
         translate: Joi.boolean().required(),
         is_machine_translated: Joi.boolean().required(),
         is_dirty: Joi.boolean().required(),
         value: Joi.string().required(),
         language: Joi.string().allow(null).required()
       }).tags(['localizedString']),
       is_active: Joi.boolean(),
       message: Joi.object().keys({
         translate: Joi.boolean().required(),
         is_machine_translated: Joi.boolean().required(),
         is_dirty: Joi.boolean().required(),
         value: Joi.string().required(),
         language: Joi.string().allow(null).required()
       }).tags(['localizedString']),
       images: Joi.array().items(Joi.string().guid()),
       ordinal: Joi.number().integer().min(0),
   }).required().meta({ className: "DataModel"}),
   created_on: Joi.date().timestamp(),
   updated_on: Joi.date().timestamp()
}).meta({ className: "DataRecord"});

var jsonObject = {
    id: '97170e81-8b55-4cad-8748-5a94658b91d6',
    data: {
      name: {
        translate: false,
        value: 'testing model name',
        is_dirty: false,
        is_machine_translated: true,
        language: 'en'
      },
      nested: {
        nested_name: {
          translate: true,
          value: 'testing model nested name',
          is_dirty: false,
          is_machine_translated: true,
          language: 'en'
        }
      },
      description: {
        translate: true,
        value: 'this is a description of the testing model',
        is_dirty: false,
        is_machine_translated: true,
        language: null
      },
      is_active: true,
      message: {
        translate: true,
        value: 'this is the message of the testing model',
        is_dirty: false,
        is_machine_translated: false,
        language: 'en'
      },
      images: [
        '1892d407-28db-4c91-ad5b-bd2c596a201d',
        'edc9593f-6441-4e0d-94c3-c1b4ccd7d25d',
        'cdcd0518-86ba-45e8-a7d2-675867cab29a'
      ],
      ordinal: 0
    },
    created_on: new Date().getTime(),
    updated_on: new Date().getTime()
};

localize.translate(joiSchema, jsonObject, 'zh-CN', (err, result) => {

  console.log(result);
  // =>
  //  { name:
  //   { translate: false,
  //     value: 'testing model name',
  //     is_dirty: false,
  //     is_machine_translated: true,
  //     language: 'en' },
  //  nested:
  //   { nested_name:
  //      { translate: true,
  //        value: '测试模型嵌套名',
  //        is_dirty: false,
  //        is_machine_translated: true,
  //        language: 'zh-CN' } },
  //  description:
  //   { translate: true,
  //     value: '这是测试模型的描述',
  //     is_dirty: false,
  //     is_machine_translated: true,
  //     language: 'zh-CN' },
  //  is_active: true,
  //  message:
  //   { translate: true,
  //     value: 'this is the message of the testing model',
  //     is_dirty: false,
  //     is_machine_translated: false,
  //     language: 'en' },
  //  images:
  //   [ '1892d407-28db-4c91-ad5b-bd2c596a201d',
  //     'edc9593f-6441-4e0d-94c3-c1b4ccd7d25d',
  //     'cdcd0518-86ba-45e8-a7d2-675867cab29a' ],
  //  ordinal: 0 }

});

```
