// Imports: Packages
import { Router } from "express";
import { body, param } from "express-validator";

// Imports: Middlewares
import { handleInputErrors } from "../middlewares/validation";
import { projectExists } from "../middlewares/project";
import {
  hasAuthorization,
  taskBelongsToProject,
  taskExists,
} from "../middlewares/task";
import { authenticate } from "../middlewares/auth";

// Import: Controllers
import { ProjectController } from "../controllers/ProjectController";
import { TaskController } from "../controllers/TaskController";
import { TeamController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";
import { noteExists, noteWasCreatedByUser } from "../middlewares/note";

const router = Router();

// Authenticate user by JWT
router.use(authenticate);

// Projects: Create project
router.post(
  "/",
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del clienbte es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatoria"),
  handleInputErrors,
  ProjectController.createProject
);

// Projects: Get all projects
router.get("/", ProjectController.getAllProjects);

// Projects: Get project by ID
router.get(
  "/:id",
  param("id").isMongoId().withMessage("El ID no es válido"),
  handleInputErrors,
  ProjectController.getProjectById
);

// Projects: Update project
router.put(
  "/:id",
  param("id").isMongoId().withMessage("El ID no es válido"),
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del clienbte es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatoria"),
  handleInputErrors,
  ProjectController.updateProject
);

// Projects: Delete Project
router.delete(
  "/:id",
  param("id").isMongoId().withMessage("El ID no es válido"),
  handleInputErrors,
  ProjectController.deleteProject
);

// Check if there is a project with ID equals to projectId request parameter
router.param("projectId", projectExists);

// Tasks: Create task
router.post(
  "/:projectId/tasks",
  hasAuthorization,
  body("name").notEmpty().withMessage("El nombre de la tarea es obligatoria"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
  handleInputErrors,
  TaskController.createTask
);

// Tasks: Get tasks of a project
router.get("/:projectId/tasks", TaskController.getProjectTasks);

// Check if there is a task with ID equals to taskId request parametr
router.param("taskId", taskExists);

// Check if the task with ID equals to taskId request parameter belongs to project
router.param("taskId", taskBelongsToProject);

// Tasks: Get task of a project by ID
router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("El ID no es válido"),
  handleInputErrors,
  TaskController.getTaskById
);

// Tasks: Update taskk of a project
router.put(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("El ID no es válido"),
  body("name").notEmpty().withMessage("El nombre de la tarea es obligatoria"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
  handleInputErrors,
  TaskController.updateTask
);

// Tasks: Delete taskk of a project
router.delete(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("El ID no es válido"),
  handleInputErrors,
  TaskController.deleteTask
);

// Tasks: Update status of a task
router.post(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("El ID no es válido"),
  body("status").notEmpty().withMessage("El estado de tarea es obligatorio"),
  handleInputErrors,
  TaskController.updateStatus
);

// Teams: Get team members of a project
router.get("/:projectId/team", TeamController.getTeamMembers);

// Teams: Find member by email
router.post(
  "/:projectId/team/find",
  body("email").isEmail().toLowerCase().withMessage("Email no válido"),
  handleInputErrors,
  TeamController.findMemberByEmail
);

// Teams: Add member to Team by ID
router.post(
  "/:projectId/team",
  body("id").isMongoId().withMessage("ID de usuario no válido"),
  handleInputErrors,
  TeamController.addMemberById
);

// Teams: Remove member of a project by ID
router.delete(
  "/:projectId/team/:userId",
  param("userId").isMongoId().withMessage("ID de usuario no válido"),
  handleInputErrors,
  TeamController.removeMemberById
);

// Notes: Create note of a task
router.post(
  "/:projectId/tasks/:taskId/notes",
  body("content")
    .notEmpty()
    .withMessage("El contenido de la nota es obligatorio"),
  handleInputErrors,
  NoteController.createNote
);

// Notes: Get notes of a task
router.get("/:projectId/tasks/:taskId/notes", NoteController.getTaskNotes);

// Notes: delete not of a task
router.delete(
  "/:projectId/tasks/:taskId/notes/:noteId",
  param("noteId").isMongoId().withMessage("ID de nota no válido"),
  noteExists,
  noteWasCreatedByUser,
  handleInputErrors,
  NoteController.deleteNote
);

export default router;
