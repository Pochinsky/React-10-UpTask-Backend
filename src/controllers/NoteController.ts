import type { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
  noteId: Types.ObjectId;
};

export class NoteController {
  static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
    // get note content
    const { content } = req.body;

    // create note
    const note = new Note();
    note.content = content;
    note.createdBy = req.user.id;
    note.task = req.task.id;

    // add note to task
    req.task.notes.push(note.id);

    // save task and note
    try {
      await Promise.allSettled([note.save(), req.task.save()]);
      res.send("La nota ha sido creada");
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static getTaskNotes = async (req: Request, res: Response) => {
    try {
      const notes = await Note.find({ task: req.task.id });
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };

  static deleteNote = async (req: Request<NoteParams>, res: Response) => {
    req.task.notes = req.task.notes.filter(
      (note) => note.toString() !== req.note.id.toString()
    );
    try {
      await Promise.allSettled([req.note.deleteOne(), req.task.save()]);
      res.send("La nota ha sido eliminada");
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error" });
    }
  };
}
