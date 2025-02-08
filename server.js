import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { AdminRouter } from "./routers/admin.router.js"
import { GenralRouter } from "./routers/genral.router.js"
import "./database/conn.js"

dotenv.config({ path: "./config.env" })

let port = process.env.PORT || 3006

const app = express()

app.use(express.static("public"))

let corsOption = {
    origin: "*",
    method: "*"
}

app.use(express.urlencoded({ extended: false }));

app.use(express.json())

app.use(cors(corsOption))

app.use(AdminRouter)

app.use(GenralRouter)

app.listen(port, () => {
    console.log(`Server is running on port ${port} !`)
})