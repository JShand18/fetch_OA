const app = require("./app");
const port = 3000;


// This starts the web server on port 3000. 
app.listen(port, () => {
    console.log(`Listening on port: http://localhost:${port}`);
});