const PORT = process.env.PORT || 5000;
var express = require("express");
var app = express();

app.listen(() => {
    console.log(`App up and running on port ${PORT}`);
})
