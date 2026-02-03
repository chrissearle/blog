---
title: Biometric authentication
date: 2020-03-08 21:00 +0100
tags: [ios, swift, swiftui, xcode]
series: Revisiting the Sbanken API with SwiftUI
intro: So far we have an ap that can scan its config from a QR code and persist it in the keychain on the device. Today we'll add support for using biometric unlock (Face ID or Touch ID depending on the device).
---

So far we have an ap that can scan its config from a QR code and persist it in the keychain on the device.

Today we'll add support for using biometric unlock (Face ID or Touch ID depending on the device).

---

## Simulator Data

However - first we'll make one super quick change to make testing in the simulator a little easier. We'll return a dummy config json in the config scanner.

In ScannerView - create a constant:

```swift
let simulatedData = """
{
    "clientId": "clientId",
    "clientSecret": "clientSecret",
    "userId": "userId",
    "accountNr": "12345678903"
}
"""
```

And then in the call to CodeScannerView pass the simulatedData variable instead of "-"

---

## Touch ID/Face ID

These use Apple's LocalAuthentication module.

Create a swift file to hold some utility functions - Authentication.swift.

Import `LocalAuthentication` just after `Foundation` then create the following utility method and enum:

```swift
enum AuthStatus {
    case OK
    case Error
    case Unavailable
}

func authenticateUser(_ callback: @escaping (_ status: AuthStatus) -> Void) {
    let context = LAContext()
    var error: NSError?

    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Unlock") { success, authenticationError in
            DispatchQueue.main.async {
                if success {
                    print("Authentication OK")
                    callback(.OK)
                } else {
                    print("Authentication Error")
                    callback(.Error)
                }
            }
        }
    } else {
        print("Authentication Unavailable")
        callback(.Unavailable)
    }
}
```

### Notes

- We're calling an older Objective-C api here - things like `error: &error` don't really feel so "swift" but they still work.
- The call to evaluatePolicy happens in a different thread - we need to switch back to our main thread to handle the result

### Face ID

But wait - this will only work for Touch ID. We gave a (too brief) reason to the call to evaluatePolicy here - but that is only used for Touch ID. For Face ID we have to add it to the Info.plist instead.

Open Info.plist and add a new line:

```
"Privacy - Face ID Usage Description" - "Unlock"
```

---

## Using the authenticate function in the view

Add the following state variable:

```swift
@State private var authenticated = false
```

A quick utility function to call and handle the response:

```swift
func askForAuth() {
    authenticateUser() { status in
        switch(status) {
        case .OK:
            self.authenticated = true
        case .Error:
            self.authenticated = false
        case .Unavailable:
            self.authenticated = true
        }
    }
}
```

Note that if authentication is unavailable we're just letting the user in. Here you would need fallback to a login or similar - but for this proof of concept app (and given that my son has a touch ID device) this will do here.

So - when do we call this?

I want to call this in two places:

- When the app starts - if we already have configuration
- When a new config successfully is scanned

### App Load

Add the if clause after the call to `loadConfig()`:

```swift
.onAppear {
    self.config = Config.loadConfig()

    if (self.config != nil && self.authenticated == false) {
        self.askForAuth()
    }
}
```

### Config load

In newScanData - add the if clause after the line `self.config = config`:

```swift
 func newScanData(_ code: String) {
     if let config = Config.decodeConfig(json: code) {
         config.save()
         self.config = config

         if (self.authenticated == false) {
             self.askForAuth()
         }
     }
 }
```

### View

In the view - we currently have a conditional display of the account number or the string "You need to scan in a configuation". Extend this to check the `authenticated` state:

```swift
if (self.config != nil) {
    if (self.authenticated == false) {
        Text("Please authenticate")
    } else {
        Text(config!.accountNr)
    }
} else {
    Text("You need to scan in a configuation")
}
```

---

## Simulator

You can test both Face ID and Touch ID in the simulator if you use the menu `Hardware > Face/Touch ID` first to enrol the device and then also to tell the simulator that the face/fingerprint is good.

---

## Summary

We've now added basic support for biometric authentication. In the next post we'll actually start calling the S'banken API and then in further posts we will start doing something with the view layout.

---

[GitHub Repository](https://github.com/chrissearle/lommepenger-swiftui)
