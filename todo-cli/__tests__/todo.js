const todoList = require("../todo");

const { all, markAsComplete, add } = todoList();

// describe("TodoList Test Suite",()=>{
//     test("Should add new Todo",()=>{
//         expect(all.length).toBe(0);
//         add(
//             {
//                 title:"Test todo",
//                 completed:false,
//                 dueDate:new Date().toISOString().split("T")[0]
//             }
//         );
//         expect(all.length).toBe(1);
//     });
//     test("should mark a todo as complete",()=>{
//         expect(all[0].completed).toBe(false);
//         markAsComplete(0);
//         expect(all[0].completed).toBe(true);
//     })
// })
describe("TodoList Test Suite", () => {
  beforeAll(() => {
    add({
      title: "Test todo",
      completed: false,
      dueDate: new Date().toISOString().split("T")[0],
    });
  });
  test("Should add new Todo", () => {
    const todoItemsCount = all.length;
    add({
      title: "Test todo",
      completed: false,
      dueDate: new Date().toISOString().split("T")[0],
    });
    expect(all.length).toBe(todoItemsCount + 1);
  });
  test("should mark a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });
});
