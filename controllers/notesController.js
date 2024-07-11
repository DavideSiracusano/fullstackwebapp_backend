const Note = require("../models/note");

const createNote = async (req, res) => {
  try {
    const newNote = new Note(req.body);
    const savedNote = await newNote.save();
    res.status(201).send(savedNote);
  } catch (err) {
    res.status(400).send(err);
  }
};

const getNote = async (req, res) => {
  try {
    const notes = await Note.find({ userID: req.user.userID });
    res.status(200).send(notes);
  } catch {
    res.status(400).send(err);
  }
};

const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().populate("userID", "username");
    res.status(200).send(notes);
  } catch (err) {
    res
      .status(400)
      .send({ error: "Error fetching posts", details: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const noteID = req.params.id;
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteID },
      {
        title: req.body.title,
        content: req.body.content,
      },
      {
        new: true,
      }
    );
    res.status(200).send(updatedNote);
  } catch (err) {
    res.status(400).send(err);
  }
};

const deleteNote = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.headers.userid; // Supponiamo che l'ID dell'utente venga passato come header

    const note = await Note.findById(postId);
    if (!note) {
      return res.status(404).send({ message: "Note not found!" });
    }

    if (note.userID.toString() !== userId) {
      return res
        .status(403)
        .send({ message: "You are not authorized to delete this note!" });
    }

    await Note.findByIdAndDelete(postId);
    res.status(200).send({ message: "Deleted Note!", deletedNote: note });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error deleting note", error: err.message });
  }
};

const addComment = async (req, res) => {
  const { postId } = req.params;

  const { username, content } = req.body;

  try {
    const post = await Note.findById(postId);

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    const newComment = {
      username: username,
      content: content,
      date: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).send(post);
  } catch (err) {
    res.status(400).send(err);
  }
};

const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;

  if (!commentId) {
    return res.status(400).send({ message: "CommentId missing or invalid" });
  }

  try {
    const post = await Note.findById(postId);

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    // Trova il commento all'interno dell'array dei commenti
    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId
    );

    if (!comment) {
      return res.status(404).send({ message: "Comment not found" });
    }

    // Rimuove il commento dall'array
    post.comments.remove(comment);
    await post.save();

    res.status(200).send({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).send({ message: "Internal server error" });
  }
};

const addLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.headers.userid; // Supponiamo che l'ID dell'utente venga passato come header

    const note = await Note.findById(postId);

    if (!note) {
      return res.status(404).json({ error: "Nota non trovata" });
    }

    if (note.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ error: "Hai già messo like a questa nota" });
    }

    note.likes += 1;
    note.likedBy.push(userId);

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    console.error("Errore durante l'aggiunta del like:", error.message);
    res.status(500).json({ error: "Errore del server" });
  }
};

const removeLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.headers.userid;

    const note = await Note.findById(postId);

    if (!note) {
      return res.status(404).json({ error: "Nota non trovata" });
    }

    if (note.likedBy.includes(userId)) {
      note.likes -= 1;
      note.likedBy.remove(userId);
    }

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    console.error("Errore durante l'aggiunta del like:", error.message);
    res.status(500).json({ error: "Errore del server" });
  }
};
const addCommentLike = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.headers.userid;

    const note = await Note.findById(postId);

    if (!note) {
      return res.status(404).json({ error: "Nota non trovata" });
    }

    const comment = note.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Commento non trovato" });
    }

    if (comment.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ error: "Hai già messo like a questo commento" });
    }

    comment.likes += 1;
    comment.likedBy.push(userId);

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    console.error(
      "Errore durante l'aggiunta del like al commento:",
      error.message
    );
    res.status(500).json({ error: "Errore del server" });
  }
};

const removeCommentLike = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.headers.userid;

    const note = await Note.findById(postId);

    if (!note) {
      return res.status(404).json({ error: "Nota non trovata" });
    }

    const comment = note.comments.find((comment) => comment._id == commentId);

    if (!comment) {
      return res.status(404).json({ error: "Commento non trovato" });
    }

    if (comment.likedBy.includes(userId)) {
      comment.likes -= 1;
      comment.likedBy.remove(userId);
    }

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    console.error(
      "Errore durante la rimozione del like al commento:",
      error.message
    );
    res.status(500).json({ error: "Errore del server" });
  }
};

module.exports = {
  createNote,
  getNote,
  getAllNotes,
  updateNote,
  deleteNote,
  addLike,
  addComment,
  deleteComment,
  removeLike,
  addCommentLike,
  removeCommentLike,
};
