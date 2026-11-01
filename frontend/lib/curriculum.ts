// Comprehensive Curriculum Model for SSchat.box
// Supports Tamil Nadu State Board (Samacheer Kalvi), CBSE, NCERT, and Early Childhood Education (LKG–UKG)

export interface CurriculumBoard {
  id: string;
  name: string;
  name_ta: string;
  name_hi: string;
  short_name: string;
  authority: string;
  portal_url: string;
}

export interface CurriculumStream {
  id: string;
  name: string;
  name_ta: string;
  name_hi: string;
  subjects: string[];
}

export interface SubjectOption {
  id: string;
  name: string;
  name_ta: string;
  name_hi: string;
  isVerified: boolean;
}

export const ALL_BOARDS: CurriculumBoard[] = [
  {
    id: "tn_state_board",
    name: "Tamil Nadu State Board (Samacheer Kalvi)",
    name_ta: "தமிழ்நாடு மாநிலப் பாடத்திட்டம் (சமச்சீர் கல்வி)",
    name_hi: "तमिलनाडु स्टेट बोर्ड (समचीर कल्वि)",
    short_name: "TN Samacheer Kalvi",
    authority: "Tamil Nadu Textbook and Educational Services Corporation",
    portal_url: "https://textbookcorp.in/"
  },
  {
    id: "ncert",
    name: "NCERT (National Council of Educational Research and Training)",
    name_ta: "என்.சி.இ.ஆர்.டி (தேசிய கல்வி ஆராய்ச்சி மற்றும் பயிற்சி நிறுவனம்)",
    name_hi: "एनसीईआरटी (राष्ट्रीय शैक्षिक अनुसंधान और प्रशिक्षण परिषद)",
    short_name: "NCERT National",
    authority: "NCERT National Portal",
    portal_url: "https://ncert.nic.in/textbook.php"
  },
  {
    id: "cbse",
    name: "CBSE (Central Board of Secondary Education)",
    name_ta: "மத்திய இடைநிலைக் கல்வி வாரியம் (சி.பி.எஸ்.இ)",
    name_hi: "केंद्रीय माध्यमिक शिक्षा बोर्ड (सीबीएसई)",
    short_name: "CBSE Academic",
    authority: "CBSE Academic Portal",
    portal_url: "https://cbseacademic.nic.in/"
  },
  {
    id: "early_learning",
    name: "Early Childhood Education (LKG & UKG)",
    name_ta: "முன்பருவக் கல்வி (LKG & UKG)",
    name_hi: "प्रारंभिक बाल शिक्षा (LKG और UKG)",
    short_name: "Kindergarten (LKG & UKG)",
    authority: "Foundational Stage Early Childhood Framework",
    portal_url: "https://ncert.nic.in/"
  }
];

export const ALL_CLASSES = [
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12"
];

export const HIGHER_SECONDARY_STREAMS: CurriculumStream[] = [
  {
    id: "science_bio",
    name: "Science (Biology - Maths)",
    name_ta: "அறிவியல் (உயிரியல் - கணிதம்)",
    name_hi: "विज्ञान (जीवविज्ञान - गणित)",
    subjects: ["Physics", "Chemistry", "Biology", "Mathematics", "English", "Tamil"]
  },
  {
    id: "science_cs",
    name: "Science (Computer Science - Maths)",
    name_ta: "அறிவியல் (கணினி அறிவியல் - கணிதம்)",
    name_hi: "विज्ञान (कंप्यूटर विज्ञान - गणित)",
    subjects: ["Physics", "Chemistry", "Computer Science", "Mathematics", "English", "Tamil"]
  },
  {
    id: "commerce",
    name: "Commerce & Accountancy",
    name_ta: "வணிகவியல் மற்றும் கணக்குப்பதிவியல்",
    name_hi: "वाणिज्य और लेखा",
    subjects: ["Accountancy", "Commerce", "Economics", "Business Mathematics", "English"]
  },
  {
    id: "arts",
    name: "Arts & Humanities",
    name_ta: "கலை மற்றும் மனிதவியல்",
    name_hi: "कला और मानविकी",
    subjects: ["History", "Geography", "Political Science", "Economics", "English"]
  }
];

