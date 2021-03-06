'use strict';

const Alexa = require('alexa-sdk');

const Twitter = require('twitter');

const APP_ID = "amzn1.ask.skill.4cea545f-7381-42e5-9f85-e3200caba288";

const JSTOffset = 60 * 9 * 60 * 1000; // JST時間を求めるためのオフセット

const ErrorMessage = '<say-as interpret-as="interjection">ごめんなさい、</say-as>つぶやけませんでした。';

const AccountLinkMessage = 'スキルを利用するためにはTwitterでの連携許可が必要です。' +
                           'Alexaアプリのホーム画面に表示されたアカウントリンク用カードから、設定を行ってください。';

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
timestamp 0:ツイートに年月日時分秒をつける、1:つけない
**/
function doEmit(handler,tweet_message,alexa_message,timestamp=1) {
    // アクセストークンの取得
    const accessToken = handler.event.session.user.accessToken;
    var accessKey = accessToken ? accessToken.split(',') : accessToken;
    if(accessKey == null) {
        // トークン未定義の場合はユーザーに許可を促す
        handler.emit(':tellWithLinkAccountCard',AccountLinkMessage);
        return;
    }

    let message = timestamp ? getStrJSTTime() : '';
    message += tweet_message + "（Alexaスキルでつぶやいています）";
    Twitter.postTweet(message,accessKey[0],accessKey[1]).then(()=>{
        handler.emit(':tell',`つぶやきました。${alexa_message}`);
    },(error)=>{
        console.log(error);
        handler.emit(':tell',ErrorMessage);
    })
}

const handlers = {
    'LaunchRequest': function () {
        const speechOutput = '現在の行動をツイートします。<say-as interpret-as="interjection">「おはよう」「いってきます」「いただきます」</say-as>など、話しかけてください。';
        this.emit(':ask',speechOutput);
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
        doEmit(this,"に食事を終えました。","お腹いっぱいですね！");
    },
    'GoodMorningTweet' : function() {
        doEmit(this,"に起きました。",'<say-as interpret-as="interjection">おはようございます。</say-as>');
    },
    'GoodNightTweet' : function() {
        doEmit(this,"に就寝しました。",'<say-as interpret-as="interjection">おやすみなさい。</say-as>');
    },
    'FreeTweet' : function() {
        const dialogState = this.event.request.dialogState;
        if (dialogState != "COMPLETED"){
            this.emit(':delegate');
        } else {
            const tweetMessage = this.event.request.intent.slots.Tweet.value;
            doEmit(this,tweetMessage,"",0);
        }
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = '現在の行動をツイートします。' +
                             '<say-as interpret-as="interjection">「おはよう」「おやすみ」「いってきます」「ただいま」「いただきます」「ごちそうさま」</say-as>' +
                             'の、どれかのフレーズを話しかけてください。または、「投稿して」、と話しかけると、その後に喋った内容をそのままツイートできます。';
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
