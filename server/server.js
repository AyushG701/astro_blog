import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import User from "./Schema/User.js";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./react-blog-site-f66c6-firebase-adminsdk-ppykz-28e7e0c625.json" assert { type: "json" };
import { getAuth } from "firebase/auth";
import cloudinary from "cloudinary";
import fse from "fs-extra";

const server = express({
  limit: "20mb",
});
let PORT = 3000;
let slatRounds = 10;

// for google auth
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

// cloudanary config
const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUD_KEY,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

//generate Upload Url

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

// database connect
const uri = `${process.env.DB_LOCATION}/${process.env.DB_NAME}`;
mongoose.connect(uri, {
  autoIndex: true,
});
// middleware
server.use(express.json());
server.use(cors());

//  controller
//auth controller

const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY,
  );
  return {
    access_token,
    profileimg: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => {
    return result;
  });
  !isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : "";

  return username;
};

server.post("/signup", (req, res) => {
  let { fullname, email, password } = req.body;
  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "Fullname must be at least 3 characters long" });
  }
  if (!email.length) {
    return res
      .status(403)
      .json({ error: "Please enter a valid email address" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "Email is invalid" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Password must be at least 6 characters long and less than 20 characters long and must contain at least 1 numeric, 1 lowercase, and 1 uppercase character",
    });
  }
  bcrypt.hash(password, slatRounds, async (err, hashed_password) => {
    let username = await generateUsername(email);

    let user = new User({
      personal_info: { fullname, email, password: hashed_password, username },
    });

    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDatatoSend(u));
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(409).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
      });
    console.log(hashed_password);
  });

  //   return res.status(200).json({ status: "okay" });
});

server.post("/signin", (req, res) => {
  let { email, password } = req.body;
  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        res.status(403).json({ error: "Email not found" });
      }

      if (!user.google_auth) {
        bcrypt.compare(password, user.personal_info.password, (err, result) => {
          if (err) {
            return res.status(500).json({
              error: "Error occurred while trying to login. Please try again",
            });
          }
          if (!result) {
            res.status(403).json({ error: "Incorrect password" });
          } else {
            return res.status(200).json(formatDatatoSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error:
            "Account was created using google . Try Logging in with google ",
        });
      }
      //   return res.json({ status: "got the user document" });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(403).json({ error: "Email not found" });
    });
});

// google auth sign in
server.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;

  admin
    .auth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;
      picture = picture.replace("s96-c", "s384-c");
      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google_auth",
        )
        .then((u) => {
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });

      if (user) {
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed up without google . Please login with password to access the account",
          });
        }
      } else {
        let username = await generateUsername(email);

        user = new User({
          personal_info: {
            fullname: name,
            email,
            profile_img: picture,
            username,
          },
          google_auth: true,
        });
        await user
          .save()
          .then((u) => {
            user = u;
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }

      return res.status(200).json(formatDatatoSend(user));
    })
    .catch((err) => {
      return res.status(500).json({
        error:
          "Failed to authenticate you with google Try with some other google account",
      });
    });

  // User is authenticated, you can now handle the request accordingly
});
// to get the signature if the frontned send the reight image
server.get("/get-signature", (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
      },
      cloudinaryConfig.api_secret,
    );
    res.json({ timestamp, signature });
  } catch (error) {
    console.error("Error generating signature:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//upload image url root
server.post("/do-something-with-photo", async (req, res) => {
  // based on the public_id and the version that the (potentially malicious) user is submitting...
  // we can combine those values along with our SECRET key to see what we would expect the signature to be if it was innocent / valid / actually coming from Cloudinary
  const expectedSignature = cloudinary.utils.api_sign_request(
    { public_id: req.body.public_id, version: req.body.version },
    cloudinaryConfig.api_secret,
  );

  // We can trust the visitor's data if their signature is what we'd expect it to be...
  // Because without the SECRET key there's no way for someone to know what the signature should be...
  if (expectedSignature === req.body.signature) {
    // Do whatever you need to do with the public_id for the photo
    // Store it in a database or pass it to another service etc...
    await fse.ensureFile("./data.txt");
    const existingData = await fse.readFile("./data.txt", "utf8");
    await fse.outputFile(
      "./data.txt",
      existingData + req.body.public_id + "\n",
    );
    console.log(req.body.public_id);
  }
});

// server.get("/view-photos", async (req, res) => {
//   try {
//     // Ensure that the data file exists
//     await fse.ensureFile("./data.txt");

//     // Read existing data from the file
//     const existingData = await fse.readFile("./data.txt", "utf8");

//     // Split the data by newline and filter out empty items
//     const photoIds = existingData.split("\n").filter((item) => item);

//     // Map the photoIds to Cloudinary image URLs
//     const photoUrls = photoIds.map(
//       (id) =>
//         `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/${id}.jpg`,
//     );

//     // Send the array of image URLs as JSON response
//     res.json(photoUrls);
//   } catch (error) {
//     console.error("Error viewing photos:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

server.listen(PORT, () => {
  console.log("listening on the port -> " + PORT);
});

// to check the connection or any error
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to the database successfully!");
});
