// models/todo.js
'use strict';
const { Model,Op } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    displayableString() {
      let today = new Date();
      let checkbox = this.completed ? '[x]' : '[ ]';
      return `${this.id}. ${checkbox} ${this.title} ${(this.dueDate===today.toISOString().split("T")[0])?'': this.dueDate}`.trim();
    }

    static async addTask(params) {
      return await Todo.create(params);//creates the rows in the table
    }

    static async overdue() {
      let today = new Date();
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      let  all = await Todo.findAll({
          where:{
            dueDate:{
              [Op.lt]: today.toISOString().split("T")[0]
            }
          }
        })
        return all;
    }

    static async dueToday() {
      let today = new Date();
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      let  all = await Todo.findAll({
          where:{
            dueDate:{
              [Op.eq]: today.toISOString().split("T")[0]
            }
          }
        })
        return all
    }

    static async dueLater() {
      let today = new Date();
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      let  all = await Todo.findAll({
          where:{
            dueDate:{
              [Op.gt]: today.toISOString().split("T")[0]
            }
          }
        })
        return all
    }

    static async showList() {
      console.log('My Todo list \n');

      console.log('Overdue');
      // FILL IN HERE
    //  const overdue = await Todo.findAll({
    //     where:{
    //       dueDate:{
    //         [Op.lt]: today.toISOString().split("T")[0]
    //       }
    //     }
    //   })
    //  //overdue is a list of todo objects
    //  const  overdueList = overdue.map((item)=>item.displayableString()).join("\n");
      const overdue = await Todo.overdue();
      const overdueList = overdue.map((item)=>item.displayableString()).join("\n");
      console.log(overdueList);

      console.log('\n');

      console.log('Due Today');
      // FILL IN HERE
    //  const  duetoday = await Todo.findAll({
    //     where:{
    //       dueDate:{
    //         [Op.eq]: today.toISOString().split("T")[0]
    //       }
    //     }
    //   })
      
      const dueToday = await Todo.dueToday();
      const dueTodayList = dueToday.map((item)=>item.displayableString()).join("\n");
      console.log(dueTodayList);

      console.log('Due Later');
      // FILL IN HERE
    //  const  duelater = await Todo.findAll({
    //     where:{
    //       dueDate:{
    //         [Op.gt]: today.toISOString().split("T")[0]
    //       }
    //     }
    //   })
    const dueLater = await Todo.dueLater();
    const dueLaterList = dueLater.map((item)=>item.displayableString()).join("\n");
    console.log(dueLaterList);
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      const todo = await Todo.findOne(
        {
          where:{
            id:id
          }
        }
      )
      if(todo){
        todo.completed = true;
        await todo.save(); //persist changes to the database.... 

      }
    }

    
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Todo',
    },
  );
  // Todo.sync({ force: false }) // force: false will not drop the table, it will only create it if it doesn't exist
 

  return Todo;
};

