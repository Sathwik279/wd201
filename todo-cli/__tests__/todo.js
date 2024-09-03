const todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();

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
    const formattedDate = (d) => {
      return d.toISOString().split("T")[0];
    };

    var dateToday = new Date();
    const today = formattedDate(dateToday);
    const yesterday = formattedDate(
      new Date(new Date().setDate(dateToday.getDate() - 1)),
    );
    const tomorrow = formattedDate(
      new Date(new Date().setDate(dateToday.getDate() + 1)),
    );

    add({ title: "Submit assignment", dueDate: yesterday, completed: false });
    add({ title: "Pay rent", dueDate: today, completed: true });
    add({ title: "Service Vehicle", dueDate: today, completed: false });
    add({ title: "File taxes", dueDate: tomorrow, completed: false });
    add({ title: "Pay electric bill", dueDate: tomorrow, completed: false });

    add({
      title: "Test todo4",
      completed: false,
      dueDate: new Date().toISOString().split("T")[0],
    });
  });
  test(" checks creating a new todo", () => {
    const todoItemsCount = all.length;
    add({
      title: "Test todo",
      completed: false,
      dueDate: new Date().toISOString().split("T")[0],
    });
    expect(all.length).toBe(todoItemsCount + 1);
  });
  test("marking a todo as completed", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });
  test("retrieval of overdue items", () => {
    const overdueDate = new Date(overdue()[0].dueDate).getTime();
    const today = new Date().getTime();

    // Check if the overdue date is less than today
    expect(overdueDate).toBeLessThan(today);
  });
  test("retrieval of due today items", () => {
    expect(dueToday()[0].dueDate).toBe(new Date().toISOString().split("T")[0]);
  });
  test("retrieval of due later items", () => {
    const dueLaterDate = new Date(dueLater()[0].dueDate).getTime();
    const today = new Date().getTime();

    // Check if the overdue date is less than today
    expect(dueLaterDate).toBeGreaterThan(today);
  });
});
