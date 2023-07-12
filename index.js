const express = require('express');
const bp = require("body-parser");
const fileUpload = require('express-fileupload');
const crypto = require('crypto');
const { type } = require('os');

const app = express();

app.use(fileUpload());
app.set('view engine', 'ejs');
app.use(bp.urlencoded({ extended: true }));
app.use(express.static("public"));

var receipts = new Map();

app.get('/index', function (req, res) {
    res.render('launch', { receipts: receipts });
})

app.post('/receipts/process', (req, res) => {
    //Checking to see if form action was a file upload
    if (req.files) {
        // retriving file from the request body
        var file = req.files.file;
        // validate that file is a JSON file
        if (validateJSON(file.data)) {
            var receipt = JSON.parse(file.data);
            var id = crypto.createHash('md5').update(JSON.stringify(receipt)).digest('hex');
            //var id = file.md5;
            // checking to see if the receipt already exists
            if (receipts.has(id)) {
                console.log(`Receipt ${id} already being track.`);
            } else {
                receipts.set(id, receipt);
                //res.json({"id" : id});
            }
        } else {
            console.log("Not valid JSON file");
        }
    }
    else if (req.body.text) {
        var text = req.body.text;
        if (validateJSON(text)) {
            var receipt = JSON.parse(text);
            var id = crypto.createHash('md5').update(JSON.stringify(receipt)).digest('hex');
            if (receipts.has(id)) {
                console.log(`Receipt ${id} already being track.`);
            } else {
                receipts.set(id, receipt);
                //res.json({"id" : id});
            }
        } else {
            console.log(text);
            console.log("Not valid JSON formatted text");
        }
    }
    else {
        console.log("No valid JSON provided");
    }
    res.redirect('/index');
});

app.get('/receipts/:id/points', (req, res) => {
    var receipt = receipts.get(req.params.id);
    res.json({ "points": calculateTotalSumPoints(receipt) });

});


function calculateTotalSumPoints(receipt) {

    var totalPoints = 0;
    totalPoints += calculateRetailerPoints(receipt['retailer']);
    totalPoints += calculateTotalDollarPoints(receipt['total']);
    totalPoints += calculatePurchaseTimePoints(receipt['purchaseTime']);
    totalPoints += calculatePurchaseDatePoints(receipt['purchaseDate']);
    totalPoints += calculateItemsPoints(receipt['items']);

    console.log(totalPoints);


    return totalPoints;
}

function calculateRetailerPoints(retailer) {
    var regex = /[a-zA-Z0-9]/g;
    return retailer.match(regex).length;
}

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

function calculatePurchaseTimePoints(time) {
    var hour = parseInt(time.split(":")[0]);
    if (hour >= 14 && hour <= 16) {
        return 10;
    } else { return 0; }
}

function calculatePurchaseDatePoints(date) {
    if (parseInt(date.substr(-1)) % 2 == 1) {
        return 6;
    } else { return 0; }
}

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

function validateJSON(data) {
    try {
        JSON.parse(data);
        return true;
    } catch (err) {
        return false;
    }
}





app.use('/', (req, res) => {
    res.redirect('/index')
});


// This starts the web server on port 3000. 
app.listen(3000, () => {
    console.log('Listening on port 3000');
});

