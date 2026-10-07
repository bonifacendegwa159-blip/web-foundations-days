let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
  return notes.filter(note =>
    note.text.toLowerCase().includes(word.toLowerCase())
  );
}

function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];

  for (let note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }

  return longest;
}

function countByCategory() {
  let counts = {};

  for (let note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }

  return counts;
}

function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const noteWord = total === 1 ? "note" : "notes";

  return `${total} ${noteWord}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0}.`;
}

function isDuplicate(text) {
  return notes.some(note =>
    note.text.trim().toLowerCase() === text.trim().toLowerCase()
  );
}

function addNote(text, category) {
  if (text.trim().length < 1 || text.length > 200) {
    console.log("Note must be between 1 and 200 characters.");
    return false;
  }

  if (isDuplicate(text)) {
    console.log("Note is a duplicate.");
    return false;
  }

  if (!["personal", "work", "study"].includes(category)) {
    console.log("Invalid category.");
    return false;
  }

  const newId = notes.length > 0
    ? Math.max(...notes.map(note => note.id)) + 1
    : 1;

  notes.push({
    id: newId,
    text: text,
    category: category
  });

  return true;
}


// TESTS

console.log(searchNotes("milk"));
// Expected: [{ id: 1, text: "Buy milk and bread", category: "personal" }]

console.log(searchNotes("pizza"));
// Expected: []


console.log(longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }


let savedNotes = notes;
notes = [];

console.log(longestNote());
// Expected: null

notes = savedNotes;


console.log(countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }


savedNotes = notes;
notes = [];

console.log(countByCategory());
// Expected: {}

notes = savedNotes;


console.log(getSummary());
// Expected: "5 notes: 2 personal, 2 work, 1 study."


savedNotes = notes;
notes = [
  { id: 1, text: "Call mum", category: "personal" }
];

console.log(getSummary());
// Expected: "1 note: 1 personal, 0 work, 0 study."

notes = savedNotes;


console.log(isDuplicate("Call mum"));
// Expected: true

console.log(isDuplicate("   CALL MUM   "));
// Expected: true

console.log(isDuplicate("Go to the gym"));
// Expected: false


console.log(addNote("Prepare presentation slides", "work"));
// Expected: true

console.log(addNote("Call mum", "personal"));
// Expected: false, logs "Note is a duplicate."

console.log(addNote("Learn React", "gaming"));
// Expected: false, logs "Invalid category."

console.log(addNote("", "study"));
// Expected: false, logs "Note must be between 1 and 200 characters."