'use strict';

const Alexa = require('alexa-sdk');

const Twitter = require('twitter');

const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

const JSTOffset = 60 * 9 * 60 * 1000; // JST時間を求めるためのオフセット

const ErrorMessage = '<say-as interpret-as="interjection">ごめんなさい、</say-as>つぶやけませんでした。';

const AccountLinkMessage = 'スキルを利用するためにTwitterでのログインを許可してください';

function calculateJSTTime() {
    var localdt = new Date(); // 実行サーバのローカル時間
    var jsttime = localdt.getTime() + (localdt.getTimezoneOffset() * 60 * 1000) + JSTOffset;
    var dt = new Date(jsttime);
    return dt;
}

const handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');
    },
    'GoOutTweet' : function() {
        // アクセストークンの取得
        var accessToken = this.event.session.user.accessToken;
        if(accessToken == null) {
            // トークン未定義の場合はユーザーに許可を促す
            this.emit(':tellWithLinkAccountCard',AccountLinkMessage);
            return;
        }

        var accessKey = accessToken.split(',');
        var dt = calculateJSTTime();
        var stringTime = dt.getFullYear() + "年" + (dt.getMonth()+1) + "月" + dt.getDate() + "日 " + dt.getHours() + "時" + dt.getMinutes() + "分" + dt.getSeconds() + "秒 ";
        var message = stringTime + "に出かけました。（Alexaスキルでつぶやいています）";
        Twitter.postTweet(message,accessKey[0],accessKey[1]).then(()=>{
            this.emit(':tell','つぶやきました。<say-as interpret-as="interjection">いってらっしゃい。</say-as>');
        },(error)=>{
            console.log(error);
            this.emit(':tell',ErrorMessage);
        })
    },
    'ComeHomeTweet' : function() {
        // アクセストークンの取得
        var accessToken = this.event.session.user.accessToken;
        if(accessToken == null) {
            // トークン未定義の場合はユーザーに許可を促す
            this.emit(':tellWithLinkAccountCard',AccountLinkMessage);
            return;
        }

        var accessKey = accessToken.split(',');
        var dt = calculateJSTTime();
        var stringTime = dt.getFullYear() + "年" + (dt.getMonth()+1) + "月" + dt.getDate() + "日 " + dt.getHours() + "時" + dt.getMinutes() + "分" + dt.getSeconds() + "秒 ";
        var message = stringTime + "に帰ってきました。（Alexaスキルでつぶやいています）";
        Twitter.postTweet(message,accessKey[0],accessKey[1]).then(()=>{
            this.emit(':tell','つぶやきました。<say-as interpret-as="interjection">おかえりなさい。</say-as>');
        },(error)=>{
            console.log(error);
            this.emit(':tell',ErrorMessage);
        })
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = '<say-as interpret-as="interjection">「いってきます」「ただいま」</say-as>、とつぶやくと、その時間をツイートします。';
        const reprompt = speechOutput;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};
