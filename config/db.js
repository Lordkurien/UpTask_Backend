import mongoose from "mongoose";

const conectarDB = async () => {
    try {
        const connetion = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const url = `${connetion.connection.host}:${connetion.connection.port}`;
        console.log(`Mongo DB conectado en: ${url}`);

    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
} 

export default conectarDB;

