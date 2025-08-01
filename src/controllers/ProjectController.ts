import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);
    try {
      await project.save();
      res.send("El proyecto ha sido creado");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({});
      res.json(projects);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id).populate("tasks");
      if (!project) {
        const error = new Error("El proyecto no ha sido encontrado");
        res.status(404).json({ error: error.message });
        return;
      }
      res.json(project);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id);
      if (!project) {
        const error = new Error("El proyecto no ha sido encontrado");
        res.status(404).json({ error: error.message });
        return;
      }
      project.clientName = req.body.clientName;
      project.projectName = req.body.projectName;
      project.description = req.body.description;
      await project.save();
      res.send("El proyecto ha sido actualizado");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id);
      if (!project) {
        const error = new Error("El proyecto no ha sido encontrado");
        res.status(404).json({ error: error.message });
        return;
      }
      await project.deleteOne();
      res.send("El proyecto ha sido eliminado");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };
}
