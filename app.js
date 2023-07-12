//******* PACKAGES AND SETUP */
const express = require('express');
const bp = require("body-parser");
const crypto = require('crypto');

const app = express();


//app.use(fileUpload());
app.set('view engine', 'ejs');
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());
app.use(express.json());


//******* DATA STORES */

// Initilizing map to store recepits and their ids
var receiptStore = new Map(); // Key: id, Value: Receipt JSON

// Initilizing map to store ids and thier points 
var pointsStore = new Map(); // Key: id, Value: awarded points


//******* ROUTING */

// POST route to added JSON formatted receipts
app.post('/receipts/process', (req, res) => {
    if (req.body) {
        var data = req.body;
        var message = validateJSON(data);
        if (message == 200) {
            var receipt = data;
            // creating ID based on md5 hashing
            // duplicate receipts will have the same IDs
            var id = crypto.createHash('md5').update(JSON.stringify(receipt)).digest('hex');
            // checking to see if the receipt already exists
            if (!receiptStore.has(id)) {
                receiptStore.set(id, receipt);
            }
            res.json({ "id": id });
        } else {
            res.status(406).json({ "error": "Data provided does not meet criteria", "message": message });
        }
    } else {
        res.status(406).json({ "error": "Bad request body", "message": "No data found in request body"});
    }

});

// GET route to calculate points from generated id
app.get('/receipts/:id/points', (req, res) => {
    var id = req.params.id;
    if (receiptStore.has(id)) {
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
    } else {
        res.status(500).json({ "error": "Receipt id not currently being tracked" })
    }

});

//******* POINT CALCULATION HELPER FUNCTIONS */

/** Calculates points of a receipt based on set rules:
 *      One point for every alphanumeric character in the retailer name.
 *      50 points if the total is a round dollar amount with no cents.
 *      25 points if the total is a multiple of 0.25.
 *      5 points for every two items on the receipt.
 *      If the trimmed length of the item description is a multiple of 3, multiply the price by 0.2 and round up to the nearest integer. The result is the number of points earned.
 *      6 points if the day in the purchase date is odd.
 *      10 points if the time of purchase is after 2:00pm and before 4:00pm. 
 *      @params receipt - JSON formatted receipt
 *      @returns totalPoints – int, total amount of points
 
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

/** Calculates one point for every alphanumeric character in the retailer name.
 *      @params retailer – string, name of retailer store
 *      @returns points – int, amount of points
 *      
 */
function calculateRetailerPoints(retailer) {
    var regex = /[a-zA-Z0-9]/g;
    return retailer.match(regex).length;
}

/** Calculates 50 points if the total is a round dollar amount with no cents.
 *  Calculates 25 points if the total is a multiple of 0.25.
 *      @params total – string, total amount of item prices
 *      @returns points – int, amount of points
 *      
 */
function calculateTotalDollarPoints(total) {
    var points = 0;
    var amount = parseFloat(total.trim());
    if (amount % 1.00 == 0) {
        points += 50;
    }
    if (amount % 0.25 == 0) {
        points += 25;
    }
    return points;
}

/** Calculates 5 points for every two items on the receipt.
 *  If the trimmed length of the item description is a multiple of 3, multiply the price by 0.2 and round up to the nearest integer. The result is the number of points earned.
 *  6 points if the day in the purchase date is odd.
 *      @params items – object, list of item objects with description and price of item
 *      @returns points – int, amount of points
 *      
 */
function calculateItemsPoints(items) {
    var points = 0;
    // Calculate the points for pairs of items
    points += Math.floor(items.length / 2) * 5;

    items.forEach(item => {
        if (item['shortDescription'].trim().length % 3 == 0) {
            points += Math.ceil(parseFloat(item['price'].trim()) * 0.2);
        }
    })

    return points;
}

/** Calculates 6 points if the day in the purchase date is odd.
 *      @params date – string, date of purchase
 *      @returns points – int, amount of points
 */
function calculatePurchaseDatePoints(date) {
    if (parseInt(date.trim().substr(-1)) % 2 == 1) {
        return 6;
    } else { return 0; }
}

/** Calculates 10 points if the time of purchase is after 2:00pm and before 4:00pm.
 *      @params time – string, time of purchase
 *      @returns points – int, amount of points    
 */
function calculatePurchaseTimePoints(time) {
    var hour = parseInt(time.trim().split(":")[0]);
    if (hour >= 14 && hour <= 16) {
        return 10;
    } else { return 0; }
}

//******* VALIDATION HELPER FUNCTIONS */

/** Determines if given file or text data is JSON formatted
 *      @params data – file or text content
 *      @returns message – 200 success code, or error message 
 */
function validateJSON(data) {
    // RegEx for proper formatting
    var dateRegEx = /(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})/
    var priceRegEx = /(\d{1, 3}(\, \d{3})*|(\d+))(\.\d{2})/
    var timeRegEx = /([01][0-9]|2[0-3]):[0-5][0-9]/

    if (data == "" || !data){
        return "No data found in request body";
    }

    // Checking retailer name
    else if (!data['retailer']) {
        return "Unable to locate retailer field"
    }
    else if (typeof data['retailer'] != "string") {
        return "Retailer field needs to be of type 'string'"
    }

    // Checking total is formatted for currency
    else if (!data['total']) {
        return "Unable to locate total field"
    }
    else if (!priceRegEx.test(data['total'])) {
        return "Total not properly formatted"
    }

    //Checking that items exist
    else if (!data['items']) {
        return "Unable to locate items object"
    }

    // Checking that the date is formatted YYYY-MM-DD
    else if (!data['purchaseDate']) {
        return "Unable to locate purchaseDate field"
    }
    else if (!dateRegEx.test(data['purchaseDate'])) {
        return "PurchaseDate not properly formatted: YYYY-MM-DD required"
    }

    //Checking that the time is formatted HH:MM
    else if (!data['purchaseTime']) {
        return "Unable to locate purchaseTime field"
    }
    else if (!timeRegEx.test(data['purchaseTime'])) {
        return "PurchaseTime not properly formatted: HH:MM required"
    }

    // If valididated return success code
    else { return 200; }
}


// Default landing route
app.use('/', (req, res) => {
    res.send("Welcome to Receipt Processor");
});

module.exports = app;
