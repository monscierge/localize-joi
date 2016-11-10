/**
 * Created by jonathanslominski on 10/25/16.
 */
var config = {
  translationProvider: 'google',
  apiKey: 'garbageKey'
};
const proxyquire = require('proxyquire');
var providerStub = {};
var Localize = proxyquire('../index', {'./translationProviders': providerStub } );
var localize = new Localize(config);
const Joi = require('joi');
const Lab = require('lab');
const Code = require('code');
const lab = exports.lab = Lab.script();
const translationProviders = require('../translationProviders');
const _ = require('lodash');

var schema = Joi.object().keys({
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

var testModel = {
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

var dirtyTestModel = {
    id: '97170e81-8b55-4cad-8748-5a94658b91d6',
    data: {
      name: {
        translate: false,
        value: 'dirty testing model name',
        is_dirty: true,
        is_machine_translated: true,
        language: 'en'
      },
      nested: {
        nested_name: {
          translate: true,
          value: 'dirty testing model nested name',
          is_dirty: true,
          is_machine_translated: true,
          language: 'en'
        }
      },
      description: {
        translate: true,
        value: 'dirty this is a description of the testing model',
        is_dirty: true,
        is_machine_translated: true,
        language: null
      },
      is_active: true,
      message: {
        translate: true,
        value: 'dirty this is the message of the testing model',
        is_dirty: true,
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

var translationModel = {
    name: {
      translate: false,
      value: 'translated testing model name',
      is_dirty: false,
      is_machine_translated: true,
      language: 'en'
    },
    nested: {
      nested_name: {
        translate: true,
        value: 'translated testing model nested name',
        is_dirty: false,
        is_machine_translated: true,
        language: 'en'
      }
    },
    description: {
      translate: true,
      value: 'translated this is a description of the testing model',
      is_dirty: false,
      is_machine_translated: true,
      language: null
    },
    message: {
      translate: true,
      value: 'translated this is the message of the testing model',
      is_dirty: false,
      is_machine_translated: false,
      language: 'en'
    }
  };

providerStub.googleTranslateWithoutSource = (apiKey, text, targetLanguage, next) => {
  return next(null, {translatedText: 'translatedWithoutSource', originalText: text, detectedSourceLanguage: 'en'});
};

providerStub.googleTranslateWithSource = (apiKey, text, sourceLanguage, targetLanguage, next) => {
  return next(null, {translatedText: 'translatedWithSource', originalText: text});
};

lab.experiment('Localize Joi Tests', () => {

  lab.test(`google translation provider - with source`, (done) => {

    translationProviders.googleTranslateWithSource(config.apiKey, 'hello', 'en', 'de', function(err, result) {
      Code.expect(err).to.not.be.null();
      done();
    });

  });

  lab.test(`google translation provider - without source`, (done) => {

    translationProviders.googleTranslateWithoutSource(config.apiKey, 'hello', 'de', function(err, result) {
      Code.expect(err).to.not.be.null();
      done();
    });

  });

  lab.test(`translate`, (done) => {

    // translate the object using supplied schema
    localize.translate(Joi.reach(schema, 'data'), _.cloneDeep(testModel.data), 'zh-CN', (err, result) => {

      Code.expect(err).to.be.null();
      Code.expect(result.translatedObject.name.value).to.be.equal('testing model name');
      Code.expect(result.translatedObject.nested.nested_name.value).to.be.equal('translatedWithSource');
      Code.expect(result.translatedObject.description.value).to.be.equal('translatedWithoutSource');
      Code.expect(result.translatedObject.message.value).to.be.equal('this is the message of the testing model');
      done();

    });

  });

  lab.test(`translate dirty object`, (done) => {

    // translate the object using supplied schema
    localize.updateTranslation(Joi.reach(schema, 'data'), _.cloneDeep(dirtyTestModel.data), _.cloneDeep(translationModel), 'zh-CN', (err, result) => {

      Code.expect(err).to.be.null();
      Code.expect(result.strippedObject.name.value).to.be.equal('translated testing model name');
      Code.expect(result.strippedObject.nested.nested_name.value).to.be.equal('translatedWithSource');
      Code.expect(result.strippedObject.description.value).to.be.equal('translatedWithoutSource');
      Code.expect(result.strippedObject.message.value).to.be.equal('translated this is the message of the testing model');
      done();

    });

  });

  lab.test(`bad schema`, (done) => {

    // translate the object using supplied schema
    localize.translate(null, _.cloneDeep(testModel.data), 'zh-CN', (err, result) => {

      Code.expect(err).to.not.be.null();
      Code.expect(result.translatedObject.name.value).to.be.equal('testing model name');
      Code.expect(result.translatedObject.nested.nested_name.value).to.be.equal('testing model nested name');
      Code.expect(result.translatedObject.description.value).to.be.equal('this is a description of the testing model');
      Code.expect(result.translatedObject.message.value).to.be.equal('this is the message of the testing model');

      localize.updateTranslation(null, _.cloneDeep(dirtyTestModel.data), _.cloneDeep(translationModel), 'zh-CN', (err, result) => {

        Code.expect(err).to.not.be.null();
        Code.expect(result.strippedObject.name.value).to.be.equal('translated testing model name');
        Code.expect(result.strippedObject.nested.nested_name.value).to.be.equal('translated testing model nested name');
        Code.expect(result.strippedObject.description.value).to.be.equal('translated this is a description of the testing model');
        Code.expect(result.strippedObject.message.value).to.be.equal('translated this is the message of the testing model');
        done();

      });

    });

  });

  lab.test(`unsupported translation provider`, (done) => {

    var testConfig = {
      translationProvider: 'bing'
    };
    var testLocalize = new Localize(testConfig);

    // translate the object using supplied schema
    testLocalize.translate(Joi.reach(schema, 'data'), testModel.data, 'zh-CN', (err, result) => {

      Code.expect(err).to.be.null();
      Code.expect(result.translatedObject.name.value).to.be.equal('testing model name');
      Code.expect(result.translatedObject.nested.nested_name.value).to.be.equal('testing model nested name');
      Code.expect(result.translatedObject.description.value).to.be.equal('this is a description of the testing model');
      Code.expect(result.translatedObject.message.value).to.be.equal('this is the message of the testing model');

      testLocalize.updateTranslation(Joi.reach(schema, 'data'), _.cloneDeep(dirtyTestModel.data), _.cloneDeep(translationModel), 'zh-CN', (err, result) => {

        Code.expect(err).to.be.null();
        Code.expect(result.strippedObject.name.value).to.be.equal('translated testing model name');
        Code.expect(result.strippedObject.nested.nested_name.value).to.be.equal('translated testing model nested name');
        Code.expect(result.strippedObject.description.value).to.be.equal('translated this is a description of the testing model');
        Code.expect(result.strippedObject.message.value).to.be.equal('translated this is the message of the testing model');
        done();

      });

    });

  });

  lab.test(`google errors`, (done) => {

    var errorProviderStub = {};
    var ErrorLocalize = proxyquire('../index', {'./translationProviders': errorProviderStub } );
    var errorLocalize = new ErrorLocalize(config);

    errorProviderStub.googleTranslateWithoutSource = (apiKey, text, targetLanguage, next) => {
      return next('Fake error', null);
    };

    errorProviderStub.googleTranslateWithSource = (apiKey, text, sourceLanguage, targetLanguage, next) => {
      return next('Fake error', null);
    };

    // translate the object using supplied schema
    errorLocalize.translate(Joi.reach(schema, 'data'), _.cloneDeep(testModel.data), 'zh-CN', (err, result) => {

      Code.expect(err).to.not.be.null();
      Code.expect(result.translatedObject.name.value).to.be.equal('testing model name');
      Code.expect(result.translatedObject.nested.nested_name.value).to.be.equal('testing model nested name');
      Code.expect(result.translatedObject.description.value).to.be.equal('this is a description of the testing model');
      Code.expect(result.translatedObject.message.value).to.be.equal('this is the message of the testing model');

      errorLocalize.updateTranslation(Joi.reach(schema, 'data'), _.cloneDeep(dirtyTestModel.data), _.cloneDeep(translationModel), 'zh-CN', (err, result) => {

        Code.expect(err).to.not.be.null();
        Code.expect(result.strippedObject.name.value).to.be.equal('translated testing model name');
        Code.expect(result.strippedObject.nested.nested_name.value).to.be.equal('translated testing model nested name');
        Code.expect(result.strippedObject.description.value).to.be.equal('translated this is a description of the testing model');
        Code.expect(result.strippedObject.message.value).to.be.equal('translated this is the message of the testing model');
        done();

      });

    });

  });

});

