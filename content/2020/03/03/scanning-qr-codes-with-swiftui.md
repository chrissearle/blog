---
title: Scanning QR codes with SwiftUI
date: 2020-03-03 11:28 +0100
tags: [ios, swift, swiftui, xcode]
series: Revisiting the Sbanken API with SwiftUI
image: /images/posts/2020/03/config.png
intro: So the first thing we want to do is to have a way to scan a QR code to get the relevant IDs for the app.
---

## Model

So the first thing we want to do is to have a way to scan a QR code to get the relevant IDs for the app.

We will use a simple JSON format:

```json
{
  "clientId": "application id from S'banken (applikasjonsnøkkel)",
  "clientSecret": "application password from S'banken",
  "userId": "national identity number (fødselsnummer)",
  "accountNr": "bank account number"
}
```

For this we will need a model class - and we need to be able to convert between the json and the class instance.

Add a swift file to the project - Config.swift - and create a class Config that conforms to the Codable protocol.

```swift
class Config : Codable {
    let clientId: String
    let clientSecret: String
    let userId: String
    let accountNr: String
}
```

This will not compile yet - since we need to actually conform to Codable - so add the following enum to the class:

```swift
enum CodingKeys: String, CodingKey {
    case clientId
    case clientSecret
    case userId
    case accountNr
}
```

---

## QR Code Generation

**Important: The JSON and the QR code contain keys and IDs and should not be shared or made publically available.**

We'll start by creating a file `config.json` that matches the format above but with the values filled out.

Now we need to create a QR code image for this file. We really don't want to use an online generator for this - since it has our secrets inside.

I will be using a command line application called [qrencode](https://github.com/fukuchi/libqrencode)

```shell
qrencode -l H -o config.png < config.json
```

Here we ask for high error correction (we want to be sure that the code is correct). The command should generate a PNG image of the QR code in config.png.

![title](/images/posts/2020/03/config.png)

---

## QR Code Scanner

We need to do two things:

- Handling showing/hiding the scanner
- Handling the scan data received

### Scanner Sheet

We will show the scanner in a sheet view. We'll start by working in the main ContentView.

We need to add an import to CodeScanner at the top - then we need to add a sheet.

The sheet will need a controlling state variable to handle show/hide.

Add the following variable to the view:

```swift
@State private var showingScanner = false
```

Now we need a button to trigger showing scanning - so let's add a simple button using the system image for QR code.

Replace the `Text("Hello World")` with the following:

```swift
Button(action: {
    self.showingScanner = true
}) {
    Image(systemName: "qrcode")
        .resizable()
        .frame(width: 32, height: 32)
}
```

Now - we need to attach a sheet to this view - we can add that to the button:

```swift
.sheet(isPresented: $showingScanner) {
    ...
}
```

Then in the sheet we need our CodeScanner:

```swift
 CodeScannerView(codeTypes: [.qr], simulatedData: "-") { result in
     switch result {
     case .success(let code):
         print(code)
     case .failure(let error):
         print(error)
     }
     self.showingScanner = false
 }
```

This just prints either the scanned data or the error message and sets the state so that the view closes. Note that the simulator has no camera access - so you need to set the simulatedData value to something for testingin the simulator.

Finally - we need to do one more thing - we need to have permission to use the camera. In the application's `Info.plist` add a new entry to the dictionary:

```
"Privacy - Camera Usage Description" - "Used to scan QR codes"
```

Let's try - run it from Xcode on a device and scan the example QR code above - you should see the contents in the Xcode console.

---

## Parsing

So - we can now get the contents of the QR code as a json string.

The next step is to convert it to our Config model object.

We will use the swift JsonDecoder for this. We'll add this to the success block:

```swift
if let data = code.data(using: .utf8) {
    let decoder = JSONDecoder()

    if let config = try? decoder.decode(Config.self, from: data) {
        print(config.clientId)
        print(config.clientSecret)
        print(config.userId)
        print(config.accountNr)
    }
}
```

Try scanning again and you should see each field in the Xcode console.

The CodeScannerView now looks like this:

```swift
 CodeScannerView(codeTypes: [.qr], simulatedData: "-") { result in
     switch result {
     case .success(let code):
         print(code)

         if let data = code.data(using: .utf8) {
             let decoder = JSONDecoder()

             if let config = try? decoder.decode(Config.self, from: data) {
                 print(config.clientId)
                 print(config.clientSecret)
                 print(config.userId)
                 print(config.accountNr)
             }
         }

     case .failure(let error):
         print(error)
     }
     self.showingScanner = false
 }
```

---

## Summary

So - we can now get the configuration from a QR code - the next step will be to tidy the code a little, give the user a way to cancel the scan dialog and to persist the configuration.

---

[GitHub Repository](https://github.com/chrissearle/lommepenger-swiftui)
