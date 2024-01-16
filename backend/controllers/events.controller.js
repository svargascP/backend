import multer from "multer";
import { pool } from "../db/db.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "eventImage-" + uniqueSuffix + "." + file.originalname.split(".")[1]
    );
  },
});

const upload = multer({ storage: storage });
const uploadMiddleware = upload.single("eventImage");

export const getEvents = async (req, res) => {
  try {
    const userId = req.user.id; // Obtenemos el user_id del usuario autenticado

    const [result] = await pool.query(
      "SELECT * FROM events WHERE user_id = ? ORDER BY date ASC",
      [userId]
    );
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM events WHERE id = ?", [
      req.params.id,
    ]);
    if (result.length === 0)
      return res.status(404).json({ message: "Event not found" });

    res.json(result[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, address, date } = req.body;
    const userId = req.user.id; // Obtenemos el user_id del usuario autenticado

    const [result] = await pool.query(
      "INSERT INTO events(title, description, address, date, user_id) VALUES (?, ?, ?, ?, ?)",
      [title, description, address, date, userId]
    );

    res.json({ id: result.insertId, title, description, address, date });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const result = await pool.query("UPDATE events SET ? WHERE id = ?", [
      req.body,
      req.params.id,
    ]);
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM events WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Event not found" });
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateEventImage = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Verifica si el evento existe
    const [existingEvent] = await pool.query(
      "SELECT * FROM events WHERE id = ?",
      [eventId]
    );

    if (existingEvent.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Manejo de carga de imagen con Multer
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        console.error("Multer Error:", err.message);
        return res
          .status(500)
          .json({ error: "Error uploading image", details: err.message });
      }

      // Verifica si se ha cargado una nueva imagen
      if (req.file) {
        const imageUrl = req.file.path
          .replace("public", "")
          .replace(/\\/g, "/");
        const insertQuery =
          "INSERT INTO event_images (event_id, image_url) VALUES (?, ?)";
        await pool.query(insertQuery, [eventId, imageUrl]);

        return res.status(200).json({ message: "Image updated successfully" });
      } else {
        return res.status(400).json({ message: "No new image uploaded" });
      }
    });
  } catch (error) {
    console.error("Error updating event image:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
