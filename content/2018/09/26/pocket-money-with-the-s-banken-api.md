---
title: Pocket money with the S'banken API
date: 2018-09-26 10:54 +0200
tags: [sbanken, open banking, ios]
---

S'banken has support for giving a child/teenager a card connected to a bank account in the parent's customer account.

They also have an android app which allows the child to see their details without having to log in as the parent.

But - this is not available for iOS yet.

Having a daughter with a card - dealing with "can I have some more money" etc is easily handled face to face or just via a quick message. But - the one thing that she needs to know at any point is "how much money is in the account?".

Now - like most banks - S'banken has an open banking/API initiative running - so - let's take a look at what was involved in providing her with a simple app that just shows this information.

Firstly - you need to be a member of the S'banken beta bank - something you can sign up for under your account settings.

Once you have that you can follow the link to the [developer portal](https://secure.sbanken.no/Personal/ApiBeta/Info/)

## Application

To talk to the API you need to register an application. It will need a name and a description.

Once created - it will have it's client ID (applikasjonsnøkkel).

We need one more thing for the app - and that is a password - there is a button to order a new password. Make sure to copy it - you won't be able to see it later on (but you can order new ones). This password is the client secret.

So - now we have a client ID and a client secret - good stuff. Time for the next step.

## Authorization

To use any of the APIs provided you need an authorization token. So the first step is to generate one.

At the time of writing that is done by sending a POST request to `https://auth.sbanken.no/identityserver/connect/token`

It needs the following headers:

    Content-type: application/x-www-form-urlencoded; charset=utf-8
    Accept: application/json
    Authorization: Basic AUTHSTRING

And the body:

    grant_type=client_credentials

What is `AUTHSTRING`? It is the base64 encoded value of the string `"client ID:client secret"`

When you post this you should get a JSON response with the following:

```json
{
  "access_token": "ACCESS_TOKEN",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

This `access_token` can be used for calls to the other APIs for the number of seconds in `expires_in` - after that you need to reauthorize.

## Getting the accounts list

So - the next step is to grab the account information. S'banken have made the documentation available via swagger [e.g. the banking API](https://api.sbanken.no/Bank/swagger/index.html)

The first thing we need to do is to get the list of accounts - since we need the internal account ID of the account we want to get the balance for.

To do this we need to send a GET request to `https://api.sbanken.no/bank/api/v1/accounts/`

It needs the following headers:

    customerId: CUSTOMER_ID
    Authorization: Bearer ACCESS_TOKEN
    Accept: application/json

`ACCESS_TOKEN` is the token we got from the authorization stage. `CUSTOMER_ID` is your full norwegian personal ID (11 digits).

This should give a JSON response with a list of account items (under the `items` key)

An account looks like:

```json
{
  "accountId": "INTERNAL_ACCOUNT_ID",
  "accountNumber": "BANK_ACCOUNT_NUMBER",
  "ownerCustomerId": "YOUR_SSN",
  "name": "ACCOUNT_NAME",
  "accountType": "Standard account",
  "available": 999.999,
  "balance": 999.999,
  "creditLimit": 0.0
}
```

- `BANK_ACCOUNT_NUMBER` is the normal 11 digit account number you are used to.
- `INTERNAL_ACCOUNT_ID` is what we want for the next step
- `ACCOUNT_NAME` is the name you have given the account in the normal S'banken website

You could stop here - but - we can reduce the network traffic if we store the account ID - and use that - we can then just request a single account.

## Getting a single account

This is almost the same as the previous step. Two changes:

- We change the GET to go to `https://api.sbanken.no/bank/api/v1/accounts/INTERNAL_ACCOUNT_ID`
- The response has a single account object under the `item` key instead of a list of account objects under the `items` key

## API Summary

So - once you have the client ID, client secret, your ID and the account internal ID - any new run of the app requires two calls - one to authorize and one to get the single account information - and if you are refreshing while the token is still valid you can reduce it to just one call.

## The app

S'banken have [their own client](https://github.com/Sbanken/sbankenclient-ios) that gives easy access to the API from swift - but for this simple app it was more fun to see what was happening behind the scenes by doing it directly (and it keeps a very simple app very simple).

I won't be posting the code - since it's just a test - but it's a fairly standard app with two pages - one showing the data, one allowing you to enter the ID/secret etc.

I didn't want to store these in plain text in user defaults so I used the keychain. For that I read [this article on keychain and swift](https://medium.com/ios-os-x-development/securing-user-data-with-keychain-for-ios-e720e0f9a8e2) and used the SwiftKeychainWrapper mentioned there.

The calls are made using URLSession and URLRequest and are more or less copied from stack overflow :)

The rest is standard stuff - put up a spinner when refreshing, update the GUI etc.
