const express = require('express');
const router = express.Router();
const fetchUser = require('../middlewares/fetchUser');
const { check, validationResult } = require('express-validator');
const Note = require('../models/Note');


//ROUTE 1 : Adding Notes using POST to the mdb : /api/notes/addnote
router.post('/addnote', fetchUser, [check('title', 'Title cannot be null').notEmpty()], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 'error': errors });
    }
    try {
        const { title, description, tag } = req.body;
        const note = new Note({
            user: req.user_id,
            title,
            description,
            tag
        });
        note.save().then((note) => {
            console.log(note);
            res.status(200).json(note);

        }).catch(error => res.status(500).json({ "error": "internal server error" }));
    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Internal Server Error" });
    }

});

//ROUTE 2 : Fetching all notes using get : /api/notes/fetchallnotes
router.get('/fetchallnotes', fetchUser, async (req, res) => {

    const id = req.user_id;
    //find method returns array of the matched documents
    const notes = await Note.find({ user: id });


    if (!notes) {
        return res.status(404).json({ "error": "There are no notes available to fetch" });
    }
    res.status(200).json(notes);
});

//ROUTE 3 : Updating note after verifying whether the user has that document or not : /api/notes/updatenote
router.put('/updatenote/:id', fetchUser, [check('title', 'Title cannot be null').notEmpty()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ "error": errors });
    }
    try {
        const note = await Note.findById(req.params.id);
        
        if (note.user.toString() !== req.user_id) {
        return res.status(401).send("Not allowed");
    }
    }catch(error){
        return res.status(404).send("not found")
    }

    //we are going to check whether this note is associated with the same user whose id is present in our authtoken.... when we access the user id from our database we need to convert it to string bcz we have stored that id in that doc thus it prints new Objectid('jssja23j23j3j2) something like this
    
    const { title, description, tag } = req.body;
    const newNote = {};
    try {
        if (title) {
            newNote.title = title;
        };
        if (description) {
            newNote.description = description;
        };
        if (tag) {
            newNote.tag = tag;
        };

    } catch (error) {
        console.log(error);
        return res.status(500).json({ "error": "Internal server error" });
    }

    const noteUpdate = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    res.status(200).json(noteUpdate);
});

//ROUTE 3 : Deleting notes after verifying that whether the note is associated with the same user who is trying to delete it by checking the id from auth token and the user id from the document : /api/notes/deletenote/:id
router.delete('/deletenote/:id',fetchUser,async (req,res)=>{

    try {
        
        const note = await Note.findById(req.params.id);
        if(note.user.toString()!==req.user_id){
            return res.status(401).send("Access Denied");
        }
        const noteDelete = await Note.findByIdAndDelete(req.params.id);
        res.status(200).json(noteDelete);

    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
    


})
module.exports = router;