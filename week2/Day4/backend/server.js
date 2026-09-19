require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db")

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.get("/", (req, res) => {
    res.send("Api is running")
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`)
    })
}

module.exports = app;