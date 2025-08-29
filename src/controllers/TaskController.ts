import type { Request, Response } from "express";
import Task from "../models/Task";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      task.project = req.project.id;
      req.project.tasks.push(task.id);
      await Promise.allSettled([task.save(), req.project.save()]);
      res.send("La tarea ha sido creada");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate(
        "project"
      );
      res.json(tasks);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id).populate({
        path: "completedBy",
        select: "id name email",
      });
      res.json(task);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      req.task.name = req.body.name;
      req.task.description = req.body.description;
      await req.task.save();
      res.send("La tarea se ha actualizado");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      req.project.tasks = req.project.tasks.filter(
        (task) => task._id.toString() !== req.params.taskId
      );
      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
      res.send("La tarea se ha eliminado");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      req.task.status = status;
      if (status === "pending") req.task.completedBy = null;
      else req.task.completedBy = req.user.id;
      await req.task.save();
      res.send("El estado de la tarea se ha actualizado");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };
}
