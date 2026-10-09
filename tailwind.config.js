// In Markdown, only read class="..." / className="..." attributes. Scanning the
// whole text turns ordinary English words ("outline", "sticky", "collapse",
// "transition") into global utility classes.
const classAttributes = (content) => {
  const classes = [];
  for (const match of content.matchAll(/class(?:Name)?=["']([^"']*)["']/g)) {
    classes.push(...match[1].split(/\s+/).filter(Boolean));
  }
  return classes;
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: [
      "./src/**/*.{js,jsx,ts,tsx,md,mdx}",
      "./docs/**/*.{md,mdx}",
      "./blog/**/*.{md,mdx}",
    ],
    extract: { md: classAttributes, mdx: classAttributes },
  },
  // The site is light-only (colorMode.disableSwitch). Follow Docusaurus's own
  // theme switch for `dark:` variants, not the visitor's OS setting, so the
  // pages that carry `dark:` classes do not turn dark for OS dark-mode users.
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: "#008060",
        "primary-02": "#E5FFF9",
        "Neutrals-01": "#101828",
        "Neutrals-02": "#222630",
        "Neutrals-03": "#343946",
        "Neutrals-04": "#687082",
        "Neutrals-05": "#B1B5C3",
        "Neutrals-06": "#E6E8EC",
        "Other-01": "#F8F9FA",
        "Other-02": "#CDF3F2",
        "Other-03": "#202328",
        "Success-01": "#00764A",
        "Success-02": "#A9EFC8",
        "Success-03": "#ECFDF3",
      },
      boxShadow: {
        extension:
          "0px 0px 0px 1px rgba(17, 24, 28, 0.08), 0px 1px 2px -1px rgba(17, 24, 28, 0.08), 0px 2px 4px 0px rgba(17, 24, 28, 0.04)",
        button:
          "0px 1px 0px 1px rgba(255, 255, 255, 0.12) inset, 0px 1px 2px 0px rgba(16, 24, 40, 0.16)",
      },
      backgroundImage: {
        "green-conner":
          "radial-gradient(50% 50% at 0% 100%, rgba(40, 179, 136, 0.16) 0%, rgba(255, 255, 255, 0) 100%)",
      },
      filter: {
        toggle:
          "drop-shadow(0px 1px 2px rgba(16, 24, 40, 0.06)) drop-shadow(0px 1px 3px rgba(16, 24, 40, 0.10))",
      },
    },
    container: {
      center: true,
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      padding: {
        DEFAULT: "16px",
        md: "20px",
        xl: "32px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
