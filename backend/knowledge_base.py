"""
El "brain" taba3 el chat - halla2 b keywords.
Ba3den el ML model byeji ma7al find_answer(), w el ba2e ma byet8ayyar.
"""
import re

PROBLEMS = [
    {
        "keywords": ["slow", "بطيء", "تقيل", "ثقيل", "بطئ", "batii2", "bati2", "batii", "t2il", "tqil"],
        "en": "Restart your router, wait 30 seconds, then check your data package.",
        "ar": "أعد تشغيل الراوتر وانتظر 30 ثانية، ثم تأكد من باقة الداتا.",
        "arabizi": "A3ed tashghil l router w estanna 30 sanye, baden etakked mn bakit l data.",
    },
    {
        "keywords": ["balance", "رصيد", "رصيدي", "rasid", "rased"],
        "en": "Dial *100# to check your balance.",
        "ar": "اطلب *100# لمعرفة رصيدك.",
        "arabizi": "Utlob *100# la ta3ref rasidak.",
    },
    {
        "keywords": ["signal", "network", "no service", "شبكة", "تغطية", "shabake", "ma fi"],
        "en": "Turn airplane mode on for 10 seconds, then off.",
        "ar": "شغّل وضع الطيران 10 ثواني ثم أطفئه.",
        "arabizi": "Shaghel airplane mode 10 sawene w baden tfiyo.",
    },
]

NOT_FOUND = {
    "en": "I could not find a solution. An operator will help you.",
    "ar": "لم أجد حلاً. سيساعدك أحد الموظفين.",
    "arabizi": "Ma la2ayt 7al. Operator ra7 ysa3dak.",
}

ARABIZI_WORDS = {"ktir", "shu", "kef", "kif", "mesh", "msh", "bade", "baddi", "ma3", "el", "fi", "bshuf", "w"}


def detect_language(text):
    if re.search(r"[؀-ۿ]", text):
        return "ar"
    for word in re.split(r"[^a-z0-9']+", text.lower()):
        if word in ARABIZI_WORDS:
            return "arabizi"
        # kelme fiya 7rouf w ra2am 2/3/5/7 (batii2, 3am, 7al) - bas mesh 3g/4g/5g
        if re.search(r"[a-z]", word) and re.search(r"[2357]", word) and word not in ("3g", "4g", "5g"):
            return "arabizi"
    return "en"


def find_answer(message):
    text = message.lower()
    language = detect_language(message)

    best, best_score = None, 0
    for problem in PROBLEMS:
        score = sum(1 for k in problem["keywords"] if k in text)
        if score > best_score:
            best, best_score = problem, score

    if best:
        return {"answer": best[language], "language": language, "escalate": False}
    return {"answer": NOT_FOUND[language], "language": language, "escalate": True}
