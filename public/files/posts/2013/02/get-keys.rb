#!/usr/bin/env ruby

require 'oauth'

if ARGV.length < 2
  puts "get_keys.rb CONSUMER_TOKEN CONSUMER_SECRET"
  exit
end

consumer_token = ARGV[0]
consumer_secret = ARGV[1]

consumer = OAuth::Consumer.new(
  consumer_token,
  consumer_secret,
  {
    :site => 'https://api.twitter.com/',
    :request_token_path => '/oauth/request_token',
    :access_token_path => '/oauth/access_token',
    :authorize_path => '/oauth/authorize'
  })
 
request_token = consumer.get_request_token

puts request_token.authorize_url()

puts "Go to the displayed URL - login and authorize - when you get a PIN code - come back here and type it in followed by <return>"

pin = STDIN.gets.chomp

access_token = request_token.get_access_token(:oauth_verifier => pin)

puts "Consumer Token:  #{consumer_token}"
puts "Consumer Secret: #{consumer_secret}"
puts "Access Token:    #{access_token.token}"
puts "Access Secret:   #{access_token.secret}"