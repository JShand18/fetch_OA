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
6) Verify the app is running by visiting http://localhost:3000. You should see the message: 
    ```
    Welcome to Receipt Processor
    ```
# API Endpoint Route Calls Using Postman
* Go to the [Postman](https://www.postman.com/) site.
* Create an account or log in.
* From your acount's home screen, create or use an existing `Workspace` by clicking on `Workspace` in the top left menu bar.
* Once you're in a workspace, click on `Create a request` on the right under `Getting started`:
>![Postman 1](/assets/Postman.png)

## Endpoint: Process Receipts

* Path: `/receipts/process`
* Method: `POST`
* Payload: Receipt JSON
* Response: JSON containing an id for the receipt.

Description:
Takes in a JSON receipt (see example in the example directory) and returns a JSON object with an ID generated by your code.
The ID returned is the ID that should be passed into `/receipts/{id}/points` to get the number of points the receipt
was awarded.

Example Payload:
```json
{
    "retailer": "Walgreens",
    "purchaseDate": "2022-01-02",
    "purchaseTime": "08:13",
    "total": "2.65",
    "items": [
        {
            "shortDescription": "Pepsi - 12-oz",
            "price": "1.25"
        },
        {
            "shortDescription": "Dasani",
            "price": "1.40"
        }
    ]
}
```

Example Response:
```json
{ "id": "b77ba577402049e95e310a040ab5728a" }
```

### Usage
* Click the dropdown that says `GET` and select `POST`.
* Enter `localhost:3000/receipts/process` to access endpoint.
  >![Postman 2](/assets/POST_URL.png)
* Under the URL, select `Body`, check the `raw` radio button, and select `JSON` from the dropdown.
* Enter a valid request body in the section below, which you can copy and paste from [morning-receipt.json](examples/morning-receipt.json).
  >![Postman 2](/assets/POST_PayloadJSON.png)
* Click `Send` and you should receive a `Status: 200 OK` response in the body section below.
  >![Postman 4](/assets/POST_FullResponse.png)
* Copy and paste the `id` from the response to be used for the `/receipts/{id}/points` endpoint
  >![Postman 4](/assets/POST_ResponseId.png)


# Endpoint: Get Points

* Path: `/receipts/{id}/points`
* Method: `GET`
* Response: A JSON object containing the number of points awarded.

A simple Getter endpoint that looks up the receipt by the ID and returns an object specifying the points awarded.

Example Response:
```json
{ "points": 15 }
```

### Usage
* Click the dropdown and select `GET`.
* Enter `localhost:3000/receipts/{id}/points` with the `id` filled from the `/receipts/process` endpoint.
  >![Postman 2](/assets/GET_URL.png)
* Click `Send` and you should receive a `Status: 200 OK` response in the body section below.
  >![Postman 4](/assets/GET_FullResponse.png)



## Running Tests
Run tests in [test.js](tests/test.js) from the project's main directory:
```
npm test
```
Tests check that the app should:
* `POST` add new receipt
* `GET` points from receipt
* NOT `GET` invalid ID
* NOT `POST` invalid purchaseDate
* NOT `POST` invalid purchaseTime
* NOT `POST` invalid total amount

## Credits
Referenced @scottgall's [README](https://github.com/scottgall/fetch-rewards-backend-takehome/blob/main/README.md) for formatting only.


