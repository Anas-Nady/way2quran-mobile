const arabicRegex = /[\u0600-\u06FF]/;

export default function getFontClass(text: string) {
  return arabicRegex.test(text) ? "font-arabic" : "font-english";
}
