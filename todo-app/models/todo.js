'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static addTodo({title,dueDate}){
      return this.create({title:title,dueDate:dueDate,completed:false})
    }

    //instance method
    markAsCompleted(){
      return this.update({completed:true}) //here this is the Todo instance
    }

   async deleteTodo(id){
    try {
      await this.destroy();
      const todo = await Todo.findByPk(this.id);
      return todo === null;
    } catch (error) {
      // In case of error, return false
      return false;
    }
     
    }

    static  getTodos(){
      return this.findAll();
    }
  }
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};