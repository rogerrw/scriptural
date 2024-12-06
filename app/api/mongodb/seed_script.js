import fs from "fs";
import path from "path";
import os from "os";

const holybooksDir = [
    os.homedir() + "/holybooks/EN/OT",
    os.homedir() + "/holybooks/EN/NT"
]

const booksMapping = {
    '1CH': '1 Chronicles',
    '1CO': '1 Corinthians',
    '1JN': '1 John',
    '1KI': '1 Kings',
    '1PE': '1 Peter',
    '1SA': '1 Samuel',
    '1TH': '1 Thessalonians',
    '1TI': '1 Timothy',
    '2CH': '2 Chronicles',
    '2CO': '2 Corinthians',
    '2JN': '2 John',
    '2KI': '2 Kings',
    '2PE': '2 Peter',
    '2SA': '2 Samuel',
    '2TH': '2 Thessalonians',
    '2TI': '2 Timothy',
    '3JN': '3 John',
    'ACT': 'Acts',
    'AMO': 'Amos',
    'COL': 'Colossians',
    'DAN': 'Daniel',
    'DEU': 'Deuteronomy',
    'ECC': 'Ecclesiastes',
    'EPH': 'Ephesians',
    'EST': 'Esther',
    'EXO': 'Exodus',
    'EZK': 'Ezekiel',
    'EZR': 'Ezra',
    'GAL': 'Galatians',
    'GEN': 'Genesis',
    'HAB': 'Habakkuk',
    'HAG': 'Haggai',
    'HEB': 'Hebrews',
    'HOS': 'Hosea',
    'ISA': 'Isaiah',
    'JAS': 'James',
    'JDG': 'Judges',
    'JER': 'Jeremiah',
    'JHN': 'John',
    'JOB': 'Job',
    'JOL': 'Joel',
    'JON': 'Jonah',
    'JOS': 'Joshua',
    'JUD': 'Jude',
    'LAM': 'Lamentations',
    'LEV': 'Leviticus',
    'LUK': 'Luke',
    'MAL': 'Malachi',
    'MAT': 'Matthew',
    'MIC': 'Micah',
    'MRK': 'Mark',
    'NAM': 'Nahum',
    'NEH': 'Nehemiah',
    'NUM': 'Numbers',
    'OBA': 'Obadiah',
    'PHM': 'Philemon',
    'PHP': 'Philippians',
    'PRO': 'Proverbs',
    'PSA': 'Psalms',
    'REV': 'Revelation',
    'ROM': 'Romans',
    'RUT': 'Ruth',
    'SNG': 'Song of Solomon',
    'TIT': 'Titus',
    'ZEC': 'Zechariah',
    'ZEP': 'Zephaniah',
}

export function listFiles(dirPaths) {
    const objs = {}
    function readDirSync(currPath) {
        const entries = fs.readdirSync(currPath, {withFileTypes: true})
        entries.forEach((entry) => {
            const fullPath = path.join(currPath, entry.name)
            if (entry.isDirectory()) {
                readDirSync(fullPath);
            } else if (entry.isFile()) {
                const fileData = JSON.parse(fs.readFileSync(fullPath, "utf8"));
                let parseParentPath = entry.parentPath.split("/");
                let book = parseParentPath.pop();
                book = booksMapping[book];
                let chapters = fileData.text;
                let translation = fileData.version; // ONLY DO ESV, NASB, and KJV
                if (translation === "ESV" || translation === "NASB" || translation === "KJV") {
                    if (!objs[book]) objs[book] = {
                        chapters: Array(chapters.length)
                    }
                    for (let i = 0; i < chapters.length; i++) {
                        let chapter = chapters[i];
                        let verses = chapter.text;
                        let numVerses = Number(verses[verses.length - 1]["ID"])
                        if (!objs[book].chapters[i]) {
                            let chObjs = {
                                id: book + "_" + String(i+1),
                                verses: Array(numVerses)
                            }
                            objs[book].chapters[i] = chObjs
                        }
                        for (let j = 0; j < verses.length; j++) {
                            let verse = verses[j];
                            let verseId = Number(verse["ID"]) - 1 // turn ID to number for index
                            let verseText = verse["text"]
                            if (!objs[book].chapters[i].verses[verseId]) {
                                objs[book].chapters[i].verses[verseId] = {
                                    id: book + "_" + String(i+1) + "_" + verse["ID"]
                                }
                            }
                            if (!(objs[book].chapters[i].verses[verseId][translation])) {
                                objs[book].chapters[i].verses[verseId] = {
                                    ...objs[book].chapters[i].verses[verseId],
                                    [translation]: verseText
                                }
                            } else {
                                objs[book].chapters[i].verses[verseId][translation] += verseText ? " " + verseText : ""
                            }
                        }
                    }
                }
            }
        })

    }
    dirPaths.forEach((path) => {
        readDirSync(path)

    })
    fs.writeFileSync("data.json", JSON.stringify(objs, null, 4), "utf8");
    return objs
}

listFiles(holybooksDir);

