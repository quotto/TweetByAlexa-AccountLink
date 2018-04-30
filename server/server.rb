# encoding:utf-8
require 'rubygems'
require 'bundler/setup'
require 'oauth'
require 'sinatra/base'
require 'twitter'
require 'rack/ssl-enforcer'
require 'dotenv'

class Server < Sinatra::Base
    register React::Sinatra
    configure do
        React::Sinatra.configure do |config|
            # configures for bundled React.js
            config.use_bundled_react = true
            config.addon=true
            config.runtime="execjs"
            config.asset_path = '../public/*.js'
        end
    end
    Dotenv.load
    CALLBACK_URL    = ENV['CALLBACK_URL']
    set :session_secret, ENV['SESSION_SECRET']
    set :show_exceptions, true
    enable :sessions

    # use Rack::SslEnforcer
    use Rack::Session::Cookie, key: '_rack_session',
        path: '/',
        expire_after: 2_592_000, # In seconds
        secret: settings.session_secret

    get '/' do
        # component = ract_component('App',{test: "this is test string"},prerender: true)
        'Hello World'
    end

    get '/oauth/request_token' do
        session[:consumer_key]         = consumer_key
        session[:consumer_secret]      = consumer_secret
        request_token = consumer.get_request_token oauth_callback: CALLBACK_URL
        session[:request_token]        = request_token.token
        session[:request_token_secret] = request_token.secret
        session[:state]                = params[:state]
        session[:client_id]            = params[:client_id]
        session[:vendor_id]            = vendor_id
        session[:redirect_uri]         = params[:redirect_uri]
        puts request_token
        redirect request_token.authorize_url
    end

    get '/oauth/callback' do
        puts 'call oauth/callback'
        request_token = OAuth::RequestToken.new consumer,
        session[:request_token],
        session[:request_token_secret]
        access_token = access_token(request_token)
        puts access_token.inspect
        url = redirect_url(access_token)
        puts url
        redirect url
    end

    private

    def consumer
        @consumer ||= OAuth::Consumer.new consumer_key,
        consumer_secret,
        {:site => 'https://api.twitter.com'}
    end

    def vendor_id
        params[:vendor_id] || ENV['VENDOR_ID']
    end


    def consumer_key
        params[:consumer_key] || ENV['CONSUMER_KEY']
    end

    def consumer_secret
        params[:consumer_secret] || ENV['CONSUMER_SECRET']
    end

    def access_token(request_token)
        @access_token ||= request_token.get_access_token oauth_verifier: params[:oauth_verifier]
    end

    def redirect_url(access_token)
        "#{session[:redirect_uri]}" \
        "#state=#{session[:state]}" \
        "&access_token=#{access_token.token},#{access_token.secret}" \
        "&client_id=#{session[:client_id]}" \
        '&token_type=Bearer'
    end
end
