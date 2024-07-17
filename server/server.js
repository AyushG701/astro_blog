import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./react-blog-site-f66c6-firebase-adminsdk-ppykz-28e7e0c625.json" assert { type: "json" };
import { getAuth } from "firebase/auth";
import cloudinary from "cloudinary";
import fse from "fs-extra";

import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";

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
// const generateSignedUploadUrl = () => {
//   return new Promise((resolve, reject) => {
//     try {
//       const options = {
//         folder: "uploads",
//         resource_type: "image",
//       };

//       const signedUploadUrl = cloudinary.utils.private_download_url(
//         "sample.jpg",
//         "jpg",
//         options,
//       );
//       resolve(signedUploadUrl);
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

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

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);

  if (token == null) {
    return res.status(401).json({ error: "No access token" });
  }
  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }
    req.user = user.id;
    next();
  });
};

//  controller
//auth controller

const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY,
  );
  console.log(access_token);
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
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
// change password route
server.post("/change-password", verifyJWT, (req, res) => {
  let { currentPassword, newPassword } = req.body;
  // validataion
  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    return res.status(403).json({
      error:
        "Password must be at least 6 characters long and less than 20 characters long and must contain at least 1 numeric, 1 lowercase, and 1 uppercase character",
    });
  }
  User.findOne({ _id: req.user })
    .then((user) => {
      if (user.google_auth) {
        return res.status(500).json({
          error: "Account was created using Google /Can't change Password",
        });
      }
      // password comparing
      bcrypt.compare(
        currentPassword,
        user.personal_info.password,
        (err, result) => {
          if (err) {
            return res.status(500).json({
              error:
                "An error occurred while changing your password. Please try again",
            });
          }
          if (!result) {
            return res
              .status(403)
              .json({ error: "Current password is incorrect" });
          }
          bcrypt.hash(newPassword, slatRounds, (err, hashed_password) => {
            User.findOneAndUpdate(
              { _id: req.user },
              { "personal_info.password": hashed_password },
            )
              .then((u) => {
                return res.status(200).json({ status: "Password updated" });
              })
              .catch((err) => {
                return res.status(500).json({
                  error:
                    "An error occurred while changing your password. Please try again",
                });
              });
          });
        },
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(403).json({ error: "User not found" });
    });
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

server.get("/get-upload-url", async (req, res) => {
  try {
    // Ensure that the data file exists
    console.log("Ensuring data file exists...");
    await fse.ensureFile("./data.txt");

    // Read existing data from the file
    console.log("Reading existing data from the file...");
    const existingData = await fse.readFile("./data.txt", "utf8");

    // Split the data by newline and filter out empty items
    console.log("Splitting data and filtering...");
    const photoIds = existingData.split("\n").filter((item) => item);

    // Map the photoIds to Cloudinary image URLs
    console.log("Mapping photoIds to image URLs...");
    const photoUrls = photoIds.map(
      (id) =>
        `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/${id}.jpg`,
    );

    // Send the array of image URLs as JSON response
    console.log("Sending response...");
    res.json(photoUrls);
  } catch (error) {
    console.error("Error viewing photos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update profile image
server.post("/update-profile-image", verifyJWT, (req, res) => {
  let { url } = req.body;
  User.findOneAndUpdate({ _id: req.user }, { "personal_info.profile_img": url })
    .then(() => {
      return res.status(200).json({ profile_img: url });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
// update the profile form without image
server.post("/update-profile", verifyJWT, (req, res) => {
  let { username, bio, social_links } = req.body;
  let bioLimit = 150;
  if (username.length < 3) {
    return res
      .status(403)
      .json({ error: "Username should be at least be 3 letters long" });
  }

  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: `Bio should be less than 200 characters   ` });
  }

  let socialLinksArr = Object.keys(social_links);

  try {
    for (let i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i].length]) {
        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

        if (
          !hostname.includes(`${socialLinksArr[i].com}`) &&
          socialLinksArr[i] !== "website"
        ) {
          return res.status(403).json({
            error: `${socialLinksArr[i]} link is invalid . you must enter a proper or valid link`,
          });
        }
      }
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: "You must privide full social link with https included" });
  }

  let updateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };
  User.findOneAndUpdate({ _id: req.user }, updateObj, {
    runValidators: true,
  })
    .then(() => {
      return res.json({ username });
    })
    .catch((err) => {
      if (err.code == 11000) {
        return res.status(403).json({ error: "Username already exists" });
      }
      return res.status(500).json({ error: err.message });
    });
});

// to create the blog
server.post("/create-blog", verifyJWT, (req, res) => {
  // 'verifyJWT' middleware verifies the JWT and attaches the user id to 'req.user'
  const authorId = req.user;

  // Destructure necessary fields from the request body
  let { title, des, banner, tags, content, draft, id } = req.body;

  // Validate the blog's content

  if (!title.length) {
    return res
      .status(403)
      .json({ error: "You must provide a title to publish" });
  }

  if (!draft) {
    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide a description under 200 characters to publish",
      });
    }
    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide a blog banner to publish" });
    }
    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it" });
    }
    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags in order to publish the blog, Maximum 10",
      });
    }
  }

  // Convert all tags to lowercase
  tags = tags.map((tag) => tag.toLowerCase());

  // Generate a unique blog ID if it doesn't exist, combining a sanitized title and a unique identifier
  let blog_id =
    id ||
    title
      .replace(/[^a-zA-Z0-9]/g, " ") // Remove non-alphanumeric characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .trim() + nanoid(); // Append a unique identifier

  // Log blog details for debugging purposes
  console.log(
    "title---" +
      title +
      "banner---" +
      banner +
      "content---" +
      JSON.stringify(content) +
      "tags---" +
      tags +
      "des---" +
      des +
      "draft---" +
      draft +
      "id---" +
      id +
      "blog_id---" +
      blog_id,
  );

  if (id) {
    Blog.findOneAndUpdate(
      { blog_id },
      { title, des, banner, content, tags, draft: draft ? draft : false },
    )
      .then((blog) => {
        return res.status(200).json({ id: blog_id });
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ error: "Failed to update total post number" + err });
      });
  } else {
    // Create a new blog entry in the database
    let blog = new Blog({
      title,
      des,
      banner,
      content,
      tags,
      author: authorId,
      blog_id,
      draft: Boolean(draft), // Convert draft to a boolean
    });
    // Save the blog to the database
    blog
      .save()
      .then((blog) => {
        let incrementVal = draft ? 0 : 1; // Increment the post count only if the blog is not a draft

        // Update the user's account info with the new post
        User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { "account_info.total_posts": incrementVal }, // Increment total posts count
            $push: { blogs: blog._id }, // Add the blog ID to the user's blogs array
          },
        )
          .then((user) => {
            // Respond with the new blog ID
            return res.status(200).json({ id: blog.blog_id });
          })
          .catch((err) => {
            // Handle errors related to updating the user's post count
            return res
              .status(500)
              .json({ error: "Failed to update the post number" });
          });
      })
      .catch((err) => {
        // Handle errors related to saving the blog
        return res.status(500).json({ error: err.message });
      });
  }
});

