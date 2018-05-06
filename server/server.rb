# encoding:utf-8
require 'rubygems'
require 'bundler/setup'
require 'oauth'
require 'sinatra/base'
require 'twitter'
require 'rack/ssl-enforcer'
require 'dotenv'

class Server < Sinatra::Base
    Dotenv.load
    CALLBACK_URL    = ENV['CALLBACK_URL']
    set :session_secret, ENV['SESSION_SECRET']
    set :show_exceptions, true
    enable :sessions

    use Rack::Session::Cookie, key: '_rack_session',
        path: '/',
        expire_after: 2_592_000, # In seconds
        secret: settings.session_secret

    get '/' do
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
        redirect request_token.authorize_url
    end

    get '/oauth/callback' do
        request_token = OAuth::RequestToken.new consumer,
        session[:request_token],
        session[:request_token_secret]
        access_token = access_token(request_token)
        url = redirect_url(access_token)
        redirect url
    end

    private

    def consumer
        @consumer ||= OAuth::Consumer.new consumer_key,
        consumer_secret,
        {:site => 'https://api.twitter.com'}
    end

    def vendor_id
        params[:vendor_id]
    end


    def consumer_key
        params[:consumer_key] || ENV['TWITTER_CONSUMER_KEY']
    end

    def consumer_secret
        params[:consumer_secret] || ENV['TWITTER_CONSUMER_SECRET']
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
