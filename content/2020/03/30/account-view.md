---
title: Account View
date: 2020-03-30 20:50 +0200
tags: [ios, swift, swiftui, xcode, sbanken]
series: Revisiting the Sbanken API with SwiftUI
intro: The app so far has the ability to get an authentication token. The next step is to actually use it.
image: /images/posts/2020/03/account.png
---

The app so far has the ability to get an authentication token.

The next step is to actually use it.

---

## Account Information

We need to fetch the top level account overview.

This is a GET request with the following headers

- Accept: application/json
- Authorization: Bearer AUTH_TOKEN
- customerId: USER_ID

where `AUTH_TOKEN` is the token from the auth call and `USER_ID` is the userId from the config object.

The format of the response is:

```json
{
  "availableItems": Int,
  "items": [Account]
}
```

There are some further error fields available. To be honest - for this small app - all we need is the items field.

An account looks like this:

```json
{
  "accountId": "String",
  "accountNumber": "String",
  "ownerCustomerId": "String",
  "name": "String",
  "accountType": "String",
  "available": Double,
  "balance": Double,
  "creditLimit": Double
}
```

### Model

So - we'll start modelling this in a service file with model and method - similar to the TokenService. Create a new file called AccountService.swift.

At the top we're going to need to add an import for Alamofire.

Then we can model the structure we want. Here we will model the entire account object but just pull out the items list from the containing response:

```swift
struct Account : Decodable {
    let accountId: String
    let accountNumber: String
    let ownerCustomerId: String
    let name: String
    let accountType: String
    let available: Double
    let balance: Double
    let creditLimit: Double

    enum CodingKeys: String, CodingKey {
        case accountId
        case accountNumber
        case ownerCustomerId
        case name
        case accountType
        case available
        case balance
        case creditLimit
    }

}

struct Accounts : Decodable {
    let accounts: [Account]

    enum CodingKeys: String, CodingKey {
        case accounts = "items"
    }
}
```

### Service call

Let's add a method to do this. It will take a config object and the current token and return an optional Account (if we get a response and if we find one with a matching account number). It will also callback when complete:

```swift
    public static func getAccountDetails(config: Config, token: String, onComplete: @escaping (_ account: Account?) -> Void) {
        let decoder = JSONDecoder()

        // Set up the headers for token based bearer auth.
        let headers: HTTPHeaders = [
            "Authorization": "Bearer \(token)",
            "Accept": "application/json",
            "customerId": config.userId
        ]

        // Call the service
        let request = AF.request("https://api.sbanken.no/exec.bank/api/v1/accounts/",
                                 method: .get,
                                 headers: headers)

        // Decode the response
        request.responseDecodable(of: Accounts.self, decoder: decoder) { (response) in
            if let error = response.error {
                print("Unable to fetch accounts \(response) \(error.localizedDescription)")

                onComplete(nil)

                return
            }

            guard let account = response.value?.accounts.filter({ (account) -> Bool in
                account.accountNumber == config.accountNr
            }).first else {
                print("Unable to find account")

                onComplete(nil)

                return
            }

            onComplete(account)
        }
    }
```

---

## Triggering the call

For now - we'll just trigger the call in the callback of the get token method. There are better ways to structure this - but for now this is simple to do and will cover the simple needs of the app.

Add a property on the view to hold the account. We cheat slightly here - using the dummy instance to set up "default" values for the view (currently just the name):

```swift
@State private var account = Account(accountId: "",
                                         accountNumber: "",
                                         ownerCustomerId: "",
                                         name: "Lommepenger",
                                         accountType: "",
                                         available: 0.0,
                                         balance: 0.0,
                                         creditLimit: 0.0)
```

Update getToken in ContentView:

```swift
func getToken() {
    if let config = self.config {
        TokenService.getToken(config: config) { (accessToken) in
            if let token = accessToken {
                AccountService.getAccountDetails(config: config, token: token) { (account) in
                    if let account = account {
                        self.account = account
                    } else {
                        print("No account")
                    }
                }
            } else {
                print("No token")
            }
        }
    }
}
```

So - when this is run - the view gets an account object.

---

## Updating the view

We want to do two things:

- Update ContentView to have a more suitable structure
- Create an AccountView to hold all the account display info

### Content View

We want to have the outermost part to be a NavigationView with the scan button top right. Restructure as follows:

```swift
    var body: some View {
        NavigationView {
            VStack {
                if (self.config != nil) {
                    // Do we have a config available?

                    if (self.authenticated == false) {
                        // Waiting for Face/Touch ID

                        Text("Please authenticate")
                    } else {
                        // All good - show the account
                        AccountView(account: account)
                            // and set the account name as the main page title
                            .navigationBarTitle(Text(account.name), displayMode: .inline)
                    }
                } else {
                    // No config yet
                    Text("You need to scan in a configuation")
                }
            }
            // Scan button on nav bar top right
            .navigationBarItems(trailing: Button(action: {
                self.showingScanner = true
            }) {
                Image(systemName: "qrcode")
                    .resizable()
                    .frame(width: 32, height: 32)
                }
            )
            // Scan view sheet
            .sheet(isPresented: $showingScanner) {
                ScannerView(scannedData: Binding(
                    get: { "" },
                    set: self.newScanData
                ))
            }
            // Load config and auth on startup
            .onAppear {
                self.config = Config.loadConfig()

                if (self.config != nil && self.authenticated == false) {
                    self.askForAuth()
                }
            }
        }
    }
```

### Account View

To start with - we will show the account number, and the balance/available figures. Something like this:

![Account View](/images/posts/2020/03/account.png)

Disponibelt - available. Saldo - balance.

```swift
struct AccountView: View {
    public var account : Account

    var body: some View {
        VStack {
            Text(account.accountNumber.accountFormat())
                .padding(.bottom)
                .padding(.top)
                .font(.caption)
            HStack {
                VStack {
                    Text("Disponibelt")
                        .font(.caption)
                    Text(account.available.currency())
                }
                .frame(maxWidth: .infinity)
                VStack {
                    Text("Saldo")
                        .font(.caption)
                    Text(account.balance.currency())
                }
                .frame(maxWidth: .infinity)
            }
            Spacer()
        }
    }
}
```

Finally - we're using two extensions here.

Double currency() will return the value formatted for the current locale currency setting (in the simulator above - USD - on my son's iPhone it will be in NOK):

```swift
extension Double {
    func currency() -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        guard let formatted = formatter.string(from: self as NSNumber) else {
            return "\(self)"
        }

        return formatted
    }
}
```

String accountFormat this adds spaces to get the usual display of 1234 56 78903. I find substring handling in swift to be a bit painful since you can't index into a string just with numbers - you have to use String.Index - so this extension takes care of that by defining an additional "sub" extension method returning a substring. I'm sure there are cleaner ways to do this but it does at least works:

```swift
extension String {
    func sub(_ start: Int, _ count: Int) -> String{
        return String(self[self.index(self.startIndex, offsetBy: start)..<self.index(self.startIndex, offsetBy: start + count)])
    }

    func accountFormat() -> String {
        if (self.count == 11)   {
            return String("\(self.sub(0, 4)) \(self.sub(4, 2)) \(self.sub(6, 5))")
        } else {
            return self
        }
    }
}
```

---

## Summary

At this point - we are able to start the app - scan a config if needed, authenticate with biometrics (face or touch ID) and now show the account name, number and balance/available values.

The next step will be to show the last 10 transactions and then we will have the same functions that I had in the previous storyboard based app.

---

[GitHub Repository](https://github.com/chrissearle/lommepenger-swiftui)
