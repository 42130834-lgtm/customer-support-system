// Iza fi 7arf 3arabe bel text (la nekteb el message men el yamin)
export function isArabic(text) {
  return /[؀-ۿ]/.test(text)
}
