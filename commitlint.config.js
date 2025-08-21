export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",      // for new features
        "fix",       // bug fixes
        "docs",      // documentation changes
        "style",     // formatting, missing semi colons, etc
        "refactor",  // refactoring production code
        "test",      // adding tests
        "chore"      // maintenance, build tasks
      ]
    ],
    "type-case": [2, "always", "lower-case"],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]]
  }
};
