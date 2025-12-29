# Helper targets for iOS build/run and logs

IOS_WORKSPACE := mobile-app-flutter/ios/Runner.xcworkspace
IOS_SCHEME := Runner
# Use the iPhone 17 simulator with iOS 26.2
IOS_DEVICE_ID := CB048A1D-2ACE-4DFB-AF10-6852A9BD4C05
IOS_DESTINATION := platform=iOS\ Simulator,id=$(IOS_DEVICE_ID)

.PHONY: ios-clean
ios-clean:
	xcodebuild -workspace "$(IOS_WORKSPACE)" -scheme "$(IOS_SCHEME)" -configuration Debug -destination $(IOS_DESTINATION) clean

.PHONY: ios-build
ios-build:
	xcodebuild -workspace "$(IOS_WORKSPACE)" -scheme "$(IOS_SCHEME)" -configuration Debug -destination $(IOS_DESTINATION) build

.PHONY: ios-run
ios-run: ios-build
	@echo "Booting simulator $(IOS_DEVICE_ID) and launching app..."
	@xcrun simctl boot "$(IOS_DEVICE_ID)" 2>/dev/null || true
	@open -a Simulator --args -CurrentDeviceUDID "$(IOS_DEVICE_ID)"
	@APP_PATH="$$HOME/Library/Developer/Xcode/DerivedData/Runner-*/Build/Products/Debug-iphonesimulator/Runner.app"; \
	APP_PATH=$$(echo $$APP_PATH); \
	xcrun simctl install "$(IOS_DEVICE_ID)" $$APP_PATH
	@xcrun simctl launch "$(IOS_DEVICE_ID)" com.example.magicwork

.PHONY: ios-logs
ios-logs:
	@echo "Streaming device logs for $(IOS_DEVICE_ID) ... (Ctrl+C to stop)"
	@xcrun simctl spawn "$(IOS_DEVICE_ID)" log stream --level=debug --style compact
