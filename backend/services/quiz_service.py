from typing import List, Dict, Any
from services.rag_service import rag_service

class QuizService:
    def __init__(self):
        # Curated textbook-grounded quiz bank directly linked to verified chapters and pages
        self.quiz_bank = [
            {
                "id": "quiz_tn_c10_newton1",
                "board": "tn_state_board",
                "class_grade": "Class 10",
                "subject": "Science",
                "chapter_name": "Laws of Motion",
                "page_reference": "Page 2-3",
                "question": "What is the inherent property of a body to resist any change in its state of rest or uniform motion?",
                "question_ta": "ஒரு பொருள் தனது ஓய்வு நிலையையோ அல்லது சீரான இயக்க நிலையையோ மாற்றுவதை எதிர்க்கும் உள்ளார்ந்த பண்பு எது?",
                "question_hi": "किसी वस्तु का वह अंतर्निहित गुण क्या कहलाता है जो उसकी विराम अथवा एकसमान गति की अवस्था में परिवर्तन का विरोध करता है?",
                "options": ["Momentum", "Inertia", "Impulse", "Acceleration"],
                "options_ta": ["உந்தம்", "நிலைமம்", "கணத்தாக்கு", "முடுக்கம்"],
                "options_hi": ["संवेग", "जड़त्व", "आवेग", "त्वरण"],
                "correct_index": 1,
                "explanation": "Inertia is the inherent property of a body to resist changes in its state, as defined in Newton's First Law (TN Samacheer Kalvi Science Ch. 1, p. 2).",
                "explanation_ta": "நிலைமம் (Inertia) என்பது ஒரு பொருளின் நிலை மாற்றத்தை எதிர்க்கும் பண்பாகும். இது நியூட்டனின் முதல் விதியில் வரையறுக்கப்பட்டுள்ளது (பக்கம் 2).",
                "explanation_hi": "जड़त्व वस्तु का वह गुण है जो उसकी गति अथवा विराम की अवस्था में परिवर्तन का विरोध करता है।"
            },
            {
                "id": "quiz_tn_c10_force_unit",
                "board": "tn_state_board",
                "class_grade": "Class 10",
                "subject": "Science",
                "chapter_name": "Laws of Motion",
                "page_reference": "Page 4",
                "question": "What is the SI unit of force derived from Newton's Second Law F = ma?",
                "question_ta": "F = ma சமன்பாட்டிலிருந்து பெறப்படும் விசையின் SI அலகு யாது?",
                "question_hi": "न्यूटन के द्वितीय नियम F = ma के अनुसार बल का SI मात्रक क्या है?",
                "options": ["Joule", "Newton (N)", "Pascal", "Watt"],
                "options_ta": ["ஜூல்", "நியூட்டன் (N)", "பாஸ்கல்", "வாட்"],
                "options_hi": ["जूल", "न्यूटन (N)", "पास्कल", "वाट"],
                "correct_index": 1,
                "explanation": "The SI unit of force is Newton (N), equivalent to kg·m/s² (TN Samacheer Kalvi Science Ch. 1, p. 4).",
                "explanation_ta": "விசையின் SI அலகு நியூட்டன் (N) ஆகும் (சமச்சீர் கல்வி அறிவியல் பாடம் 1, பக்கம் 4).",
                "explanation_hi": "बल का SI मात्रक न्यूटन (N) है।"
            },
            {
                "id": "quiz_tn_c10_xylem",
                "board": "tn_state_board",
                "class_grade": "Class 10",
                "subject": "Science",
                "chapter_name": "Plant Anatomy and Plant Physiology",
                "page_reference": "Page 176",
                "question": "Which plant tissue conducts water and dissolved mineral salts upward from roots to leaves?",
                "question_ta": "வேரிலிருந்து நீர் மற்றும் கனிம உப்புக்களை இலைகளுக்கு மேல்நோக்கிக் கடத்தும் தாவரத் திசு எது?",
                "question_hi": "पौधों में जड़ों से पत्तियों तक जल और खनिजों का परिवहन कौन सा ऊतक करता है?",
                "options": ["Phloem", "Xylem", "Collenchyma", "Sclerenchyma"],
                "options_ta": ["புளோயம்", "சைலம்", "கோலன்கைமா", "ஸ்கிளீரன்கைமா"],
                "options_hi": ["फ्लोएम", "जाइलम", "कॉलेनकाइमा", "स्क्लेरेनकाइमा"],
                "correct_index": 1,
                "explanation": "Xylem is responsible for upward unidirectional conduction of water and minerals (TN Samacheer Kalvi Science Ch. 12, p. 176).",
                "explanation_ta": "சைலம் நீர் மற்றும் கனிமக் கரைசலை மேல்நோக்கிக் கடத்தும் பணியைச் செய்கிறது (பக்கம் 176).",
                "explanation_hi": "जाइलम ऊतक जड़ों से जल का संवहन करता है।"
            },
            {
                "id": "quiz_ncert_c10_conservation",
                "board": "ncert",
                "class_grade": "Class 10",
                "subject": "Science",
                "chapter_name": "Chemical Reactions and Equations",
                "page_reference": "Page 3-4",
                "question": "Why must a skeletal chemical equation be balanced?",
                "question_ta": "ஒரு வேதிச் சமன்பாடு ஏன் சமன்படுத்தப்பட வேண்டும்?",
                "question_hi": "किसी कंकाली रासायनिक समीकरण को संतुलित करना क्यों आवश्यक है?",
                "options": [
                    "To satisfy the Law of Conservation of Mass",
                    "To change the state of matter",
                    "To increase reaction speed",
                    "To alter chemical formulas"
                ],
                "options_ta": [
                    "பொருண்மை அழியா விதியை நிறைவு செய்ய",
                    "பொருளின் நிலையை மாற்ற",
                    "வினை வேகத்தை அதிகரிக்க",
                    "வாய்ப்பாட்டை மாற்றியமைக்க"
                ],
                "options_hi": [
                    "द्रव्यमान संरक्षण के नियम को संतुष्ट करने के लिए",
                    "पदार्थ की अवस्था बदलने के लिए",
                    "अभिक्रिया की गति बढ़ाने के लिए",
                    "रासायनिक सूत्र बदलने के लिए"
                ],
                "correct_index": 0,
                "explanation": "Mass can neither be created nor destroyed in a chemical reaction, requiring total reactant mass to equal total product mass (NCERT Science Ch. 1, p. 3).",
                "explanation_ta": "வேதி வினைகளில் பொருண்மை ஆக்கப்படவோ அழிக்கப்படவோ இயலாது (பொருண்மை அழியா விதி).",
                "explanation_hi": "रासायनिक अभिक्रिया में द्रव्यमान का न तो निर्माण होता है और न ही विनाश (द्रव्यमान संरक्षण का नियम)।"
            },
            {
                "id": "quiz_early_ukg_fingers",
                "board": "early_learning",
                "class_grade": "UKG",
                "subject": "Mathematics",
                "chapter_name": "Numbers & Shapes 1 to 10",
                "page_reference": "Page 12",
                "question": "How many fingers do we have on one hand?",
                "question_ta": "நமது ஒரு கையில் எத்தனை விரல்கள் உள்ளன?",
                "question_hi": "हमारे एक हाथ में कितनी उंगलियाँ होती हैं?",
                "options": ["3", "4", "5", "10"],
                "options_ta": ["3", "4", "5", "10"],
                "options_hi": ["3", "4", "5", "10"],
                "correct_index": 2,
                "explanation": "We have 5 fingers on each hand (Foundational Numbers 1 to 10, p. 12).",
                "explanation_ta": "ஒரு கையில் 5 விரல்கள் உள்ளன (பக்கம் 12).",
                "explanation_hi": "एक हाथ में 5 उंगलियाँ होती हैं।"
            }
        ]

    def get_quizzes(self, board: str = None, class_grade: str = None, subject: str = None, lang: str = "en") -> List[Dict[str, Any]]:
        filtered = []
        for q in self.quiz_bank:
            if board and board != "all" and q["board"] != board:
                continue
            if class_grade and class_grade != "all" and q["class_grade"].lower().replace(" ", "") != class_grade.lower().replace(" ", ""):
                continue
            if subject and subject != "all" and subject.lower() not in q["subject"].lower():
                continue

            # Localize question fields
            item = {
                "id": q["id"],
                "board": q["board"],
                "class_grade": q["class_grade"],
                "subject": q["subject"],
                "chapter_name": q["chapter_name"],
                "page_reference": q["page_reference"],
                "question": q.get(f"question_{lang}") or q["question"],
                "options": q.get(f"options_{lang}") or q["options"],
                "correct_index": q["correct_index"],
                "explanation": q.get(f"explanation_{lang}") or q["explanation"]
            }
            filtered.append(item)
        return filtered

    def grade_submission(self, answers: List[Dict[str, Any]], lang: str = "en") -> Dict[str, Any]:
        """
        Grades student quiz answers and provides grounded feedback.
        """
        score = 0
        total = len(answers)
        details = []

        quiz_lookup = {q["id"]: q for q in self.quiz_bank}

        for ans in answers:
            q_id = ans.get("quiz_id")
            selected_idx = ans.get("selected_index")
            q_data = quiz_lookup.get(q_id)
            if not q_data:
                continue

            is_correct = selected_idx == q_data["correct_index"]
            if is_correct:
                score += 1

            details.append({
                "quiz_id": q_id,
                "is_correct": is_correct,
                "selected_index": selected_idx,
                "correct_index": q_data["correct_index"],
                "explanation": q_data.get(f"explanation_{lang}") or q_data["explanation"],
                "page_reference": q_data.get("page_reference"),
                "chapter_name": q_data.get("chapter_name")
            })

        percentage = round((score / max(1, total)) * 100, 1)
        return {
            "score": score,
            "total": total,
            "percentage": percentage,
            "passed": percentage >= 60.0,
            "details": details
        }

quiz_service = QuizService()
