import app from "./app"
import { connectDB } from "./config"

const startServer = async () => {   
    try {
        await connectDB();

        await app.listen({port: 3000, host: "0.0.0.0"}).then(() => {
            console.log("✅ Server running on port 3000")
        })
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

startServer()