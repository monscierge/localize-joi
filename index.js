/**
 * Created by jonathanslominski on 10/25/16.
 */
const Joi = require('joi');
const _ = require('lodash');
const translationProviders = require('./translationProviders');

var translationProvider;
var apiKey;

/**
 * Constructor for Localize-Joi
 * @param config - contains translationProvider (i.e. 'google') and apiKey properties
 * @constructor
 */
function Localize(config) {
  translationProvider = config.translationProvider;
  apiKey = config.apiKey;
}

/**
 * Exported function - translates provided JSON to target language using provided Joi schema
 * @param schema - Joi schema describing JSON object
 * @param object - JSON object to be translated
 * @param targetLanguage - string defining target language i.e. 'fr'
 * @param next - callback
 */
Localize.prototype.translate = function translate(schema, object, targetLanguage, next) {

  Joi.validate(object, schema, function (err, result) {

    if (err === null) {

      var clonedSchema = _.cloneDeep(schema)

      stripSchema(clonedSchema, function (err, hasChildren) {

        Joi.validate(object, clonedSchema, function (err, result) {

          translateObject(result, translationProvider, apiKey, targetLanguage, function (err, obj) {
            object = _.merge(object, obj);
            return next(err, { translatedObject: object, strippedObject: obj });
          });

        });

      });

    } else {
      return next(err, { translatedObject: object, strippedObject: null });
    }

  });

}

/**
 * Exported function - translates dirty JSON to target language using provided Joi schema
 * @param schema - Joi schema describing JSON object
 * @param object - JSON object to be translated
 * @param targetLanguage - string defining target language i.e. 'fr'
 * @param next - callback
 */
Localize.prototype.updateTranslation = function updateTranslation(schema, nativeObject, translationObject, targetLanguage, next) {

  Joi.validate(nativeObject, schema, function (err, result) {

    if (err === null) {

      var clonedSchema = _.cloneDeep(schema)

      stripSchema(clonedSchema, function (err, hasChildren) {

        Joi.validate(nativeObject, clonedSchema, function (err, nativeResult) {

            translationObject = _.mergeWith(translationObject, nativeResult, function(objValue, srcValue, key) {

              if (objValue.is_dirty !== undefined && srcValue.is_dirty != undefined) {
                return _.assign(objValue, _.omit(srcValue, ['value']));
              } else {
                return undefined;
              }
            });

            updateTranslateObject(translationObject, translationProvider, apiKey, targetLanguage, function (err, obj) {
              //translationObject = _.merge(translationObject, obj);
              return next(err, { strippedObject: obj });
            });

        });

      });

    } else {
      return next(err, { strippedObject: translationObject });
    }

  });

}

/**
 * Pares down the provided schema into a schema that only includes localizableString objects
 * @param schema - Joi schema to strip down
 * @param next - callback
 * @returns boolean indicating whether the schema contains localizableString children (for recursion)
 */
function stripSchema(schema, next) {

  var hasLocalizedChildren = false;

  _.each(schema._inner.children, function (childProperty) {

    if (_.indexOf(childProperty.schema._tags, 'localizedString') > -1 && _.difference(_.map(childProperty.schema._inner.children, 'key'), ['language', 'translate', 'is_machine_translated', 'value', 'is_dirty']).length == 0) {
      //console.log(`keep ${childProperty.key}!`);
      hasLocalizedChildren = true;
    } else {

      stripSchema(childProperty.schema, function (err, hasChildren) {

        if (hasChildren === true) {
          //console.log(`keep ${childProperty.key}!`);
          hasLocalizedChildren = true;
        } else {
          //console.log(`strip ${childProperty.key}!`);
          childProperty['schema']['_flags']['strip'] = true;
        }
      });
    }

  });

  return next(null, hasLocalizedChildren);
}

/**
 * Calls the translation service to translate into target language
 * @param obj - text to translate
 * @param translator - string defining provider i.e. 'google'
 * @param apiKey - api key of translation provider service
 * @param targetLanguage - string defining target language i.e. 'fr'
 * @param next - callback
 */
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
                  //obj[k].language = targetLanguage;
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
                  //obj[k].language = targetLanguage;
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

/**
 * Calls the translation service to translate dirty strings into target language
 * @param obj - text to translate
 * @param translator - string defining provider i.e. 'google'
 * @param apiKey - api key of translation provider service
 * @param targetLanguage - string defining target language i.e. 'fr'
 * @param next - callback
 */
function updateTranslateObject(obj, translator, apiKey, targetLanguage, next) {

  var errors = [];
  var requests = _.keys(obj).map((k) => {

    return new Promise((resolve) => {

      var diff = _.difference(_.keys(obj[k]), ['language', 'translate', 'is_machine_translated', 'value', 'is_dirty']);

      if (diff.length === 0) {

        if (obj[k].translate === true && obj[k].is_machine_translated === true && obj[k].is_dirty === true) {

          if (translator.toLowerCase() === 'google') {

            if (!obj[k].language || obj[k].language === null) {

              translationProviders.googleTranslateWithoutSource(apiKey, obj[k].value, targetLanguage, function (err, translation) {

                if (err === null) {
                  obj[k].value = translation.translatedText;
                  obj[k].is_dirty = false;
                  //obj[k].language = targetLanguage;
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
                  obj[k].is_dirty = false;
                  //obj[k].language = targetLanguage;
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
        updateTranslateObject(obj[k], translator, apiKey, targetLanguage, function (err, result) {

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