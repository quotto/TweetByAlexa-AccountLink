### Alexa Twitter OAuth account linking server

AlexaスキルからTwitterのアカウントリンクを行うため、OAuth2.0とOAuth1.0をトンネリングするサーバープログラムです。

#### Server Setup

1. [Twitter Application Management](https://apps.twitter.com/) から新規にアプリケーションを登録して、`CONSUMER_KEY`と`CONSUMER_SECRET`を取得します。この時必ず`Callback URL`を登録してください。
2. `.env.example`をコピーして`.env`を作成します。
3. 1.で取得した`CONSUMER_KEY`と`CONSUMER_SECRET`をそれぞれ`.env`に設定します。
4. `.env`の`CALLBACK_URL`を`https://サーバ名/oauth/callback`に書き換えます。
5. rubyと諸々のgemを導入します。（`Gemfile`参照）
6. `server`ディレクトリ直下に`certs`ディレクトリを作成し、サーバ署名書と秘密鍵を格納します。
6. `bundle exec rackup`を実行します。
