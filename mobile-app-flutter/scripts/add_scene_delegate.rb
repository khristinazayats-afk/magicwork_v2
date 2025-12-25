require 'xcodeproj'
project_path = 'ios/Runner.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.first

# Add SceneDelegate.swift to the project
file_name = 'SceneDelegate.swift'
file_path = "Runner/#{file_name}"

# Check if file already in project
file_exists = target.source_build_phase.files.any? { |build_file| build_file.file_ref.path.end_with?(file_name) if build_file.file_ref }

if !file_exists
  group = project.main_group.find_subpath('Runner', true)
  file_ref = group.new_file(file_name)
  target.source_build_phase.add_file_reference(file_ref)
  project.save
  puts "Successfully added #{file_name} to the Xcode project compile phase."
else
  puts "#{file_name} already exists in the Xcode project compile phase."
end

