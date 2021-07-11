const express = require("express");
const mongoose = require("mongoose");
const Message = require("./models/message.js");
const User = require("./models/user.js");
const session = require("express-session");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");

const app = express();

mongoose
  .connect("mongodb://localhost:27017/chatAppV1", {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("database connected");
  })
  .catch(() => {
    console.log("error connecting to database");
  });

app.set("view engine", "ejs");
app.set("views", "./views");
app.engine("ejs", ejsMate);

app.use("/static", express.static("public"));
app.use(
  session({
    secret: "my own secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get("/favicon.ico", (req, res) => {
  return res.end();
});
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  console.log(req.method, req.originalUrl);
  next();
});

app.get("/login", (req, res) => {
  res.render("loginForm.ejs");
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  let verify = false;
  if (user) {
    verify = await bcrypt.compare(password, user.password);
  }
  if (user && verify) {
    req.session.userId = user._id;
    req.flash("success", "Logged in!");
    return res.redirect(`/${user._id}`);
  } else {
    console.log("invalid credentials");
    req.flash("error", "Invalid credentials");
    return res.redirect("/login");
  }
});
app.post("/logout", (req, res) => {
  req.session.userId = null;
  req.flash("success", "Successfuly logged out");
  return res.redirect("/login");
});
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    console.log("username already exists");
    req.flash("error", "Username already exists");
    return res.redirect("/login");
  } else {
    const hashedPw = await bcrypt.hash(password.toString(), 12);
    const newUser = new User({ username, password: hashedPw });
    await newUser.save();
    console.log(newUser);
    req.flash("success", "Registered successfuly! Login to continue");
    return res.redirect("/login");
  }
});

// check login
app.use((req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    return res.redirect("/login");
  }
});
const checkLogin = (req, res, next) => {
  if (req.session.userId !== req.params.id) {
    console.log("access denied");
    req.session.userId != null;
    return res.redirect(`/login`);
  } else {
    next();
  }
};

const findIndex = (userOne, key, userTwo) => {
  for (let i = 0; i < userOne[key].length; i++) {
    if (userOne[key][i].username === userTwo.username) {
      return i;
    }
  }
  return -1;
};

app.get("/:id", checkLogin, async (req, res) => {
  const user = await User.findById(req.params.id);
  return res.render("userHomePage.ejs", { user });
});
app.post("/:id/remove/:contactId", checkLogin, async (req, res) => {
  const userOne = await User.findById(req.params.id);
  const userTwo = await User.findById(req.params.contactId);
  const messagesId =
    userOne.contacts[findIndex(userOne, "contacts", userTwo)].messages;
  await Message.findByIdAndDelete(messagesId);
  userOne.contacts.splice(findIndex(userOne, "contacts", userTwo), 1);
  userTwo.contacts.splice(findIndex(userTwo, "contacts", userOne), 1);
  await userOne.save();
  await userTwo.save();
  return res.redirect(`/${req.params.id}`);
});
app.post("/:id/sendrequest", checkLogin, async (req, res) => {
  const userTwo = await User.findOne({ username: req.body.username });
  const userOne = await User.findById(req.params.id);

  if (userTwo) {
    if (userTwo.username === userOne.username) {
      console.log("cannot enter your username");
      req.flash("error", "Cannot enter your own username");
      return res.redirect(`/${req.params.id}`);
    } else if (
      findIndex(userOne, "contactAddRequests", userTwo) !== -1 ||
      findIndex(userTwo, "contactAddRequests", userOne) !== -1 ||
      findIndex(userOne, "contacts", userTwo) !== -1
    ) {
      console.log(
        "request already recieved || request already sent || user already in contacts"
      );
      req.flash(
        "error",
        "Request already recieved OR Request already sent OR User already in contacts"
      );
      return res.redirect(`/${req.params.id}`);
    }
    userTwo.contactAddRequests.push({
      id: userOne._id,
      username: userOne.username,
    });
    await userTwo.save();
    req.flash("success", "Request sent successfuly!");
    return res.redirect(`/${req.params.id}`);
  } else {
    console.log("username doesn't exist");
    req.flash("error", "Username doesn't exist");
    return res.redirect(`/${req.params.id}`);
  }
});
app.post("/:id/accept/:reqId", checkLogin, async (req, res) => {
  const userTwo = await User.findById(req.params.reqId);
  const userOne = await User.findById(req.params.id);
  const messages = new Message({
    chats: [],
    numMessages: 0,
  });
  userOne.contacts.push({
    id: userTwo._id,
    username: userTwo.username,
    messages: messages._id,
  });
  userTwo.contacts.push({
    id: userOne._id,
    username: userOne.username,
    messages: messages._id,
  });
  userOne.contactAddRequests.splice(
    findIndex(userOne, "contactAddRequests", userTwo),
    1
  );
  await userOne.save();
  await userTwo.save();
  await messages.save();
  return res.redirect(`/${req.params.id}`);
});
app.post("/:id/decline/:reqId", checkLogin, async (req, res) => {
  const userOne = await User.findById(req.params.id);
  const userTwo = await User.findById(req.params.reqId);
  userOne.contactAddRequests.splice(
    findIndex(userOne, "contactAddRequests", userTwo),
    1
  );
  await userOne.save();
  return res.redirect(`/${req.params.id}`);
});

app.get("/:id/chats/:contactId", checkLogin, async (req, res) => {
  const userOne = await User.findById(req.params.id);
  const userTwo = await User.findById(req.params.contactId);
  const messagesId =
    userOne.contacts[findIndex(userOne, "contacts", userTwo)].messages;
  res.render("chats.ejs", { messagesId, userOne, userTwo });
});
app.post("/:id/chats/:contactId", checkLogin, async (req, res) => {
  const userOne = await User.findById(req.params.id);
  const userTwo = await User.findById(req.params.contactId);
  const messagesId =
    userOne.contacts[findIndex(userOne, "contacts", userTwo)].messages;
  const messages = await Message.findById(messagesId);
  messages.numMessages += 1;
  messages.chats.push({
    body: req.body.body,
    sender: userOne.username,
    rank: messages.numMessages,
  });
  await messages.save();
  return res.redirect(`/${req.params.id}/chats/${req.params.contactId}`);
});
app.get(
  "/:id/chats/:contactId/:messagesId",
  (req, res, next) => {
    if (req.session.userId !== req.params.id) {
      return res.send(new Error("access denied"));
    }
    next();
  },
  async (req, res) => {
    const messages = await Message.findById(req.params.messagesId);
    return res.send(messages);
  }
);
let port = process.env.PORT || 80;
app.listen(port);
