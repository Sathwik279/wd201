const { request, response } = require("express");
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}))

//app.METHOD(PATH,HANDLER)
//or
//app.METHOD(path,callback[,callback...])

app.set("view engine", "ejs"); //we are not using plain html

app.use(express.static(path.join(__dirname, "public")));

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
  try {
   
    // const allTodos = await Todo.getTodos();
    const overdue = await Todo.overdue();
    const dueToday = await Todo.dueToday();
    const dueLater = await Todo.dueLater();

    if (request.accepts("html")) {
      response.render("index", {
        overdue,
        dueToday,
        dueLater
      });
    } else {
      response.json({
        overdue,
        dueToday,
        dueLater
      });
    }
  } catch (error) {
    console.log(error);
    response.status(500).send("Internal Server Error");
  }
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);
  // Todo
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate
    });

    // return response.json(todo); //initially
    return response.redirect("/"); //now this is done using the form in the / endpoint
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("we have to update a todo with ID:", request.params.id); //
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async (request, response) => {
  console.log("Delete a todo by ID:", request.params.id);

  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).send(false);
    }

    const returnValue = await todo.deleteTodo();
    return response.send(returnValue);
  } catch (error) {
    return response.status(422).send(false);
  }
});

module.exports = app;
