### Alexa Tweet Skill

Alexaに「ツイログで行ってきます」「ツイログでただいま」と話しかけるとその時間をツイッターにつぶやきます。

#### Setting

1. [AWS Lambda](https://aws.amazon.com/jp/lambda/)にログインして新規に関数を作成します。
2. `skill.zip`をアップロードします。
3. 環境変数に[Twitter Application Management](https://apps.twitter.com)から取得した`CONSUMER_KEY`と`CONSUMER_SECRET`を設定します。
