---
title: Connecting to heroku postgres with DataGrip (and other jetbrains apps)
date: 2016-02-08 18:22 +0100
tags: [heroku, postgresql, datagrip, jetbrains, intellij]
intro: jetbrains apps can only connect to heroku postgres if you disable ssl certificate validation
---

DataGrip (and the other jetbrains apps) were refusing to connect to heroku postgresql databases even though the connection was correct.

Turns out that you must have SSL enabled but can't validate the certificate.

Add the following properties to the datasource advanced settings:

<table class="table table-bordered table-condensed">
  <thead>
    <tr>
      <th>Name</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ssl</td><td>true</td>
    </tr>
    <tr>
      <td>sslfactory</td><td>org.postgresql.ssl.NonValidatingFactory</td>
    </tr>
  </tbody>
</table>

Or to the url

    ?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory
