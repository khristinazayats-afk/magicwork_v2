require 'xcodeproj'
project_path = 'ios/Runner.xcodeproj'
project = Xcodeproj::Project.open(project_path)

project.targets.each do |target|
  target.build_configurations.each do |config|
    # Force reset search paths to clean inherited versions
    config.build_settings['LIBRARY_SEARCH_PATHS'] = ['$(inherited)']
    config.build_settings['FRAMEWORK_SEARCH_PATHS'] = ['$(inherited)']
    config.build_settings['HEADER_SEARCH_PATHS'] = ['$(inherited)']
    
    # Remove any stray toolchain path from OTHER_LDFLAGS
    if config.build_settings['OTHER_LDFLAGS']
      if config.build_settings['OTHER_LDFLAGS'].is_a?(Array)
        config.build_settings['OTHER_LDFLAGS'].reject! { |flag| flag.include?('cryptexd') }
      elsif config.build_settings['OTHER_LDFLAGS'].is_a?(String)
        config.build_settings['OTHER_LDFLAGS'] = config.build_settings['OTHER_LDFLAGS'].gsub(/-L\/var\/run\/com\.apple\.security\.cryptexd[^\s]*/, '')
      end
    end
  end
end

project.save
puts "Successfully deep-cleaned search paths in Runner project."









