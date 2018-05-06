'use strict';

const Alexa = require('alexa-sdk');

const Twitter = require('twitter');

const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

const JSTOffset = 60 * 9 * 60 * 1000; // JST時間を求めるためのオフセット

const ErrorMessage = '<say-as interpret-as="interjection">ごめんなさい、</say-as>つぶやけませんでした。';

const AccountLinkMessage = 'スキルを利用するためにアカウントリンクからTwitterでのログインを許可してください';

let AccessToken="";

function calculateJSTTime() {
    var localdt = new Date(); // 実行サーバのローカル時間
    var jsttime = localdt.getTime() + (localdt.getTimezoneOffset() * 60 * 1000) + JSTOffset;
    var dt = new Date(jsttime);
    return dt;
}

function getStrJSTTime(){
    var dt = calculateJSTTime();
    var stringTime = dt.getFullYear() + "年" + (dt.getMonth()+1) + "月" + dt.getDate() + "日 " + dt.getHours() + "時" + dt.getMinutes() + "分" + dt.getSeconds() + "秒 ";
    return stringTime;
}

function get_oauth_param() {
    // アクセストークンの取得
    var accessToken = AccessToken;
    return accessToken ? accessToken.split(',') : accessToken
}

/**
tweet_message 年月日時分秒の後ろにつけるツイートメッセージ
alexa_message Alexaからのメッセージ
**/
function doEmit(handler,tweet_message,alexa_message) {
    // アクセストークンの取得
    const accessToken = handler.event.session.user.accessToken;
    var accessKey = accessToken ? accessToken.split(',') : accessToken;
    if(accessKey == null) {
        // トークン未定義の場合はユーザーに許可を促す
        handler.emit(':tellWithLinkAccountCard',AccountLinkMessage);
        return;
    }

    var stringTime = getStrJSTTime();
    var message = stringTime + tweet_message + "（Alexaスキルでつぶやいています）";
    Twitter.postTweet(message,accessKey[0],accessKey[1]).then(()=>{
        handler.emit(':tell',`つぶやきました。${alexa_message}`);
    },(error)=>{
        console.log(error);
        handler.emit(':tell',ErrorMessage);
    })
}

const handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');
    },
    'GoOutTweet' : function() {
        doEmit(this,"に出かけました。",'<say-as interpret-as="interjection">いってらっしゃい。</say-as>');
    },
    'ComeHomeTweet' : function() {
        doEmit(this,"に帰ってきました。",'<say-as interpret-as="interjection">おかえりなさい。</say-as>');
    },
    'BeginEatTweet' : function() {
        doEmit(this,"に食事を始めました。","どうぞ、召しあがれ。");
    },
    'EndEatTweet' : function() {
        doEmit(this,"に食事を終わりました。","お味はいかがでしたか？");
    },
    'GoodMorningTweet' : function() {
        doEmit(this,"に起きました。",'<say-as interpret-as="interjection">おはようございます。</say-as>');
    },
    'GoodNightTweet' : function() {
        doEmit(this,"に就寝しました。",'<say-as interpret-as="interjection">おやすみなさい。</say-as>');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = '<say-as interpret-as="interjection">「おはよう」「いってきます」「いただきます」</say-as>、など話しかけると、その時間をツイートします。';
        const reprompt = speechOutput;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function(){
    }
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    // AccessToken = event.session.user.accessToken
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};
