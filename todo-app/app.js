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

const saltRounds = 10;
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs"); //we are not using plain html

app.use(express.static(path.join(__dirname, "public")));

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

//definig the authentication strategy
passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done("Invalid password");
          }
          //whenever the user is properly authenticated we are passing the user obejct through the done callback if the user is not properly authenticated we are passing the error function back
        })
        .catch((error) => {
          return error;
        });
    }
  )
);

// if the user is valid we need to store the user credentials inside the session
//storing the user in the session storage for later retireival
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

// app.get("/todos", async (request, response) => {
//   console.log("Fetching the Todo list");
//   try {
//     const todoList = await Todo.findAll();
//     return response.json(todoList);
//   } catch (error) {
//     cconsole.log(error);
//     return response.status(422).json(error);
//   }
// });
// app.get("/", async (request, response) => {
//   const allTodos = await Todo.getTodos();
//   if (request.accepts("html")) {
//     response.render("index", {
//       allTodos,
//     });
//   } else {
//     response.json({
//       allTodos,
//     });
//   }
// });

app.get("/", async (request, response) => {
  response.render("index", {
    title: "Todo application",
    csrfToken: request.csrfToken(),
  });
});

//this connectEnsureLogin.ensureLoggedIn() only allows the logged n user to access this endpoint....
app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    // const allTodos = await Todo.getTodos();
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
  //Hash the password using bcrypt
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
      //once the user is created we are passing the user object through the request.login functin and this allow the user object through the todos endpoint
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
  passport.authenticate("local", { failureRedirect: "/login" }),
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
    console.log("Creating a todo", request.body);
    console.log(request.user);
    // Todo
    try {
      await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });

      // return response.json(todo); //initially
      return response.redirect("/todos"); //now this is done using the form in the / endpoint
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
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

    // try {
    //   const todo = await Todo.findByPk(request.params.id);
    //   if (!todo) {
    //     return response.status(404).send(false);
    //   }

    //   const returnValue = await todo.deleteTodo();
    //   return response.send(returnValue);
    // } catch (error) {
    //   return response.status(422).send(false);
    // }

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
