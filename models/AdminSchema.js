import mongoose from "mongoose";

const AdminSchema = mongoose.Schema({
    email: String,
    password: String,
    token: String,
    lastLogin: String
})

let AdminModel = new mongoose.model("admin", AdminSchema)

export default AdminModel