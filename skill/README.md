### Alexa Tweet Skill

Alexaに「ツイログで行ってきます」「ツイログでただいま」と話しかけるとその時間をツイッターにつぶやきます。

#### Setting

1. [AWS Lambda](https://aws.amazon.com/jp/lambda/)にログインして新規に関数を作成します。
2. 環境変数に[Twitter Application Management](https://apps.twitter.com)から取得した`CONSUMER_KEY`と`CONSUMER_SECRET`を設定します。  
※以下のデプロイ手順はWindowsおよびawscli導入済みの環境限定
3. `deploy/deploy.properties.sample`をコピーして`deploy/deploy.properties`を作成し、`region`と`function`に1.で作成した関数の情報をそれぞれ設定します。
4. `npm run deploy`でAWS Lambdaへデプロイが行われます。
