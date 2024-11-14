import { NextResponse } from "next/server";

const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/" // default uri for local instance

const client = new MongoClient(uri);

type DatabaseObject = {
    name: string;
    sizeOnDisk: number;
    empty: boolean;
}

const DB = "holybook";
const COLLECTION = "bible";

export async function handler() {
    try {
        // Connect to database
        await client.connect();
        const databases = await client.db().admin().listDatabases();
        const dbExist = databases.databases.some((db: DatabaseObject) => db.name === "holybook")

        if (!dbExist) {
            console.log("Database does not exist. Creating database...");
            const database = client.db(DB);
            database.createCollection(COLLECTION);
            return NextResponse.json({message: "Sucessfully created Database! Rerun script to populate collection."})
        }
        //TODO - SEEDER SCRIPT
        return NextResponse.json({message: "Populated..."})

    } catch (error) {
        return NextResponse.json({message: "failed", error: `${error}`})

    } finally {
        await client.close();
    }
}
export {handler as GET, handler as POST}
