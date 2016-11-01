/**
 * Created by jonathanslominski on 11/1/16.
 */
var exports = module.exports = {};

exports.googleTranslateWithSource = (apiKey, text, sourceLanguage, targetLanguage, next) => {

  var googleTranslate = require('google-translate')(apiKey);

  googleTranslate.translate(text, sourceLanguage, targetLanguage, function (err, translation) {

    return next(err, translation);

  });
};

exports.googleTranslateWithoutSource = (apiKey, text, targetLanguage, next) => {

  var googleTranslate = require('google-translate')(apiKey);

  googleTranslate.translate(text, targetLanguage, function (err, translation) {

    return next(err, translation);

  });
};
