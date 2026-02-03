---
title: View refactor and save to keychain
date: 2020-03-04 07:54 +0100
tags: [ios, swift, swiftui, xcode]
series: Revisiting the Sbanken API with SwiftUI
intro: At this stage - we've a lot of stuff in the main ContentView. Let's do something about that first.
---

At this stage - we've a lot of stuff in the main ContentView. Let's do something about that first.

---

## Refactor

We'll start by moving the CodeScanner stuff to its own view. We'll also give the user a cancellation option so that they can clear the view without scanning.

To do this we need two things:

- A way to close the view
- A way to return the new data

Both of these could be done by passing in a state variable from the controlling view. However - we'll take a look at some other options.

### Closing the view

A view can get some information on its presentation from the environment.

In the new view - we can add this to the struct:

```swift
Environment(\.presentationMode) var presentation
```

Then anywhere we need to close the view - we can call `self.presentation.wrappedValue.dismiss()`. In this case - where we used a sheet with a controlling state variable for show/hide it will update this state for us.

### Returning the value

There are several possibilities here. We could pass in a state variable from the ContentView as a Binding - but - we want to do something with it when the value changes - and what we want to do is not really the concern of the ScannerView - it simply should scan and return the data.

A variable marked @State can't have hooks on its change events (willSet/didSet). We could get around this by using the ObservableObject support.

But - is this value actually a form of state for the content view? Not really. There is no "initial state" to send in and on return we want to save it to a data store (the retrieved value from the store is likely app state - but not the string representation of the scanned data itself).

There is a third option (callback closure) - but - can we use Binding to our advantage here?

Consider the following code:

```swift
ScannerView(scannedData: Binding(
    get: { "" },
    set: self.newScanData
))

...

func newScanData(_ code: String) {
    ...
}
```

This allows us to specify in the scanner view a normal binding and just set it on scan success - which will call the set here and hand off the value to the newScanData function.

So - our new ScannerView (with added title and cancel button) looks like this:

```swift
struct ScannerView: View {
    @Environment(\.presentationMode) var presentation

    @Binding var scannedData : String

    var body: some View {
        VStack {
            HStack {
                Spacer()
                Text("Scan").font(.title).padding(.leading, 16.0)
                Spacer()
                Image(systemName: "xmark.square")
                    .resizable()
                    .frame(width: 32, height: 32)
                    .onTapGesture {
                        self.presentation.wrappedValue.dismiss()
                    }
            }.padding()

            CodeScannerView(codeTypes: [.qr], simulatedData: "-") { result in
                switch result {
                case .success(let code):
                    self.scannedData = code
                case .failure(let error):
                    print(error)
                }
                self.presentation.wrappedValue.dismiss()
            }
        }
    }
}
```

Back in the ContentView - we have a function that receives the data and can perform the decoding etc there.

---

## Persisting the data

So - right now - the ContentView can take scanned data and can convert it to a Config option. We want to do three things:

- Add a save function
- Add a load function
- Move the decoder out of the view

For simplicity I'm going to add these as static methods on an extension on the Config object itself.

### Decoder

First up we'll move the decode:

```swift
extension Config {
    static func decodeConfig(json: String) -> Config? {
        if let data = json.data(using: .utf8) {
            let decoder = JSONDecoder()

            if let config = try? decoder.decode(Config.self, from: data) {
                return config
            } else {
                print("Could not decode \(json)")
            }
        } else {
            print("Could not convert to data \(json)")
        }

        return nil
    }
}
```

### Persisting

Next step - save and load. We want to use the Keychain to save this information. The API for the keychain isn't the most swift like - but there are several nice libraries available to make it easier to use. We'll grab [KeychainSwift](https://github.com/evgenyneu/keychain-swift.git).

So - add the package https://github.com/evgenyneu/keychain-swift.git via the Swift Package Manager.

We will need to save the data in some format. We could just store it as Data - but - if we actually encode it to json then in the load function we can simply reuse our decodeConfig to get it back as an object.

```swift
func save() {
    let keychain = KeychainSwift()

    let encoder = JSONEncoder()

    if let data = try? encoder.encode(self) {
        if let json = String(data: data, encoding: .utf8) {
            keychain.set(json, forKey: "AppConfig")
        }
    }
}

static func loadConfig() -> Config? {
    let keychain = KeychainSwift()

    if let json = keychain.get("AppConfig") {
        return decodeConfig(json: json)
    }

    return nil
}
```

So now we cansave our new config on fetch and load it for use if present on start. For now - we'll handle this as a simple state variable in ContentView:

### Fetch and save

```swift
@State private var config : Config? = nil
```

Then our fetch function becomes:

```swift
func newScanData(_ code: String) {
    if let config = Config.decodeConfig(json: code) {
        config.save()
        self.config = config
    }
}
```

### Load and display

To make it easier to see what we have - we'll add a Text showing the account number if present - and we'll use onAppear to load from config if its there.

This becomes the current view:

```swift
var body: some View {
    VStack {
        Button(action: {
            self.showingScanner = true
        }) {
            Image(systemName: "qrcode")
                .resizable()
                .frame(width: 32, height: 32)
        }
        .sheet(isPresented: $showingScanner) {
            ScannerView(scannedData: Binding(
            get: { "" },
            set: self.newScanData
            ))
        }

        if (self.config != nil) {
            Text(config!.accountNr)
        } else {
            Text("You need to scan in a configuation")
        }
    }
    .onAppear {
        self.config = Config.loadConfig()
    }
}
```

SwiftUI doesn't like things like "if let x ..." but will happily cope with a simple if/else with a check on nil.

---

## Summary

So - we can now save the configuration to the device keychain on a scan and load it from the keychain at startup. The next step will be to protect the app with Face or Touch ID.

---

[GitHub Repository](https://github.com/chrissearle/lommepenger-swiftui)
