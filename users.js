const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const url = require("url");
const axios = require("axios");
const mongoose = require("mongoose");
const redis = require("redis");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
const uri = process.env.MONGODB_CONNECTION;
var User;
async function connectionMongoose() {
  await mongoose.connect(uri).then(() => {
    console.log("mongoose connected...");
  });
  require("./models/Users");
  User = mongoose.model("User");
}

async function initialLoad() {
  await connectionMongoose();
}

initialLoad();

// Get Token JWT
app.get("/", (req, res) => {
  let token;
  try {
    //Creating jwt token
    token = jwt.sign(
      {
        user: process.env.MONGODB_USER,
      },
      "secretkeyappearshere",
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.log(err);
    const error = new Error("Error! Something went wrong.");
    return next(error);
  }
  res.status(200).json({
    success: true,
    data: {
      token: token,
    },
  });
});

// Create User
app.post("/users", async (req, res, next) => {
  if (req.headers.authorization === undefined) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  const token = req.headers.authorization.split(" ")[1];
  //Authorization: 'Bearer TOKEN'
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Error!Token was not provided.",
    });
  }
  //Decoding the token
  var dateNow = new Date();
  // const decodedToken = jwt.verify(token, "secretkeyappearshere");
  const decodedToken = jwt.verify(
    token,
    "secretkeyappearshere",
    function (err, decoded) {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }
    }
  );
  if (
    !req.body.userName &&
    !req.body.emailAddress &&
    !req.body.accountNumber &&
    !req.body.identityNumber
  ) {
    return res.status(400).send({ message: "Content can not be empty!" });
  }
  const user = new User({
    id: uuidv4(),
    userName: req.body.userName,
    emailAddress: req.body.emailAddress,
    accountNumber: req.body.accountNumber,
    identityNumber: req.body.identityNumber,
  });

  await user
    .save()
    .then((data) => {
      client.connect();
      client.set(
        ["st-" + user.id, JSON.stringify(user.toJSON())],
        (err, reply) => {
          if (err) throw err;
          console.log(reply);
        }
      );
      res.send({
        message: "User created successfully!!",
        user: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating user",
      });
    });
});

// Get User
app.get("/users", async (req, res, next) => {
  if (req.headers.authorization === undefined) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  const token = req.headers.authorization.split(" ")[1];
  //Authorization: 'Bearer TOKEN'
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Error!Token was not provided.",
    });
  }
  let data = User;

  if (req.query.keyword !== undefined) {
    data = await User.find({
      $or: [
        { accountNumber: req.query.keyword },
        { identityNumber: req.query.keyword },
      ],
    });
  } else {
    data = await User.find();
  }
  console.log(data.length);
  if (data.length > 0) {
    let result = [];
    for await (const doc of data) {
      console.log(doc);
      result.push({
        id: doc.id,
        email: doc.emailAddress,
        username: doc.userName,
        accountNumber: doc.accountNumber,
        identityNumber: doc.identityNumber,
      });
    }

    return res.status(200).json({
      status: true,
      data: result,
      message: "Data found",
    });
  }

  return res.status(404).json({
    status: true,
    message: "Data not found",
  });
});

app.listen(3000, () => {
  console.log("Microservice listening port 3000...");
});
