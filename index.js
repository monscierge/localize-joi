/**
 * Created by jonathanslominski on 10/25/16.
 */
const Joi = require('joi');
const _ = require('lodash');
const translationProviders = require('./translationProviders');

var translationProvider;
var apiKey;

function Localize(config) {
  translationProvider = config.translationProvider;
  apiKey = config.apiKey;
}

Localize.prototype.translate = function translate(schema, object, targetLanguage, next) {

  Joi.validate(object, schema, function (err, result) {

    if (err === null) {

      var clonedSchema = _.cloneDeep(schema)

      stripSchema(clonedSchema, function (err, hasChildren) {

        Joi.validate(object, clonedSchema, function (err, result) {

          translateObject(result, translationProvider, apiKey, targetLanguage, function (err, obj) {
            object = _.merge(object, obj);
            return next(err, object);
          });

        });

      });

    } else {
      return next(err, object);
    }

  });

}

function stripSchema(schema, next) {

  var hasLocalizedChildren = false;

  _.each(schema._inner.children, function (childProperty) {

    if (_.indexOf(childProperty.schema._tags, 'localizedString') > -1 && _.difference(_.map(childProperty.schema._inner.children, 'key'), ['language', 'translate', 'is_machine_translated', 'value', 'is_dirty']).length == 0) {
      console.log(`keep ${childProperty.key}!`);
      hasLocalizedChildren = true;
    } else {

      stripSchema(childProperty.schema, function (err, hasChildren) {

        if (hasChildren === true) {
          console.log(`keep ${childProperty.key}!`);
          hasLocalizedChildren = true;
        } else {
          console.log(`strip ${childProperty.key}!`);
          childProperty['schema']['_flags']['strip'] = true;
        }
      });
    }

  });

  return next(null, hasLocalizedChildren);
}

function translateObject(obj, translator, apiKey, targetLanguage, next) {

  var errors = [];
  var requests = _.keys(obj).map((k) => {

    return new Promise((resolve) => {

      var diff = _.difference(_.keys(obj[k]), ['language', 'translate', 'is_machine_translated', 'value', 'is_dirty']);

      if (diff.length == 0) {

        if (obj[k].translate === true && obj[k].is_machine_translated === true) {

          if (translator.toLowerCase() === 'google') {

            if (!obj[k].language || obj[k].language === null) {

              translationProviders.googleTranslateWithoutSource(apiKey, obj[k].value, targetLanguage, function (err, translation) {

                if (err === null) {
                  obj[k].value = translation.translatedText;
                  obj[k].language = targetLanguage;
                } else {
                  obj[k].value = obj[k].value;
                  errors.push(err);
                }

                resolve();
              });

            } else {

              translationProviders.googleTranslateWithSource(apiKey, obj[k].value, obj[k].language, targetLanguage, function (err, translation) {

                if (err === null) {
                  obj[k].value = translation.translatedText;
                  obj[k].language = targetLanguage;
                } else {
                  obj[k].value = obj[k].value;
                  errors.push(err);
                }

                resolve();
              });

            }

          } else {
            resolve();
          }

        } else {
          resolve();
        }

      } else {
        translateObject(obj[k], translator, apiKey, targetLanguage, function (err, result) {

          obj[k] = result;
          resolve();

        });

      }

    });

  });

  Promise.all(requests).then(function () {

    if (errors.length > 0) {
      return next(errors, obj);
    } else {
      return next(null, obj);
    }


  });

}

module.exports = Localize;