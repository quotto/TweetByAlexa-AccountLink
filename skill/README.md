### Alexa Tweet Skill

Alexaに「ツイログで行ってきます」「ツイログでただいま」と話しかけるとその時間をツイッターにつぶやきます。

#### 依存モジュール
以下のソフトウェアが必要です
- python3
- awscli

#### AWS Lambdaの設定

1. `skill`ディレクトリで`npm install`を実行してください。

2. [AWS Lambda](https://aws.amazon.com/jp/lambda/)にログインして新規に関数を作成します。

3. 環境変数に[Twitter Application Management](https://apps.twitter.com)から取得した`CONSUMER_KEY`と`CONSUMER_SECRET`を設定します。  

#### テスト
1. 'env.json'にTwitter Application Managementで確認した`CONSUMER_KEY`と`CONSUMER_SECRET`を設定してください。
```
{
    "CONSUMER_KEY":"Your CONSUMER_KEY",
    "CONSUMER_SECRET":"Your CONSUMER_SECRET"
}
```

1. 必要に応じてテストするJSONファイル内のaccess_tokenを書き換えます。（`test.template.json`ファイルをコピーして使うと便利です）
```
……
"attributes": {},
"user": {
  "userId": "amazon user id",
  "accessToken": "twitter access token"
}
"request": {
  "type": "IntentRequest",
  "requestId": "EdwRequestId.requestId",
  "intent": {
    "name": "IntentName",
    "slots": {}
  },
……
```

1. `skill/sam`ディレクトリにてJSONファイルを指定して`sam local invoke`を実行します。
```
$　..\src\node_modules\aws-sam-local\node_modules\.bin\sam.
exe local invoke -e .\startsession.json -n .\env.json
```

#### デプロイ
1. `deploy/deploy.properties.sample`をコピーして`deploy/deploy.properties`を作成し、`region`と`function`に作成したLambda関数の情報をそれぞれ設定します。
```
[setting]
region=ap-northeast-1
function=TweetByAlexaForAccountLink
```

2. `npm run deploy`でAWS Lambdaへデプロイが行われます。
