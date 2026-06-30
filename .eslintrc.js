module.exports = {
  root: true,
  env: { browser: true, node: true, es2021: true },
  extends: ["next/core-web-vitals"],
  rules: {},
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
