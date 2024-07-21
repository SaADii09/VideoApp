// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: "./.env",
})

const port = process.env.PORT

connectDB()
    .then(() => {
        app.listen(port || 8000, () => {
            console.log(`SERVER is running on port ${port}`)
        })
        app.on("error", (error) => {
            console.log("errrr", error)
            throw error
        })
    })
    .catch((err) => {
        console.log("index.js :: mongo connection error :: ", err)
    })
/*
import express from "express";
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("errrr", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`app is listening of port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("indexjs :: databse connection :: errror :", error);
  }
})();
*/
