module.exports = {
  // TypeScript and JavaScript files
  "**/*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"],

  // JSON files
  "**/*.json": ["prettier --write"],

  // CSS and SCSS files
  "**/*.{css,scss}": ["prettier --write"],

  // Markdown files
  "**/*.md": ["prettier --write"],
};
