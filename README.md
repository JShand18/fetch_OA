# Fetch Rewards Receipt Processor Challenge
An API web service that accepts HTTP requests and returns responses outlined in [receipt-processor-challenge](https://github.com/fetch-rewards/receipt-processor-challenge/tree/main#readme).

## Dependencies
* [Node](https://nodejs.org/) - Open-source, cross-platform JavaScript runtime environment
* [Express](https://expressjs.com/) - Back end Node.js server framework for building web apps and APIs
* [Jest](https://jestjs.io/) – A framework for testing JavaScript code. Unit testing is the main usage of it
* [Supertest](https://www.npmjs.com/package/supertest) – Allows testing endpoints and routes on HTTP servers
* [Cross-Env](https://www.npmjs.com/package/cross-env) – Package for setting environmental variables inline within a command

## Getting Started
1) You must have [Node](https://nodejs.org/) version installed.  
  Verify Node version
    ```
    node --version
    ```
2) Clone repo locally
    ```
    git clone https://github.com/JShand18/fetch_OA.git
    ```
3) Go to the project's root directory
    ```
    cd /my/path/to/fetch_OA
    ```
4) Install dependencies
    ```
    npm install
    ```
5) Start the server
    ```
    npm start
    ```
    Your terminal should read:
    ```
    Listening on port: http://localhost:3000
    ```
6) Verify the app is running by visiting http://localhost:3000. You should see the message: "Welcome to Receipt Processor"
