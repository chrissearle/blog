---
title: Fetching the token
date: 2020-03-18 09:21 +0100
tags: [ios, swift, swiftui, xcode, sbanken]
series: Revisiting the Sbanken API with SwiftUI
intro: The app so far has the ability to read its configuration and to check that you are who you say you are on devices that support touch or face id. The next step is to get an access token from the S'banken API.
---

The app so far has the ability to read its configuration and to check that you are who you say you are on devices that support touch or face id.

The next step is to get an access token from the S'banken API.

---

## Tokens

S'banken is using a standard authentication mechanism - OAuth client credentials.

To make this call we need to send a POST request to the token endpoint with the following headers:

- Accept: application/json
- Content-Type: application/x-www-form-urlencoded
- Authorization: BASIC

The body must be

```
grant_type=client_credentials
```

So - that authorization header. This call uses basic auth - which is a base 64 encoded version of `username:password`. Here - username is the clientId and password is the clientSecret. But we need to do one more step - url encode each part before we base 64 encode it.

Let's create a little utility class with a static function. It will take a config object and a completion callback (the request will be async).

Add a new file - TokenService.swift. At the top - add an import for Alamofire

We'll start by creating a Codable representation of the response:

```swift
struct Token : Decodable {
    let accessToken: String
    let expiresIn: Int
    let tokenType: String

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case expiresIn = "expires_in"
        case tokenType = "token_type"
    }
}
```

This will be used when parsing the response from the API.

### Percent Encoding

Now - encoding the username and password fields. Swift strings have a method addingPercentEncoding which will do this for us - given the correct allowed CharacterSet. I found that none of the default available character sets worked as I wanted so I took a peek at S'banken's own swift API implementation: https://github.com/Sbanken/sbankenclient-ios/blob/master/SbankenClient/SbankenClient.swift#L257-L261 and found that they are constructing a character set - so - let's do that.

We'll add it as an extension onto String:

```swift
extension String {
    public func encodeForAuth() -> String? {
        let characterSet = NSMutableCharacterSet.alphanumeric()
        characterSet.addCharacters(in: "-_.!~*'()")

        return self.addingPercentEncoding(withAllowedCharacters: characterSet as CharacterSet)
    }
}
```

### Request

Finally we can start to construct our request.

We create a TokenService class with a static getToken function:

```swift
class TokenService {
    public static func getToken(config: Config, onComplete: @escaping (_ accessToken: String?) -> Void) {

        // Get username param encoded
        guard let username = config.clientId.encodeForAuth() else {
            onComplete(nil)

            return
        }

        // Get password param encoded
        guard let password = config.clientSecret.encodeForAuth() else {
            onComplete(nil)

            return
        }

        // Construct the basic auth string
        let basicAuth = Data("\(username):\(password)".utf8).base64EncodedString()

        // Headers required
        let headers: HTTPHeaders = [
            "Authorization": "Basic \(basicAuth)",
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        ]

        // Body params
        let parameters = ["grant_type": "client_credentials"]

        // Construct the request - setting the body to x-www-form-urlencoded
        let request = AF.request("https://auth.sbanken.no/identityserver/connect/token",
                                 method: .post,
                                 parameters: parameters,
                                 encoding: URLEncoding.httpBody,
                                 headers: headers)

        let decoder = JSONDecoder()

        // Call the API
        request.responseDecodable(of: Token.self, decoder: decoder) { (response) in
            if let error = response.error {
                // It went wrong
                print("Unable to fetch token \(response) \(error.localizedDescription)")

                onComplete(nil)

                return
            }

            guard let token = response.value else {
                // We got an answer but could not parse it
                print("Unable to read token")

                onComplete(nil)

                return
            }

            // Token received
            onComplete(token.accessToken)
        }
    }
}
```

---

## Triggering the get token call

For now - in the main view - in the onAppear - we load config and ensure that you are logged in.

Add the following function to ContentView - it will call the service if the config is available and then print to console what we got back

```swift
    func getToken() {
        if let config = self.config {
            TokenService.getToken(config: config) { (accessToken) in
                print("\(accessToken ?? "No token")")
            }
        }
    }
```

Finally - for testing - we can add `self.getToken()` to the OK clause of askForAuth():

```swift
            case .OK:
                self.authenticated = true
                self.getToken()

```

This will have to be updated later - but for now it will allow us to trigger the call for testing.

---

## Summary

So - we now have a token. The next step will be to add support for fetching account info and transaction info.

---

[GitHub Repository](https://github.com/chrissearle/lommepenger-swiftui)
