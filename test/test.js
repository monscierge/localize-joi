/**
 * Created by jonathanslominski on 10/25/16.
 */
var config = {
  translationProvider: 'google',
  apiKey: 'AIzaSyAvHprYyzBs6KoJ0XAAmpWEnsEfi2RfRDA'
};
const Localize = require('../index');
var localize = new Localize(config);
const Joi = require('joi');

var schema = Joi.object().keys({
   ref_id: Joi.string().guid(),
   parents: Joi.object().pattern(/place|feature/, Joi.array().items(Joi.string().guid())).meta({ className: "ParentIdModels"}),
   menu: Joi.object().keys({
       name: Joi.object().keys({ translate: Joi.boolean().required(), is_machine_translated: Joi.boolean().required(), is_dirty: Joi.boolean().required(), value: Joi.string().required() }).tags(['localizedString']).required(),
       description: Joi.object().keys({ translate: Joi.boolean().required(), is_machine_translated: Joi.boolean().required(), is_dirty: Joi.boolean().required(), value: Joi.string().required() }).tags(['localizedString']),
       is_active: Joi.boolean(),
       welcome_message: Joi.object().keys({ translate: Joi.boolean().required(), is_machine_translated: Joi.boolean().required(), is_dirty: Joi.boolean().required(), value: Joi.string().required() }).tags(['localizedString']),
       fk_request_template: Joi.string().guid(),
       fk_logo: Joi.string().guid(),
       images: Joi.array().items(Joi.string().guid()),
       gratuity: Joi.object().keys({
           percent: Joi.number().precision(2).min(0.00).max(100.00),
           partyMin: Joi.number().min(0)
       }).meta({ className: "GratuityModel"}),
       ordinal: Joi.number().integer().min(0),
   }).required().meta({ className: "MenuModel"}),
   created_on: Joi.date().timestamp(),
   updated_on: Joi.date().timestamp(),
   links: Joi.object().meta({ className: "LinksModel"})
}).meta({ className: "MenuRecord"});

var testModel = {
    ref_id: '97170e81-8b55-4cad-8748-5a94658b91d6',
    parents: {
      "feature": [
        'e91563c3-e052-45f0-8971-5ea27f51cb7e',
        '97170e81-8b55-4cad-8748-5a94658b91d6'
      ],
      "place": [
        'e91563c3-e052-45f0-8971-5ea27f51cb7e',
        '97170e81-8b55-4cad-8748-5a94658b91d6'
      ]
    },
    menu: {
      name: { translate: false, value: 'Test Menu Object', is_dirty: false, is_machine_translated: true },
      description: { translate: true, value: 'This is a description of the Test Menu Object', is_dirty: false, is_machine_translated: true },
      is_active: true,
      welcome_message: { translate: true, value: 'Welcome to the Test Menu Object', is_dirty: false, is_machine_translated: true },
      fk_request_template: '720cfd35-7d11-4aed-9404-2f84beab38fc',
      fk_logo: '1892d407-28db-4c91-ad5b-bd2c596a201d',
      images: ['1892d407-28db-4c91-ad5b-bd2c596a201d',
        'edc9593f-6441-4e0d-94c3-c1b4ccd7d25d',
        'cdcd0518-86ba-45e8-a7d2-675867cab29a'],
      gratuity: {
        percent: 18,
        partyMin: 6
      },
      ordinal: 0
    },
    created_on: new Date().getTime(),
    updated_on: new Date().getTime()
  };

  var x = JSON.stringify(testModel.menu);

// translate the object using supplied schema
localize.translate(Joi.reach(schema, 'menu'), testModel.menu, 'en', 'zh-CN', (err, result) => {
  console.log(testModel);
});

