import express from "express";
import dotenv  from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
/* */
/* ROUTE IMPORTS */
import dashboardRoutes from "./routes/dashboardRoutes"
import userRoutes from "./routes/userRoutes"


import blockRoutes from "./routes/blockRoutes"
import blockTypeRoutes from "./routes/blockTypeRoutes"
import supplierRoutes from "./routes/supplierRoutes"

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
const path = require('path');


// Serve static files (such as favicon.ico) from the public folder
app.use(express.static(path.join(__dirname, 'public'))); // This will serve all static assets from the 'public' folder

/* ROUTES */
app.use("/dashboard", dashboardRoutes); //http://localhost:8000/dashboard
app.use("/inventory", blockRoutes); //http://localhost:8000/inventory
app.use("/users", userRoutes); //http://localhost:8000/users
app.use("/blocks", blockRoutes); // http://localhost:8000/blocks
app.use("/blocks/suppliers", blockRoutes); // http://localhost:8000/suppliers
app.use("/blockTypes", blockTypeRoutes); // http://localhost:8000/blockTypes

app.use("/suppliers", supplierRoutes); // http://localhost:8000/suppliers


/* SERVER */
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
