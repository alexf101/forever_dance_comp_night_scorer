#!/usr/bin/env ruby

PROJECTS = {
  production: "1AREIfuQvYZz2YKqdoPCJkIpEBTbWCOdkgEvmWPCjfEokYkTtYsI8WpXa",
  testing: "1-mV2oqpIzrynxw6ww8Fl18UPtqVfPK_e56IDo5tLRf5Z2E6uJgaXzXrS",
  snapshot: "1_DWZ1wZA55vYDH-XaMam_fV_OyunJJr77O9rNowNt3nVMHQViMSl4JFO",
}
# Usage: ruby set_project.rb [production|testing|snapshot]
# Example: ruby set_project.rb production
# This script sets the Google Apps Script project ID in the .clasp.json file
# based on the provided argument (production, testing, or snapshot).
require 'json'

if ARGV.empty? || !PROJECTS.key?(ARGV[0].to_sym)
  puts "Error: Please provide a valid argument (production, testing, or snapshot)."
  exit 1
end

JSON.parse(File.read(".clasp.json")) do |config|
  config["scriptId"] = PROJECTS[ARGV[0].to_sym]
end

File.write(".clasp.json", JSON.pretty_generate(config))
puts "Project ID set to #{PROJECTS[ARGV[0].to_sym]} for #{ARGV[0]}."