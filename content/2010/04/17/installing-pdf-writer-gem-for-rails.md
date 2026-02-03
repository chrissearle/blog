---
title: Installing pdf-writer gem for rails
date: 2010-04-17 09:07:18 +0200
---

## Install gem

     ~/src/rails $ gem install pdf-writer
     Successfully installed rubyforge-2.0.4
     Successfully installed hoe-2.6.0
     Successfully installed color-1.4.1
     Successfully installed transaction-simple-1.4.0
     Successfully installed pdf-writer-1.1.8
     5 gems installed
     Installing ri documentation for rubyforge-2.0.4...
     Installing ri documentation for hoe-2.6.0...
     Installing ri documentation for color-1.4.1...
     Installing ri documentation for transaction-simple-1.4.0...
     Installing ri documentation for pdf-writer-1.1.8...
     Installing RDoc documentation for rubyforge-2.0.4...
     Installing RDoc documentation for hoe-2.6.0...
     Installing RDoc documentation for color-1.4.1...
     Installing RDoc documentation for transaction-simple-1.4.0...
     Installing RDoc documentation for pdf-writer-1.1.8...

## Create rails project

This is rails 2.3.5

     ~/src/rails $ rails test
      create
      create  app/controllers
      create  app/helpers
      create  app/models
      create  app/views/layouts
      create  config/environments
      create  config/initializers
      create  config/locales
      create  db
      create  doc
      create  lib
      create  lib/tasks
      create  log
      create  public/images
      create  public/javascripts
      create  public/stylesheets
      create  script/performance
      create  test/fixtures
      create  test/functional
      create  test/integration
      create  test/performance
      create  test/unit
      create  vendor
      create  vendor/plugins
      create  tmp/sessions
      create  tmp/sockets
      create  tmp/cache
      create  tmp/pids
      create  Rakefile
      create  README
      create  app/controllers/application_controller.rb
      create  app/helpers/application_helper.rb
      create  config/database.yml
      create  config/routes.rb
      create  config/locales/en.yml
      create  db/seeds.rb
      create  config/initializers/backtrace_silencers.rb
      create  config/initializers/inflections.rb
      create  config/initializers/mime_types.rb
      create  config/initializers/new_rails_defaults.rb
      create  config/initializers/session_store.rb
      create  config/environment.rb
      create  config/boot.rb
      create  config/environments/production.rb
      create  config/environments/development.rb
      create  config/environments/test.rb
      create  script/about
      create  script/console
      create  script/dbconsole
      create  script/destroy
      create  script/generate
      create  script/runner
      create  script/server
      create  script/plugin
      create  script/performance/benchmarker
      create  script/performance/profiler
      create  test/test_helper.rb
      create  test/performance/browsing_test.rb
      create  public/404.html
      create  public/422.html
      create  public/500.html
      create  public/index.html
      create  public/favicon.ico
      create  public/robots.txt
      create  public/images/rails.png
      create  public/javascripts/prototype.js
      create  public/javascripts/effects.js
      create  public/javascripts/dragdrop.js
      create  public/javascripts/controls.js
      create  public/javascripts/application.js
      create  doc/README_FOR_APP
      create  log/server.log
      create  log/production.log
      create  log/development.log
      create  log/test.log
    ~/src/rails $

## Config rails

Edit config/environment.rb and add

    config.gem "pdf-writer", :version => "1.1.8"

## Test

     ~/src/rails/test $ script/server
     => Booting Mongrel
     => Rails 2.3.5 application starting on http://0.0.0.0:3000
     no such file to load -- pdf-writer
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `gem_original_require'
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:156:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:521:in `new_constants_in'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:156:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/rails/gem_dependency.rb:208:in `load'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:307:in `load_gems'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:307:in `each'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:307:in `load_gems'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:164:in `process'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:113:in `send'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:113:in `run'
     /Users/chris/src/rails/test/config/environment.rb:9
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `gem_original_require'
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:156:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:521:in `new_constants_in'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:156:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/commands/server.rb:84
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `gem_original_require'
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `require'
     script/server:3
     no such file to load -- pdf-writer
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `gem_original_require'
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:156:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:521:in `new_constants_in'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:156:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/rails/gem_dependency.rb:208:in `load'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:307:in `load_gems'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:307:in `each'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:307:in `load_gems'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:169:in `process'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:113:in `send'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/initializer.rb:113:in `run'
     /Users/chris/src/rails/test/config/environment.rb:9
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `gem_original_require'
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:156:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:521:in `new_constants_in'
     /opt/local/lib/ruby/gems/1.8/gems/activesupport-2.3.5/lib/active_support/dependencies.rb:156:in `require'
     /opt/local/lib/ruby/gems/1.8/gems/rails-2.3.5/lib/commands/server.rb:84
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `gem_original_require'
     /opt/local/lib/ruby/site_ruby/1.8/rubygems/custom_require.rb:31:in `require'
     script/server:3
     Missing these required gems:
       pdf-writer  = 1.1.8

     You're running:
       ruby 1.8.7.174 at /opt/local/bin/ruby
       rubygems 1.3.5 at /Users/chris/.gem/ruby/1.8, /opt/local/lib/ruby/gems/1.8

     Run `rake gems:install` to install the missing gems.

## Check that gem is present

     ~/src/rails/test $ gem list pdf-writer

     *** LOCAL GEMS ***

     pdf-writer (1.1.8)

## Next step?

No idea
