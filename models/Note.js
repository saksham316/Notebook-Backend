const mongoose = require('mongoose');
const {Schema } = mongoose;

const NotesSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    title:{
        type:String,
        required:true
    },

    description:{
        type:String,
        default:"description not defined"
    },
    
    tag:{
        type:String,
        default:"Tag not Defined"
    }
});
module.exports = mongoose.model('Notes',NotesSchema);