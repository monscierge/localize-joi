/**
 * Created by jonathanslominski on 10/25/16.
 */
const Joi = require('joi');
const _ = require('lodash');
var translationProvider;
var apiKey;

function Localize(config) {
  translationProvider = config.translationProvider;
  apiKey = config.apiKey;
}

Localize.prototype.translate = function translate(schema, object, sourceLanguage, targetLanguage, next) {

  Joi.validate(object, schema, function (err, result) {

    if (err === null) {

      var clonedSchema = _.cloneDeep(schema)

      stripSchema(clonedSchema, function (err, hasChildren) {

        Joi.validate(object, clonedSchema, function (err, result) {

          //if (err === null) {
            translateObject(result, translationProvider, apiKey, sourceLanguage, targetLanguage, function (err, obj) {
              object = _.merge(object, obj);
              return next(err, object);
            });
          // } else {
          //   return next(err, object);
          // }

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

    if (_.indexOf(childProperty.schema._tags, 'localizedString') > -1 && _.difference(_.map(childProperty.schema._inner.children, 'key'), ['translate', 'is_machine_translated', 'value', 'is_dirty']).length == 0) {
      console.log(`keep ${childProperty.key}!`)
      hasLocalizedChildren = true;
    } else {

      stripSchema(childProperty.schema, function (err, hasChildren) {

        if (hasChildren === true) {
          console.log(`keep ${childProperty.key}!`)
          hasLocalizedChildren = true;
        } else {
          console.log(`strip ${childProperty.key}!`)
          childProperty['schema']['_flags']['strip'] = true;
        }
      });
    }

  });

  return next(null, hasLocalizedChildren);
}

function translateObject(obj, translator, apiKey, sourceLanguage, targetLanguage, next) {

  var requests = _.keys(obj).map((k) => {

    return new Promise((resolve) => {

      if (_.indexOf(_.keys(obj[k]), 'is_dirty') > -1 && _.indexOf(_.keys(obj[k]), 'value') > -1 && _.indexOf(_.keys(obj[k]), 'is_machine_translated') > -1 && _.indexOf(_.keys(obj[k]), 'translate') > -1) {

        if (obj[k].translate === true && obj[k].is_machine_translated === true) {

          if (translator.toLowerCase() === 'google') {

            var googleTranslate = require('google-translate')(apiKey);

            if (!sourceLanguage || sourceLanguage === null) {

              googleTranslate.translate(obj[k].value, targetLanguage, function (err, translation) {

                if (err === null) {
                  obj[k].value = translation.translatedText;
                }

                resolve();
              });

            } else {

              googleTranslate.translate(obj[k].value, sourceLanguage, targetLanguage, function (err, translation) {

                if (err === null) {
                  obj[k].value = translation.translatedText;
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
        translateObject(obj[k], translator, apiKey, sourceLanguage, targetLanguage, function (err, result) {

          obj[k] = result;
          resolve();

        });

      }

    });

  });

  Promise.all(requests).then(function () {

    return next(null, obj);

  });

}

module.exports = Localize;