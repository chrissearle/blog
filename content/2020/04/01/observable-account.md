---
title: Observable account
date: 2020-04-01 08:15 +0200
tags: [ios, swift, swiftui, xcode, sbanken]
series: Revisiting the Sbanken API with SwiftUI
intro: So far we are showing the account balances - and the next step is really to sort out the transaction view.
---

So far we are showing the account balances - and the next step is really to sort out the transaction view.

But - before we do that - let's sort out the nested callbacks we currently have.

---

## Callbacks

These work - but - nesting them makes the code harder to follow.

Let's make the account handling use the built in ObservableObject handling - so that when the account changes the view notices this. We can then write a simplified refresh method that will also allow us to refresh the transactions when we add them.

---

## Make Account Service observable

We need to make some changes to the account service.

- it needs to implement `ObservableObject`
- it needs to have a variable that is annotated as `@Published`
- the method is no longer static, no longer gets callbacks (and we'll rename it refresh)

Change the class definition to start:

```swift
class AccountService : ObservableObject {
    @Published public var account : Account? = nil
```

Change the method signature to:

```swift
public func refresh(token: String, config: Config)
```

Remove all calls to callback in the method and at the end if we made it that far we set:

```swift
self.account = account
```

## Content View

We now want to listen to changes to the service - the view will be notified that a change has happened when the `@Published` variable changes.

In the content view remove the state variable for account and add

```
@ObservedObject var accountService = AccountService()
```

In the view heirarchy - where we have the AccountView - let's use the service variable when present:

```swift
if (accountService.account != nil) {
    AccountView(account: accountService.account!)
        .navigationBarTitle(Text(accountService.account!.name), displayMode: .inline)
    }
}
```

Replace the entire getToken method (which since the last change is badly named too) with a refresh method:

```swift
func refresh() {
    if let config = self.config {
        TokenService.getToken(config: config) { (accessToken) in
            if let token = accessToken {
                self.accountService.refresh(token: token, config: config)
                // We will add transaction refresh here later on
            }
        }
    }
}
```

In the .OK state of askForAuth - call `self.refresh()`

If you want you can also add another naviagtionBarItem with a suitable icon (`Image(systemName: "arrow.clockwise")` perhaps) that calls refresh().

---

## Summary

We've updated the app so that the view stack watches for changes to the account. This will make it easier to add the transaction views later on.

---

[GitHub Repository](https://github.com/chrissearle/lommepenger-swiftui)