// Multilingual subject dictionaries
const SUBJECT_DICTIONARY: Record<string, { ta: string; hi: string }> = {
  "Science": { ta: "அறிவியல்", hi: "विज्ञान" },
  "Mathematics": { ta: "கணிதம்", hi: "गणित" },
  "Social Science": { ta: "சமூக அறிவியல்", hi: "सामाजिक विज्ञान" },
  "English": { ta: "ஆங்கிலம்", hi: "अंग्रेजी" },
  "Tamil": { ta: "தமிழ்", hi: "तमिल" },
  "Hindi": { ta: "இந்தி", hi: "हिन्दी" },
  "Environmental Studies (EVS)": { ta: "சுற்றுச்சூழல் கல்வி (EVS)", hi: "पर्यावरण अध्ययन (EVS)" },
  "Foundational Literacy & Phonics": { ta: "அடிப்படை எழுத்து & ஒலிப்பயிற்சி", hi: "बुनियादी साक्षरता और ध्वनिविज्ञान" },
  "Early Numbers & Shapes": { ta: "எண்கள் மற்றும் வடிவங்கள்", hi: "प्रारंभिक संख्याएँ और आकृतियाँ" },
  "Environmental Wonder": { ta: "சுற்றுச்சூழல் விழிப்புணர்வு", hi: "पर्यावरण जागरूकता" },
  "Physics": { ta: "இயற்பியல்", hi: "भौतिक विज्ञान" },
  "Chemistry": { ta: "வேதியியல்", hi: "रसायन विज्ञान" },
  "Biology": { ta: "உயிரியல்", hi: "जीव विज्ञान" },
  "Computer Science": { ta: "கணினி அறிவியல்", hi: "कंप्यूटर विज्ञान" },
  "Commerce": { ta: "வணிகவியல்", hi: "वाणिज्य" },
  "Accountancy": { ta: "கணக்குப்பதிவியல்", hi: "लेखाशास्त्र" },
  "Economics": { ta: "பொருளாதாரம்", hi: "अर्थशास्त्र" },
  "Business Mathematics": { ta: "வணிகக் கணிதம்", hi: "व्यावसायिक गणित" },
  "History": { ta: "வரலாறு", hi: "इतिहास" },
  "Geography": { ta: "புவியியல்", hi: "भूगोल" },
  "Political Science": { ta: "அரசியல் அறிவியல்", hi: "राजनीति विज्ञान" }
};

/**
 * Returns the list of applicable classes for a given board.
 */
export function getClassesForBoard(boardId: string): string[] {
  if (boardId === "early_learning") {
    return ["LKG", "UKG"];
  }
  return [
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12"
  ];
}

/**
 * Dynamically resolves subjects based on the stage:
 * - Kindergarten (LKG, UKG)
 * - Primary (Class 1-5)
 * - Middle & Secondary (Class 6-10)
 * - Higher Secondary (Class 11, 12) with Stream
 */
export function getApplicableSubjects(
  boardId: string,
  classGrade: string,
  streamId: string = "science_bio"
): SubjectOption[] {
  let names: string[] = [];

  if (boardId === "early_learning" || classGrade === "LKG" || classGrade === "UKG") {
    names = [
      "Foundational Literacy & Phonics",
      "Early Numbers & Shapes",
      "Environmental Wonder"
    ];
  } else if (["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"].includes(classGrade)) {
    // Primary curriculum
    names = [
      boardId === "tn_state_board" ? "Tamil" : "Hindi",
      "English",
      "Mathematics",
      "Environmental Studies (EVS)"
    ];
  } else if (["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"].includes(classGrade)) {
    // Middle & Secondary curriculum
    names = [
      "Science",
      "Mathematics",
      "Social Science",
      "English",
      boardId === "tn_state_board" ? "Tamil" : "Hindi"
    ];
  } else if (["Class 11", "Class 12"].includes(classGrade)) {
    // Higher Secondary stream-based curriculum
    const stream = HIGHER_SECONDARY_STREAMS.find(s => s.id === streamId) || HIGHER_SECONDARY_STREAMS[0];
    names = stream.subjects;
  } else {
    names = ["Mathematics", "Science", "English"];
  }

  return names.map((name) => {
    const isVerified = isSubjectVerified(boardId, classGrade, name);
    const trans = SUBJECT_DICTIONARY[name] || { ta: name, hi: name };
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      name,
      name_ta: trans.ta,
      name_hi: trans.hi,
      isVerified
    };
  });
}

/**
 * Determines whether indexed, verified textbook passages exist in the database
 * for the selected board, class, and subject.
 */
export function isSubjectVerified(boardId: string, classGrade: string, subject: string): boolean {
  // Verified indexed datasets in SSchat.box:
  // 1. TN State Board Class 10 Science (Laws of Motion, Plant Anatomy)
  // 2. NCERT Class 10 Science (Chemical Reactions, Light)
  // 3. Early Learning LKG/UKG Foundational Literacy & Phonics, Early Numbers
  if (boardId === "tn_state_board" && classGrade === "Class 10" && subject.toLowerCase().includes("science")) {
    return true;
  }
  if (boardId === "ncert" && classGrade === "Class 10" && subject.toLowerCase().includes("science")) {
    return true;
  }
  if (boardId === "early_learning" && ["LKG", "UKG"].includes(classGrade)) {
    return true;
  }
  return false;
}
