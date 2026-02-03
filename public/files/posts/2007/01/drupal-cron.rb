#!/usr/bin/ruby

# Initial draft version by D'Arcy Norman dnorman@darcynorman.net
# Idea and some code from a handy page by (some unidentified guy) at http://whytheluckystiff.net/articles/wearingRubySlippersToWork.html

require 'net/http'
require 'timeout';

# Set up the locations of all drupal installs to be handled - no trailing /
drupalinstalls = ['/opt/drupal-4.7.4', '/opt/drupal-5.0']

# Loop thru them
drupalinstalls.each do |drupalsitesdir|
  # Get the settings.php file
  Dir[drupalsitesdir + '/sites/*/settings.php'].each do |path|
    File.open(path) do |f|
      f.grep( /^\$base_url = / ) do |line|
        line = line.strip();
        baseurl = line.gsub('$base_url = \'', '')
        baseurl = baseurl.gsub('\';', '')
        baseurl = baseurl.gsub('  // NO trailing slash!', '')

        # Found a baseurl for this site
        if !baseurl.empty?
          cronurl = baseurl + "/cron.php"

          if !cronurl.empty?
            begin
              # Adjust this timeout - lower is better but make sure it is high enough for your sites
              timeout(120) do
                url = URI.parse(cronurl)
                req = Net::HTTP::Get.new(url.path)
                res = Net::HTTP.start(url.host, url.port) {|http|http.request(req)}
              end
            rescue TimeoutError
              puts "Timed Out on " + baseurl
            end
          end
        end
      end
    end
  end
end
