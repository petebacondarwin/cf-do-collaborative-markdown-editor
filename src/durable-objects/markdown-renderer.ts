import markdown from "markdown-it";

// Sadly highlight.js has a global reference to the DOM typings, which conflict with the workers-types globals (e.g. Request and Response).

// import hljs from "highlight.js";
// function highlight(str: string, lang: string): string {
//   if (lang && hljs.getLanguage(lang)) {
//     try {
//       return hljs.highlight(str, { language: lang }).value;
//     } catch (e) {
//       console.error(e);
//     }
//   }
//   return "";
// }

export const renderer = markdown({
  html: true,
  linkify: true,
  typographer: true,
  quotes: "“”‘’"
  //   highlight
});
