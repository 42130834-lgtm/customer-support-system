// El problems el ma3roufe w 7loulon b 3 lughat.
// Ba3den, lamma ne3mel el backend, hayda el KB byentkel 3al server.
export const KB = [
  {
    kw: ["slow", "بطيء", "تقيل", "batii2", "bati2", "batii", "tqil", "t2il", "ثقيل", "بطئ"],
    en: "Restart your router, wait 30 seconds, then check your data package.",
    ar: "أعد تشغيل الراوتر وانتظر 30 ثانية، ثم تأكد من باقة الداتا.",
    arabizi: "A3ed tashghil l router w estanna 30 sanye, baden etakked mn bakit l data.",
  },
  {
    kw: ["balance", "رصيد", "rased", "rasid", "رصيدي"],
    en: "Dial *100# to check your balance.",
    ar: "اطلب *100# لمعرفة رصيدك.",
    arabizi: "Utlob *100# la ta3ref rasidak.",
  },
  {
    kw: ["signal", "network", "شبكة", "تغطية", "shabake", "ma fi", "no service"],
    en: "Turn airplane mode on for 10 seconds, then off.",
    ar: "شغّل وضع الطيران 10 ثواني ثم أطفئه.",
    arabizi: "Shaghel airplane mode 10 sawene w baden tfiyo.",
  },
];

const NOT_FOUND = {
  en: "I could not find a solution. An operator will help you.",
  ar: "لم أجد حلاً. سيساعدك أحد الموظفين.",
  arabizi: "Ma la2ayt 7al. Operator ra7 ysa3dak.",
};

const ARABIZI_WORDS = new Set(["ktir", "shu", "kef", "kif", "mesh", "msh", "bade", "baddi", "ma3", "w", "el", "fi", "bshuf"]);

export function detectLang(text) {
  if (/[؀-ۿ]/.test(text)) return "ar";
  const words = text.toLowerCase().match(/[a-z0-9']+/g) || [];
  for (const w of words) {
    if (ARABIZI_WORDS.has(w)) return "arabizi";
    // kelme fiya 7rouf + ra2am 2/3/5/7 (batii2, 3am, 7al) - bas mesh "5g" aw "4g"
    if (/[a-z]/.test(w) && /[2357]/.test(w) && !/^\d+g$/.test(w)) return "arabizi";
  }
  return "en";
}

export function findAnswer(message) {
  const text = message.toLowerCase();
  const lang = detectLang(message);
  let best = null;
  let bestScore = 0;
  for (const item of KB) {
    const score = item.kw.filter((k) => text.includes(k.toLowerCase())).length;
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  if (best) return { answer: best[lang], lang, escalate: false };
  return { answer: NOT_FOUND[lang], lang, escalate: true };
}
