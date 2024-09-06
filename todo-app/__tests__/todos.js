const request = require("supertest");
const db = require("../models/index");
const app = require("../app");
var cheerio = require('cheerio')

let server, agent;
//the server will be our express js application
//the agent wiil be used to send the http request
function extractCsrfToken(res){
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("create a new todo", async () => {
    const res = await agent.get("/");//step1
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed:false,
      "_csrf":csrfToken
    });
    expect(response.statusCode).toBe(302);
    
  });

  test("Mark a todo as complete", async () => {
    let res = await agent.get("/");//step1
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf":csrfToken
    });
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept","application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount-1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf:csrfToken,
        completed:"updateCompleted"

      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
    });

  test("Mark a todo as incomplete", async () => {
    let res = await agent.get("/");//step1
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf":csrfToken
    });
    let groupedTodosResponse = await agent
      .get("/")
      .set("Accept","application/json");
    let parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    let dueTodayCount = parsedGroupedResponse.dueToday.length;
    let latestTodo = parsedGroupedResponse.dueToday[dueTodayCount-1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    let markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf:csrfToken,
         completed:"updateCompleted"
      });
    let parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);

     groupedTodosResponse = await agent
      .get("/")
      .set("Accept","application/json");
      parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
      let completedCount = parsedGroupedResponse.completed.length;
      latestTodo = parsedGroupedResponse.completed[completedCount-1];

      res = await agent.get("/");
      csrfToken = extractCsrfToken(res);

      markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf:csrfToken,
         completed:"updateCompleted"
      });
     parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(false);
      
    });

    test("delete a todo", async () => {
      let res = await agent.get("/");//step1
      let csrfToken = extractCsrfToken(res);
      const response = await agent.post("/todos").send({
        title: "buy milk",
        dueDate: new Date().toISOString(),
        completed: false,
        "_csrf":csrfToken
      });
      expect(response.statusCode).toBe(302);
      // const parsedResponse = JSON.parse(response.text);
      // const todoID = parsedResponse.id;

      // const deleteResponse = await agent.delete(`/todos/${todoID}`);
      // expect(deleteResponse.success).toBe("true");

          

    });
});
