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
const Lab = require('lab');
const Code = require('code');
const lab = exports.lab = Lab.script();

var schema = Joi.object().keys({
   id: Joi.string().guid(),
   data: Joi.object().keys({
       name: Joi.object().keys({
         translate: Joi.boolean().required(),
         is_machine_translated: Joi.boolean().required(),
         is_dirty: Joi.boolean().required(),
         value: Joi.string().required()
       }).tags(['localizedString']).required(),
       nested: Joi.object().keys({
         nested_name: Joi.object().keys({
           translate: Joi.boolean().required(),
           is_machine_translated: Joi.boolean().required(),
           is_dirty: Joi.boolean().required(),
           value: Joi.string().required()
        }).tags(['localizedString']).required(),
       }),
       description: Joi.object().keys({
         translate: Joi.boolean().required(),
         is_machine_translated: Joi.boolean().required(),
         is_dirty: Joi.boolean().required(),
         value: Joi.string().required()
       }).tags(['localizedString']),
       is_active: Joi.boolean(),
       message: Joi.object().keys({
         translate: Joi.boolean().required(),
         is_machine_translated: Joi.boolean().required(),
         is_dirty: Joi.boolean().required(),
         value: Joi.string().required()
       }).tags(['localizedString']),
       images: Joi.array().items(Joi.string().guid()),
       ordinal: Joi.number().integer().min(0),
   }).required().meta({ className: "DataModel"}),
   created_on: Joi.date().timestamp(),
   updated_on: Joi.date().timestamp()
}).meta({ className: "DataRecord"});

var testModel = {
    id: '97170e81-8b55-4cad-8748-5a94658b91d6',
    data: {
      name: {
        translate: false,
        value: 'testing model name',
        is_dirty: false,
        is_machine_translated: true
      },
      nested: {
        nested_name: {
          translate: false,
          value: 'testing model nested name',
          is_dirty: false,
          is_machine_translated: true
        }
      },
      description: {
        translate: true,
        value: 'this is a description of the testing model',
        is_dirty: false,
        is_machine_translated: true
      },
      is_active: true,
      message: {
        translate: true,
        value: 'this is the message of the testing model',
        is_dirty: false,
        is_machine_translated: true
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

lab.experiment('Localize Joi Tests', () => {

  lab.test(`translate`, (done) => {

    // translate the object using supplied schema
    localize.translate(Joi.reach(schema, 'data'), testModel.data, 'en', 'zh-CN', (err, result) => {
      console.error(err);
      console.log(testModel);
      done();

    });

  });

  lab.test(`bad schema`, (done) => {

    // translate the object using supplied schema
    localize.translate(null, testModel.data, 'en', 'zh-CN', (err, result) => {
      console.error(err);
      console.log(testModel);
      done();

    });

  });

  lab.test(`no source language`, (done) => {

    // translate the object using supplied schema
    localize.translate(Joi.reach(schema, 'data'), testModel.data, null, 'zh-CN', (err, result) => {
      console.error(err);
      console.log(testModel);
      done();

    });

  });

  lab.test(`no source language`, (done) => {

    var testConfig = {
      translationProvider: 'bing'
    };
    var testLocalize = new Localize(testConfig);

    // translate the object using supplied schema
    testLocalize.translate(Joi.reach(schema, 'data'), testModel.data, 'en', 'zh-CN', (err, result) => {
      console.error(err);
      console.log(testModel);
      done();

    });

  });

});