// the latest blog  gets data from the database
server.post("/latest-blog", (req, res) => {
  // we want only the blog with draft false
  let maxLimit = 5;
  let { page } = req.body;

  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id",
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(400).json({ error: err.message });
    });
});

server.get("/trending-blog", (req, res) => {
  let maxLimit = 5;
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id",
    )
    .sort({
      publishedAt: -1,
      "activity.total_read": -1,
      "activity.total_likes": -1,
    })
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//  to search blogs and also filter it
server.post("/search-blogs", (req, res) => {
  let { tag, query, page, author, limit, eliminate_blog } = req.body;
  console.log(tag);
  let findQuery;
  let maxLimit = limit ? limit : 2;

  if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  Blog.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id",
    )
    .sort({
      publishedAt: -1,
    })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
// to get the latest blogs count pagenation
server.post("/all-latest-blogs-count", (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({
        totalDocs: count,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err.message,
      });
    });
});

server.post("/search-blogs-count", (req, res) => {
  let { tag, query, author } = req.body;
  console.log(author);
  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { title: new RegExp(query, "i"), draft: false };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({
        totalDocs: count,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        error: err.message,
      });
    });
});
// saerch the user profile
server.post("/search-users", (req, res) => {
  let { query } = req.body;
  User.find({ "personal_info.username": new RegExp(query, "i") })
    .limit(50)
    .select(
      "personal_info.fullname personal_info.username personal_info.profile_img -_id",
    )
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});
// get profile route
server.post("/get-profile", (req, res) => {
  let { username } = req.body;
  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

// route to geth teh blog from its id
server.post("/get-blog", (req, res) => {
  let { blog_id, mode } = req.body;
  let incrementVal = mode !== "edit" ? 1 : 0;
  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementVal } },
  )
    .populate(
      "author",
      "personal_info.fullname personal_info.username personal_info.profile_img",
    )
    .select("title des content banner activity publishedAt blog_id tags")
    .then((blog) => {
      User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        { $inc: { "account_info.total_reads": incrementVal } },
      ).catch((err) => {
        return res.status(500).json({ error: err.message });
      });

      if (blog.draft && !draft) {
        return res
          .status(500)
          .json({ error: "You can't read this draft blog" });
      }
      return res.status(200).json({ blog });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

// route to update the like and

server.post("/like-blog", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id, isLikedByUser } = req.body;

  console.log(_id, isLikedByUser);

  let incrementVal = !isLikedByUser ? 1 : -1;

  Blog.findOneAndUpdate(
    { _id },
    {
      $inc: {
        "activity.total_likes": incrementVal,
      },
    },
  ).then((blog) => {
    if (!isLikedByUser) {
      let like = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });

      like
        .save()
        .then((notification) => {
          return res.status(200).json({ liked_by_user: true });
        })
        .catch((err) => {
          return res.status(500).json({
            error: "failed to add the liked",
          });
        });
    } else {
      Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
        .then(() => {
          return res.status(200).json({
            liked_by_user: false,
          });
        })
        .catch((err) => {
          return res.status(500).json({
            error: err.message,
          });
        });
    }
  });
});

