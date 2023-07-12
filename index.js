//******* PACKAGES AND SETUP */
const express = require('express');
const bp = require("body-parser");
const fileUpload = require('express-fileupload');
const crypto = require('crypto');
const { type } = require('os');

const app = express();
const port = 3000;

//app.use(fileUpload());
app.set('view engine', 'ejs');
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());


//******* DATA STORES */

// Initilizing map to store recepits and their ids
var receiptStore = new Map(); // Key: id, Value: Receipt JSON

// Initilizing map to store ids and thier points 
var pointsStore = new Map(); // Key: id, Value: awarded points


//******* ENDPOINT ROUTING */

app.post('/receipts/process', (req, res) => {
    var data = req.body;
    // if (validateJSON(data)) {
    var receipt = data;
    // creating ID based on md5 hashing
    // duplicate receipts will have the same IDs
    var id = crypto.createHash('md5').update(JSON.stringify(receipt)).digest('hex');
    // checking to see if the receipt already exists
    if (!receiptStore.has(id)) {
        receiptStore.set(id, receipt);
    }
    res.json({ "id": id });
});

// receipts/id/points endpoint
app.get('/receipts/:id/points', (req, res) => {
    var id = req.params.id;
    var receipt = receiptStore.get(id);
    // check to see if the receipt's points have already been calculated and stored
    if (pointsStore.has(id)) {
        res.json({ "points": pointsStore.get(id) });
    } else {
        // calculates and saves receipts points
        var points = calculateTotalSumPoints(receipt);
        pointsStore.set(id, points);
        res.json({ "points": points });
    }
});


//******* CALCULATION HELPER FUNCTIONS */

/** calculateTotalSumPoints
 *      @params receipt - JSON formatted receipt
 *      @returns totalPoints – int, total amount of points
 *      Calculates points of a receipt based on set rules:
 *          One point for every alphanumeric character in the retailer name.
 *          50 points if the total is a round dollar amount with no cents.
 *          25 points if the total is a multiple of 0.25.
 *          5 points for every two items on the receipt.
 *          If the trimmed length of the item description is a multiple of 3, multiply the price by 0.2 and round up to the nearest integer. The result is the number of points earned.
 *          6 points if the day in the purchase date is odd.
 *          10 points if the time of purchase is after 2:00pm and before 4:00pm. 
 */
function calculateTotalSumPoints(receipt) {

    var totalPoints = 0;
    totalPoints += calculateRetailerPoints(receipt['retailer']);
    totalPoints += calculateTotalDollarPoints(receipt['total']);
    totalPoints += calculateItemsPoints(receipt['items']);
    totalPoints += calculatePurchaseDatePoints(receipt['purchaseDate']);
    totalPoints += calculatePurchaseTimePoints(receipt['purchaseTime']);

    return totalPoints;
}

/** calculateRetailerPoints
 *      @params retailer – string, name of retailer store
 *      @returns points – int, amount of points
 *      Calculates one point for every alphanumeric character in the retailer name.
 */
function calculateRetailerPoints(retailer) {
    var regex = /[a-zA-Z0-9]/g;
    return retailer.match(regex).length;
}

/** calculateTotalDollarPoints
 *      @params total – string, total amount of item prices
 *      @returns points – int, amount of points
 *      Calculates 50 points if the total is a round dollar amount with no cents.
 *      Calculates 25 points if the total is a multiple of 0.25.
 */
function calculateTotalDollarPoints(total) {
    var points = 0;
    var amount = parseFloat(total);
    if (amount % 1.00 == 0) {
        points += 50;
    }
    if (amount % 0.25 == 0) {
        points += 25;
    }
    return points;
}

/** calculatePurchaseDatePoints
 *      @params items – object, list of item objects with description and price of item
 *      @returns points – int, amount of points
 *      Calculates 5 points for every two items on the receipt.
 *      If the trimmed length of the item description is a multiple of 3, multiply the price by 0.2 and round up to the nearest integer. The result is the number of points earned.
 *          6 points if the day in the purchase date is odd.
 */
function calculateItemsPoints(items) {
    var points = 0;
    // Calculate the points for pairs of items
    points += Math.floor(items.length / 2) * 5;

    items.forEach(item => {
        if (item['shortDescription'].length % 3 == 0) {
            points += Math.ceil(parseFloat(item['price']) * 0.2);
        }
    })

    return points;
}

/** calculatePurchaseDatePoints
 *      @params date – string, date of purchase
 *      @returns points – int, amount of points
 *      Calculates 6 points if the day in the purchase date is odd.
 */
function calculatePurchaseDatePoints(date) {
    if (parseInt(date.substr(-1)) % 2 == 1) {
        return 6;
    } else { return 0; }
}

/** calculatePurchaseTimePoints
 *      @params time – string, time of purchase
 *      @returns points – int, amount of points
 *      Calculates 10 points if the time of purchase is after 2:00pm and before 4:00pm. 
 */
function calculatePurchaseTimePoints(time) {
    var hour = parseInt(time.split(":")[0]);
    if (hour >= 14 && hour <= 16) {
        return 10;
    } else { return 0; }
}

//******* VALIDATION HELPER FUNCTIONS */

/** validateJSON
 *      @params data – file or text content
 *      @returns boolean 
 *      Determines if given file or text data is JSON formatted
 */
// function validateJSON(data) {
//     try {
//         JSON.parse(data);
//         return true;
//     } catch (err) {
//         return false;
//     }
// }

app.use('/', (req, res) => {
    res.send("Receipt Processor");
});


// This starts the web server on port 3000. 
app.listen(3000, () => {
    console.log(`Listening on port: http://localhost:${port}`);
});

