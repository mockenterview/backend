const PORT = process.env.PORT || 5000;
var express = require("express");
var cors = require("cors");
var accountRouter = require("./Routes/AccountRouter.js");
var app = express();
app.use(cors());

//updateable local variables for accountRouter
app.locals.updateableFields = ["email", "password", "firstName", "lastName", "workHistory", "city", "state", "skills", "bio","interviewer", "references"];

app.use(express.json());
app.use("/api", accountRouter);


app.listen(PORT, () => {
    console.log(`App up and running on port ${PORT}`);
})
