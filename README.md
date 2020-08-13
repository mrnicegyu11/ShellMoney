# Shell🐚Money
A lean personal budgeting app, made primarily for me personally. It runs on an express-nodejs server, stores data in MongoDB and is styled using Bootstrap. ShellMoney is still in development, although it is running fairly stable. Many features of well-known open-source budgeting apps such as Firefly III are still missing though.

Licence is GPL where permissible.

## How to get it running:

1. Set-Up a running mongoDB instance, create a collection named "shellmoney" (mind the lowercase) and add a user with ReadWrite Access to this collection. Remember on which port the mongoDB is running.
2. Clone ShellMoney from github to a folder
3. Go into the shellmoney root folder and run ``npm i`` to install required packages.
4. Set required environment variables for shellmoney (--> If a deamon is running shellmoney on a server, take care that these env vars are always set correctly):
  * ``export SHELLMONEY_MONGODB_ACCESS=testUser:testPwd@localhost:11000 ``
    * Put the user-credentials for accessing the mongoDB collection here as shown
  * ``export SHELLMONEY_PORT=12000``
    * Put the port you want shellmoney to run on here.
  * ``export SHELLMONEY_MODE=RELEASE``
    * ``DEBUG`` mode will not use minified js to facilitate development
  * ``export SHELLMONEY_URL=http://mywebsite.org:12000``
    * For ``SHELLMONEY_URL``, make sure that there are no additional trailing slash-signs ('/') at the end of the URL after the port (this will break everything). Put the full URL where Shellmoney will be running here. This will usually be something like ``//server:port``.
  * ``export SHELLMONEY_HTTPS_CERTFILE="/home/example/file.cert" && export SHELLMONEY_HTTPS_KEYFILE="/home/example/file.key"``
    * Set the paths to the key- and certfile if you want to enable secure HTTPS connections. If these variables are not set properly, shellmoney will run in (unsecured) HTTP-mode. Please don't forget to properly specify ``https://`` oder ``http://`` in ``SHELLMONEY_URL``
5. Run the shellmoney app: ``./npm start``.
6. Shellmoney is now reachable using a browser on the adress specified in ``SHELLMONEY_URL``.
