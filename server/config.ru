# encoding:utf-8
$stdout.sync = true
ENV['RACK_ENV'] = 'production'
require 'webrick'
require 'webrick/https'
require File.expand_path '../server.rb', __FILE__

use Rack::SslEnforcer
Rack::Handler::WEBrick.run Sinatra::Application,{
    :Port => 443,
    :BindAddress => '0.0.0.0',
    :SSLEnable => true,
    :SSLCertificate => OpenSSL::X509::Certificate.new(File.open('./certs/server.crt').read),
    :SSLPrivateKey => OpenSSL::PKey::RSA.new(File.open('./certs/server.key').read)
}