// routes to like the user
server.post("/isliked-by-user", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id } = req.body;

  Notification.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      return res.status(200).json({
        result,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        err: err.message,
      });
    });
});

// server.post("/add-comment", verifyJWT, (req, res) => {
//   let user_id = req.user;

//   let { _id, comment, replying_to, blog_author, notification_id } = req.body;
//   if (!comment.length) {
//     return res
//       .status(403)
//       .json({ error: "Write something to leave a comment" });
//   }

//   // creating a comment document
//   let commentObj = {
//     blog_id: _id,
//     blog_author,
//     comment,
//     commented_by: user_id,
//     isReply: Boolean(replying_to),
//   };

//   if (replying_to) {
//     commentObj.parent = replying_to;
//     // commentObj.isReply = true;
//   }

//   // then save it
//   new Comment(commentObj).save().then(async (commentFile) => {
//     let { comment, commentedAt, children } = commentFile;
//     Blog.findOneAndUpdate(
//       { _id },
//       {
//         $push: { comments: commentFile._id },
//         $inc: { "activity.total_comments": 1 },
//         "acticity.total_parent_comments": replying_to ? 0 : 1,
//       },
//     ).then((blog) => {
//       console.log("New Comment created", blog);
//     });

//     let notificationObj = {
//       type: replying_to ? "reply" : "comment",
//       blog: _id,
//       notification_for: blog_author,
//       user: user_id,
//       comment: commentFile._id,
//     };
//     if (replying_to) {
//       notificationObj.replied_on_comment = replying_to;
//       await Comment.findOneAndUpdate(
//         { _id: replying_to },
//         { $push: { children: commentFile._id } },
//       ).then((reply) => {
//         notificationObj.notification_for = reply.commented_by;
//       });

//       if (notification_id) {
//         Notification.findOneAndUpdate(
//           { _id: notification_id },
//           { reply: commentFile._id },
//         ).then((notification) => console.log("notification updated"));
//       }
//     }
//     new Notification(notificationObj)
//       .save()
//       .then((notification) => console.log("new notification created"));

