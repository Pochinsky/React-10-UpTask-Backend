import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamController {
  static getTeamMembers = async (req: Request, res: Response) => {
    const project = await Project.findById(req.project.id).populate({
      path: "team",
      select: "id email name",
    });
    res.json(project.team);
  };

  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("id email name");

    // check if user not exists
    if (!user) {
      const error = new Error("Usuario no encontrado");
      res.status(404).json({ error: error.message });
      return;
    }

    res.json(user);
  };

  static addMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;

    const user = await User.findById(id).select("id");

    // check if user not exists
    if (!user) {
      const error = new Error("Usuario no encontrado");
      res.status(404).json({ error: error.message });
      return;
    }

    // check if user is member of team project
    if (
      req.project.team.some(
        (teamMember) => teamMember.toString() === user.id.toString()
      )
    ) {
      const error = new Error("El usuario ya es colaborador del proyecto");
      res.status(409).json({ error: error.message });
      return;
    }

    // update project team
    req.project.team.push(user.id);
    await req.project.save();

    res.send("Colaborador agregado al proyecto");
  };

  static removeMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;

    // check if user is not a member of team project
    if (!req.project.team.some((teamMember) => teamMember.toString() === id)) {
      const error = new Error("El usuario no es colaborador del proyecto");
      res.status(409).json({ error: error.message });
      return;
    }

    // remove member from team and save project
    req.project.team = req.project.team.filter(
      (teamMember) => teamMember.toString() !== id
    );
    await req.project.save();

    res.send("Colaborador eliminado del proyecto");
  };
}
