const { request, response } = require("express");
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

//app.METHOD(PATH,HANDLER)
//or
//app.METHOD(path,callback[,callback...])

app.get("/todos", async (request, response) => {
  console.log("Fetching the Todo list");
  try {
    const todoList = await Todo.findAll();
    return response.json(todoList);
  } catch (error) {
    cconsole.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);
  // Todo
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request,
    });
    //the importance of refactoring the Todo.create with Todo.addTodo is that if i want to change any business logic further i will change only in one place and it will reflect in all the other places
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

//to update a todo we use this
app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("we have to update a todo with ID:", request.params.id); //
  const todo = await Todo.findByPk(request.params.id); //this method is also asynchronous
  try {
    const updatedTodo = await todo.markAsCompleted(); //as the inside update method of sequelize is asynchronous so we have to use await
    return response.json(updatedTodo);
  } catch (error) {
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async (request, response) => {
  console.log("Delete a todo by ID:", request.params.id);
  //find the todo by id
  try {
    const todo = await Todo.findByPk(request.params.id); //this method is also asynchronous
    if (!todo) {
      return response.status(404).send(false);;
    }

    const returnValue = await todo.deleteTodo(); //as the inside update method of sequelize is asynchronous so we have to use await
    return response.send(returnValue);
  } catch (error) {
    return response.status(422).send(false);
  }
});

module.exports = app;
