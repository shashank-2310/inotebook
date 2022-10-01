const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchUser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');


//ROUTE 1 : Create a user using: POST "/api/notes/fetchallnotes" -- No login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {

        const notes = await Note.find({ user: req.user.id })
        res.json(notes)

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
})


//ROUTE 2 : Add a new Note using: POST "/api/notes/addnote" -- login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 character').isLength({ min: 5 })
], async (req, res) => {

    //If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    //De-structuring
    const { title, description, tag } = req.body;

    try {
        //Create a new note
        const note = new Note({
            title, description, tag, user: req.user.id
        });
        const savedNote = await note.save();
        res.json(savedNote)

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
})


//ROUTE 3 : Update an existing Note using: PUT "/api/notes/updatenote/:id" -- login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {

    //De-structuring
    const { title, description, tag } = req.body;

    try {
        //Create a new note object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //Finding the note to be updated
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found"); }

        //Allow updation only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        //Updating the note, if it belongs to the rightful user
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
})


//ROUTE 4 : Delete an existing Note using: DELETE "/api/notes/deletenote/:id" -- login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        //Finding the note to be deleted
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found"); }

        //Allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        //Deleting the note, if it belongs to the rightful user
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
})


module.exports = router