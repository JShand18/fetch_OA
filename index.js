const express = require('express');
const bp = require("body-parser");
const fileUpload = require('express-fileupload');
const crypto = require('crypto');

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
    console.log(receipts.get(req.params.id));
    res.send(receipts.get(req.params.id));

});

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

