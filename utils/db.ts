import { JSONFilePreset } from "lowdb/node";
import { Low } from "lowdb";

type NotesDbData = {
  lessons: { term: number; class: number; notes: string[] }[];
  miscNotes: string[];
};

const defaultData: NotesDbData = {
  lessons: [],
  miscNotes: [],
};

let db: Low<NotesDbData>;

export async function initDb() {
  if (!process.env.APP_DATA_LOCATION) {
    throw new Error("APP_DATA_LOCATION environment variable is not set.");
  }
  db = await JSONFilePreset(process.env.APP_DATA_LOCATION, defaultData);

  return db;
}

export async function addNotesToLesson(
  term: number,
  classNumber: number,
  notes: string[]
) {
  await db.update(({ lessons }) => {
    let lesson = lessons.find(
      (l) => l.term === term && l.class === classNumber
    );

    if (!lesson) {
      // no such lesson yet → create it
      lesson = { term, class: classNumber, notes };
      console.log("Creating new lesson:", lesson);
      lessons.push(lesson);
      return;
    }

    for (const note of new Set(notes)) {
      if (!lesson.notes.includes(note)) {
        console.log("Adding note to existing lesson:", note);
        lesson.notes.push(note);
      }
    }
  });
}

export async function addMiscNotes(notes: string[]) {
  await db.update(({ miscNotes }) => {
    for (const note of new Set(notes)) {
      if (!miscNotes.includes(note)) {
        miscNotes.push(note);
      }
    }
  });
}

export async function getAllNotes() {
  await db.read();

  return db.data;
}
