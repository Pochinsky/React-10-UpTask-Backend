import type { Request, Response, NextFunction } from "express";
import Note, { INote } from "../models/Note";

declare global {
  namespace Express {
    interface Request {
      note: INote;
    }
  }
}

export async function noteExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note) {
      const error = new Error("La nota no ha sido encontrada");
      res.status(404).json({ error: error.message });
      return;
    }
    req.note = note;
    next();
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error" });
  }
}

export async function noteWasCreatedByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.note.createdBy.toString() !== req.user.id.toString()) {
      const error = new Error("Acción no válida");
      res.status(401).json({ error: error.message });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error" });
  }

  next();
}
