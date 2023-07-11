const express = require('express');
const bp = require("body-parser");
const fileUpload = require('express-fileupload');

const app = express();

app.use(fileUpload());
app.set('view engine', 'ejs');
app.use(bp.urlencoded({ extended: true }));
app.use(express.static("public"));

var receipts = new Map();

app.get("/", function (req, res) {
    res.render('launch');
})

app.post('/receipts/process', (req, res) => {
    //Checking to see if form action was a file upload
    if (req.files) {
        // retriving file from the request body
        var file = req.files.file;
        var receipt = JSON.parse(file.data);
        var id = file.md5;

        // checking to see if the receipt already exists
        if (receipts.has(id)) {
            console.log(`Receipt ${id} already being track.`);
        } else {
            receipts.set(id, receipt);
        }
    }
    else {
        res.send('There are no files');
    }
    res.redirect('/');
});

app.get('receipts/{id}/points', (req, res) => {

});

// This just sends back a message for any URL path not covered above
app.use('/', (req, res) => {
    res.send('Default message');
});

// This starts the web server on port 3000. 
app.listen(3000, () => {
    console.log('Listening on port 3000');
});

