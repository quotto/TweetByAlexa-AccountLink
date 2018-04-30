"use strict";

const AWS = require('aws-sdk');

const https = require('https');
const request = require('request');
const crypto = require('crypto');

const url='https://api.twitter.com/1.1/statuses/update.json';

function postTweet(message,access_token,access_token_secret) {
    return new Promise((resolve,reject) => {
        const include_entities = {
            status: message,
            // include_entities: true
        };
        const params = {
            oauth_consumer_key: process.env.CONSUMER_KEY,
            oauth_token: access_token,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: (() => {
                const date = new Date();
                return Math.floor(date.getTime() / 1000);
            })(),
            oauth_nonce: (() => {
                const date = new Date();
                return date.getTime();
            })(),
            oauth_version: '1.0'
        };

        let auth_params = Object.assign(include_entities,params);

        let encoded_auth_params = Object.keys(auth_params).map(function(key){
            return `${encodeURIComponent(key)}=${encodeURIComponent(this[key])}`;
        },auth_params);
        encoded_auth_params.sort((a,b) => {
            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });

        const sigunature_base = `${encodeURIComponent('POST')}&${encodeURIComponent(url)}&${encodeURIComponent(encoded_auth_params.join('&'))}`;

        const keyOfSign = `${encodeURIComponent(process.env.CONSUMER_SECRET)}&${encodeURIComponent(access_token_secret)}`;
        const signature = crypto.createHmac('sha1',keyOfSign).update(sigunature_base).digest('base64');
        params.oauth_signature = signature;

        let authorization = Object.keys(params).map(function(key) {
            return `${encodeURIComponent(key)}="${encodeURIComponent(this[key])}"`;
        },params);
        authorization.sort((a,b) => {
            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });


        const headers = {
            Authorization: `OAuth ${authorization.join(', ')}`
        };

        const options = {
            url: url+"?status="+encodeURIComponent(message),
            headers: headers
        };

        request.post(options ,(error,response,body) => {
            if(error) {
                reject("reject:"+error);
            } else if(response.statusCode!=200) {
                reject("reject:statusCode="+response.statusCode);
            } else {
                resolve();
            }
        });
    });
};

module.exports.postTweet=postTweet;