//     return res.status(200).json({
//       comment,
//       commentedAt,
//       _id: commentFile._id,
//       children,
//     });
//   });
// });

server.post("/add-comment", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id, comment, replying_to, blog_author, notification_id } = req.body;
  if (!comment.length) {
    return res
      .status(403)
      .json({ error: "Write something to leave a comment..." });
  }
  let commentObj = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
    isReply: Boolean(replying_to),
  };
  if (replying_to) {
    commentObj.parent = replying_to;
  }
  new Comment(commentObj)
    .save()
    .then(async (commentFile) => {
      let { comment, commentedAt, children } = commentFile;
      Blog.findOneAndUpdate(
        { _id },
        {
          $push: { comments: commentFile._id },
          $inc: {
            "activity.total_comments": 1,
            "activity.total_parent_comments": replying_to ? 0 : 1,
          },
        },
      ).then((blog) => {
        console.log("New comment added");
      });
      let notificationObj = {
        type: replying_to ? "reply" : "comment",
        blog: _id,
        notification_for: blog_author,
        user: user_id,
        comment: commentFile._id,
      };
      if (replying_to) {
        notificationObj.replied_on_comment = replying_to;
        await Comment.findOneAndUpdate(
          { _id: replying_to },
          { $push: { children: commentFile._id } },
        ).then((reply) => {
          notificationObj.notification_for = reply.commented_by;
        });
        if (notification_id) {
          Notification.findOneAndUpdate(
            { _id: notification_id },
            { reply: commentFile._id },
          ).then((notification) => console.log("Notification updated"));
        }
      }
      new Notification(notificationObj)
        .save()
        .then((notification) => console.log("New notification created"));
      return res.status(200).json({
        comment,
        commentedAt,
        _id: commentFile._id,
        user_id,
        children,
      });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

// get the parent comments not replies
server.post("/get-blog-comments", (req, res) => {
  let { blog_id, skip } = req.body;
  let maxLimit = 5;
  Comment.find({ blog_id, isReply: false })
    .populate(
      "commented_by",
      "personal_info.username, personal_info.fullname personal_info.profile_img",
    )
    .skip(skip)
    .limit(maxLimit)
    .sort({
      commentedAt: -1,
    })
    .then((comment) => {
      return res.status(200).json({ comment });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});
// get replies

server.post("/get-replies", (req, res) => {
  let { _id, skip } = req.body;

  let maxLimit = 5;

  Comment.findOne({ _id })
    .populate({
      path: "children",
      options: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: -1 },
      },
      populate: {
        path: "commented_by",
        select:
          "personal_info.profile_img personal_info.fullname personal_info.username ",
      },
      select: "-blog_id -updatedAt",
    })
    .select("children")
    .then((doc) => {
      return res.status(200).json({
        replies: doc.children,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err.message,
      });
    });
});

// new notification alter
server.get("/new-notification", verifyJWT, (req, res) => {
  let user_id = req.user;

  Notification.exists({
    notification_for: user_id,
    seen: false,
    user: { $ne: user_id },
  })
    .then((result) => {
      if (result) {
        return res.status(200).json({ new_notification_avaiable: true });
      } else {
        return res.status(200).json({ new_notification_avaiable: false });
      }
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: req.message });
    });
});

// notification page
server.post("/notifications", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { page, filter, deletedDocCount } = req.body;

  let maxLimit = 10;
  let findQuery = { notification_for: user_id, user: { $ne: user_id } };

  let skipDocs = (page - 1) * maxLimit;

  if (filter !== "all") {
    findQuery.type = filter;
  }
  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }
  Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate(
      "user",
      "personal_info.fullname personal_info.profile_img personal_info.username",
    )
    .populate(
      "comment",
      "comment comment_id comment_text comment_date comment_by",
    )
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply")
    .then((notifications) => {
      Notification.updateMany(findQuery, { seen: true })
        .skip(skipDocs)
        .limit(maxLimit)
        .then(() => {
          console.log("notification seen");
        });
      return res.status(200).json({ notifications });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });

  Notification.find({ notification_for: user_id, seen: false }).populate(
    "user",
  );
});

