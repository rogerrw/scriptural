import { NextResponse } from "next/server";
import { listFiles } from "./seed_script";
const os = require('os');
const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/" // default uri for local instance

const client = new MongoClient(uri);

type DatabaseObject = {
    name: string;
    sizeOnDisk: number;
    empty: boolean;
}

const DB = "bible";
const holybooksDir = [
    os.homedir() + "/holybooks/EN/OT",
    os.homedir() + "/holybooks/EN/NT"
]

export async function handler() {
    try {
        // Connect to database
        await client.connect();
        const databases = await client.db().admin().listDatabases();
        const dbExist = databases.databases.some((db: DatabaseObject) => db.name === "bible")

        if (!dbExist) {
            console.log("Database does not exist. Creating database...");
            const database = client.db(DB);
            database.createCollection("bible"); // delete after rerunning
            return NextResponse.json({message: "Sucessfully created Database! Rerun script to populate collection."})
        }
        const holybooksData = listFiles(holybooksDir)
        for (let [bookName, bookData] of Object.entries(holybooksData)) {
            const database = client.db(DB);
            // check if collection does not exist
            const findCollection = await database.listCollections({name: bookName}).toArray();
            if (findCollection.length === 0) {
                database.createCollection(bookName);
            }
            await database.collection(bookName).insertMany(bookData.chapters);
            await database.collection("bible").drop();
        }
        return NextResponse.json({message: "Populated..."})

    } catch (error) {
        return NextResponse.json({message: "failed", error: `${error}`})

    } finally {
        await client.close();
    }
}
export {handler as GET, handler as POST}
