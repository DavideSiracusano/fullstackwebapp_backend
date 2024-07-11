const express = require("express");
const connectDB = require("./mongoose");
const cors = require("cors"); //per collegare frontend
const noteController = require("./controllers/notesController");
const userController = require("./controllers/usersController");
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:4200",
  })
);

connectDB();

app.post("/note", noteController.createNote);
app.get("/note", noteController.getNote);
app.get("/notes", noteController.getAllNotes);
app.put("/note/:id", noteController.updateNote);
app.delete("/note/:postId", noteController.deleteNote);
app.post("/note/:postId/comment", noteController.addComment);
app.delete("/note/:postId/comment/:commentId", noteController.deleteComment);
app.post("/like/note/:postId", noteController.addLike);
app.delete("/like/note/:postId", noteController.removeLike);
app.post(
  "/like/note/:postId/comment/:commentId",
  noteController.addCommentLike
);
app.delete(
  "/like/note/:postId/comment/:commentId",
  noteController.removeCommentLike
);

app.post("/register", userController.registerUser);
app.post("/login", userController.loginUser);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