server.post("/all-notifications-count", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { filter } = req.body;

  let findQuery = { notification_for: user_id, user: { $ne: user_id } };

  if (filter !== "all") {
    findQuery.type = filter;
  }

  Notification.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

// delete comment function
const deleteComments = (_id) => {
  Comment.findOneAndDelete({ _id })
    .then((comment) => {
      if (comment.parent) {
        Comment.findOneAndUpdate(
          { _id: comment.parent },
          { $pull: { children: _id } },
        )
          .then((data) => console.log("Comment deleted"))
          .catch((err) => console.log(err));
      }
      Notification.findOneAndDelete({ comment: _id }).then((notification) =>
        console.log("Notification deleted"),
      );
      Notification.findOneAndUpdate(
        { reply: _id },
        { $unset: { reply: 1 } },
      ).then((notification) => console.log("Notification deleted"));
      Blog.findOneAndUpdate(
        { _id: comment.blog_id },
        {
          $pull: { comments: _id },
          $inc: {
            "activity.total_comments": -1,
            "activity.total_parent_comments": comment.parent ? 0 : -1,
          },
        },
      ).then((blog) => {
        if (comment.children.length) {
          comment.children.map((child) => {
            deleteComments(child);
          });
        }
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
};

server.post("/delete-comment", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id } = req.body;
  Comment.findOne({ _id })
    .then((comment) => {
      if (user_id == comment.commented_by || user_id == comment.blog_author) {
        deleteComments(_id);
        return res.status(200).json({ status: "done" });
      } else {
        return res
          .status(200)
          .json({ error: "You cannot delete this comment" });
      }
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

// server.post("/delete-comment", verifyJWT, (req, res) => {
//   let user_id = req.user;

//   let { _id } = req.body;

//   Comment.findOne({ _id }).then((commet) => {
//     if (user_id == commet.commented_by || user_id == commet.blog_author) {
//       Comment.findOneAndDelete(commet._id).then((comment) => {
//         Notification.findOneAndDelete({ comment: _id }).then((notification) => {
//           console.log("notification deleted");
//         });

//         Blog.findOneAndUpdate(
//           { _id: comment.blog_id },
//           {
//             $pull: {
//               comments: _id,
//             },
//             $inc: { "activity.total_comments": -1 },
//             "activity.total_parent_comments": -1,
//           },
//         )
//           .then((message) => {
//             console.log("done");
//           })
//           .catch((err) => {
//             console.log(err.message);
//           });
//         return res.status(200).json({
//           status: "done",
//         });
//       });
//     } else {
//       return res.status(403).json({
//         error: "you cannnot delete ",
//       });
//     }
//   });
// });

server.post("/user-written-blogs", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { page, draft, query, deletedDocCount } = req.body;
  let maxLimit = 5;
  let skipDocs = (page - 1) * maxLimit;

  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  Blog.find({ author: user_id, draft, title: new RegExp(query, "i") })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select("title banner publishedAt blog_id activity des draft -_id")
    .then((blogs) => {
      return res.status(200).json({ blogs: blogs });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ error: err.message });
    });
});

server.post("/delete-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { blog_id } = req.body;
  Blog.findOneAndDelete({ blog_id })
    .then((blog) => {
      Notification.deleteMany({ blog: blog._id }).then((data) =>
        console.log("Notifications deleted"),
      );
      Comment.deleteMany({ blog_id: blog._id }).then((data) =>
        console.log("Comments deleted"),
      );
      User.findOneAndUpdate(
        { _id: user_id },
        {
          $pull: { blogs: blog._id },
          $inc: { "account_info.total_posts": -1 },
        },
      ).then((user) => console.log("Blog deleted"));
      return res.status(200).json({ status: "done" });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/user-written-blogs-count", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { draft, query } = req.body;
  Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, "i") })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.listen(PORT, () => {
  console.log("listening on the port -> " + PORT);
});

// to check the connection or any error
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to the database successfully!");
});
