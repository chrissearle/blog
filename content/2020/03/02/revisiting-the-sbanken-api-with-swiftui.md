---
title: Revisiting the S'banken API with SwiftUI
date: 2020-03-02 20:13 +0100
tags: [sbanken, open banking, ios, swift, swiftui, xcode]
series: Revisiting the Sbanken API with SwiftUI
intro: In this series - we will take a look at creating the app from scratch - but using SwiftUI and some helper libraries.
---

Back in September 2018 [I wrote about using the new S'banken API](/2018/09/26/pocket-money-with-the-s-banken-api/) to create a pocket money app for iOS - since they didn't have one at the time.

The still don't - but - iOS development has moved on a bit since then - notably with the release last year of SwiftUI.

In this series - we will take a look at creating the app from scratch - but using SwiftUI and some helper libraries.

---

## Recap

The [S'banken API](https://secure.sbanken.no/Personal/ApiBeta/Info/) provides several functions. In the previous application - we used:

- Authorization
- Get list of accounts
- Get account details

To do this - we needed 3 values:

- The client ID (applikasjonsnøkkel)
- The client secret (generated on the developer portal - usually valid for 3 months)
- The ID number of the account owner (fødselsnummer - 11 digits)

The authorization uses _client credentials grant flow_.

---

## The plan

Entering the new client secret every 90 days got old quite fast. The new app will be provided with 4 values:

- The client ID (applikasjonsnøkkel)
- The client secret (generated on the developer portal - usually valid for 3 months)
- The ID number of the account owner (fødselsnummer - 11 digits)
- The bank account ID

These will be provided via QR code (remember not to share the code) to simplify data entry

SwiftUI will be used instead of Swift+Storyboards. SwiftUI is not quite as feature complete as Swift+Storyboards yet - but it is fully usable.

We will make use of the new Swift Package Manager for dependencies. Initial libraries I expect to use are:

- [Alamofire](https://github.com/Alamofire/Alamofire.git) - network calls (if S'banken adds their API library to Swift Package Manager instead of Carthage we'll revisit this)
- [Code Scanner](https://github.com/twostraws/CodeScanner.git) - wraps up the QR scanner in a nice swift UI component
- [SwiftUI Refresh](https://github.com/timbersoftware/SwiftUIRefresh.git) - implements pull to refresh for Swift UI

---

[GitHub Repository](https://github.com/chrissearle/lommepenger-swiftui)
