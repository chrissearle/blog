---
title: Deploy from github to heroku via travis-ci
date: 2014-01-20 10:47 +0100
tags: [maven, java, travis-ci, heroku, continuous integration, continuous deployment, github]
---

A small test of using travis-ci to build a github project and auto deploy it to heroku.

## Step 1 - A webapp

Create your webapp. For this I created a simple hello world webapp (1 jsp) with a dummy test (just to give travis-ci something to do).

[Commit on github for this step](https://github.com/chrissearle/web-hello-world/commit/555edbd632b9b1ed920449c0c392887939176afb)

## Step 2 - CI

Let's add that to travis.

* Head to [Travis](https://travis-ci.org/) and log in with github oauth.
* Click on your logged in account name and choose Accounts
* Hit the sync now button if the last sync isn't recent enough
* Find your project and switch from off to on
* Click the spanner (takes you to the deploy hooks for the github project), choose travis and enter your username/token (available from your travis profile)
* Add travis config to the project. This means we need to add a .travis.yml file. This specifies the language as java and what JDK you want to use. See [.travis.yml](https://github.com/chrissearle/web-hello-world/blob/master/.travis.yml)
* The build should now appear in your list on travis

[Commit on github for this step](https://github.com/chrissearle/web-hello-world/commit/0456340bda81359e1602a43eff2eb0b9d14b99c0)

## Step 3 - Let's get the build status to show at github

Once your build passes - on the travis page you can see an icon - build passing. If you click on that you get a popup of build status links.

Grab the one that uses the same format you want to use for your README.

Create the README file if not already present and include the link to the image. For this test I used markdown [README.md](https://raw.github.com/chrissearle/web-hello-world/master/README.md)

Once pushed - refresh the github project page and you should see the build status icon.

[Commit on github for this step](https://github.com/chrissearle/web-hello-world/commit/a3b7b0f494b912ba5a16d2e827c4fb7201fb8cfc)

## Step 4 - Create heroku app

Heroku's example uses embedded jetty - so update the app

And initial deploy:

~~~ shell
$ heroku create web-hello-world
Creating web-hello-world... done, stack is cedar
http://web-hello-world.herokuapp.com/ | git@heroku.com:web-hello-world.git
Git remote heroku added
$ git push heroku master
~~~

And now we can test [the deployment](http://web-hello-world.herokuapp.com/)

[Commit on github for this step](https://github.com/chrissearle/web-hello-world/commit/c16b997dc03388c6da86486afdbf50d6e9c04088)

## Step 5 - Push builds to heroku

We need to add the heroku information to the travis yaml file. We don't want to have the auth key in plain text - so grab the [travis command line tool](https://github.com/travis-ci/travis#installation) and then run

~~~ shell
$  travis setup heroku
~~~

Make sure you choose to encrypt the key.

[Commit on github for this step](https://github.com/chrissearle/web-hello-world/commit/80ea1e871a45b5172aa599d156f4450efffc51cb)


## Step 6 - Test it

Change the app, commit and wait. Your change should arrive on the heroku site.

Once it's been tested and deployed - you can see [the change](http://web-hello-world.herokuapp.com/)


[Commit on github for this step](https://github.com/chrissearle/web-hello-world/commit/47a83bc582cc3d6f7181321c266a43d4a6eaf451)

## More info:

* [Travis getting started](http://docs.travis-ci.com/user/getting-started/)
* [Travis java apps](http://docs.travis-ci.com/user/languages/java/)
* [Travis command line tool](https://github.com/travis-ci/travis#installation)
* [Heroku getting started with java](https://devcenter.heroku.com/articles/getting-started-with-java)
* [Project on github](https://github.com/chrissearle/web-hello-world)
* [Project on travis](https://travis-ci.org/chrissearle/web-hello-world)
* [Project on heroku](http://web-hello-world.herokuapp.com/)

### Other useful links

* [Heroku : Using jetty runner](https://devcenter.heroku.com/articles/deploy-a-java-web-application-that-launches-with-jetty-runner)
* [Heroku : Deploying Tomcat-based Java Web Applications with Webapp Runner](https://devcenter.heroku.com/articles/java-webapp-runner)
* [Samuel Sharaf : Create a simple Java Web App using Maven and Deploy to Heroku](http://samuelsharaf.wordpress.com/2011/11/06/create-a-simple-java-web-app-using-maven-and-upload-to-heroku/)
* [Jersey : Creating a Web Application that can be deployed on Heroku](https://jersey.java.net/documentation/latest/getting-started.html#heroku-webapp)
