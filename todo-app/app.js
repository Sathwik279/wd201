const { request, response } = require("express");
const express = require("express");
const app = express();

const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const csrf = require("tiny-csrf");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const localStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

const saltRounds = 10;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs"); //we are not using plain html
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "my-super-secret-key 423422409284294820948204",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24 hrs
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});
passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          if (!user) {
            return done(null, false, { message: "User not found" });
          }
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return error;
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing the user in session", user.id);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.get("/", async (request, response) => {
  response.render("index", {
    title: "Todo application",
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;

    const overdue = await Todo.overdue(loggedInUser);
    const dueToday = await Todo.dueToday(loggedInUser);
    const dueLater = await Todo.dueLater(loggedInUser);
    const completed = await Todo.completed(loggedInUser);

    if (request.accepts("html")) {
      response.render("todos", {
        overdue,
        dueToday,
        dueLater,
        completed,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        overdue,
        dueToday,
        dueLater,
        completed,
      });
    }
  }
);

app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Signup",
    csrfToken: request.csrfToken(),
  });
});

app.post("/users", async (request, response) => {
  const hashedPwd = await bcrypt.hashSync(request.body.password, saltRounds);
  console.log(hashedPwd);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/todos");
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/login", (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    console.log(request.user);
    response.redirect("/todos");
  }
);

app.get("/signout", (request, response, next) => {
  //signout
  request.logout((err) => {
    if (err) {
      return;
    }
    response.redirect("/");
  });
});

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      request.flash("success", "Todo created successfully!");
      return response.redirect("/todos");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        error.errors.forEach((err) => {
          request.flash("error", err.message);
          return response.redirect("/todos");
        });
      }
    }
  }
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("we have to update a todo with ID:", request.params.id); //
    const todo = await Todo.findByPk(request.params.id);
    try {
      if (request.body.completed === "updateCompleted") {
        const updatedTodo = await todo.setCompletionStatus(todo.completed);
        // response.redirect("/todos");
        return response.json(updatedTodo);
      }
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("Delete a todo by ID:", request.params.id);

    try {
      console.log("before todo");
      const todo = await Todo.findByPk(request.params.id);
      console.log("after todo");
      if (!todo) {
        return res
          .status(404)
          .json({ success: false, message: "Todo not found" });
      }

      await Todo.remove(request.params.id, request.user.id);
      console.log({ success: true });
      return response.json({ success: true });
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

module.exports = app;
