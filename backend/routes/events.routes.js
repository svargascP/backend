// events.routes.js

import { Router } from "express";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from "../controllers/events.controller.js";
import { auth } from "../jwt/auth.js";
import { updateEventImage } from "../controllers/events.controller.js";

const router = Router();

router.get("/events", auth, getEvents);
router.get("/events/:id", auth, getEvent);
router.post("/events", auth, createEvent);
router.put("/events/:id", auth, updateEvent);
router.put("/events/:id/image", auth, updateEventImage);  // Ruta para actualizar la imagen
router.delete("/events/:id", auth, deleteEvent);

export default router;
