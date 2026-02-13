import express from "express";
import client from "../db/index.js";

const router = express.Router();

const supportedLanguages = ["javascript", "python", "c"] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

type Snippet = {
  id?: number;
  content: string;
  difficulty: "easy" | "medium" | "hard";
  lang: SupportedLanguage;
};

const defaultSnippets: Record<SupportedLanguage, Snippet[]> = {
  javascript: [
    {
      content:
        "function add(a, b) {\n  return a + b;\n}\nconsole.log(add(3, 4));",
      difficulty: "easy",
      lang: "javascript",
    },
    {
      content:
        "const nums = [1, 2, 3, 4, 5];\nconst squared = nums.map((n) => n * n);\nconsole.log(squared);",
      difficulty: "easy",
      lang: "javascript",
    },
    {
      content:
        "function countVowels(str) {\n  return (str.match(/[aeiou]/gi) || []).length;\n}\nconsole.log(countVowels('Typing test'));",
      difficulty: "medium",
      lang: "javascript",
    },
  ],
  python: [
    {
      content:
        "def add(a, b):\n    return a + b\n\nprint(add(3, 4))",
      difficulty: "easy",
      lang: "python",
    },
    {
      content:
        "numbers = [1, 2, 3, 4, 5]\nsquares = [n * n for n in numbers]\nprint(squares)",
      difficulty: "easy",
      lang: "python",
    },
    {
      content:
        "def count_vowels(text):\n    vowels = \"aeiou\"\n    return sum(1 for ch in text.lower() if ch in vowels)\n\nprint(count_vowels(\"Typing test\"))",
      difficulty: "medium",
      lang: "python",
    },
  ],
  c: [
    {
      content:
        "#include <stdio.h>\n\nint add(int a, int b) {\n  return a + b;\n}\n\nint main(void) {\n  printf(\"%d\\n\", add(3, 4));\n  return 0;\n}",
      difficulty: "easy",
      lang: "c",
    },
    {
      content:
        "#include <stdio.h>\n\nint main(void) {\n  int nums[] = {1, 2, 3, 4, 5};\n  int length = sizeof(nums) / sizeof(nums[0]);\n\n  for (int i = 0; i < length; i++) {\n    printf(\"%d\\n\", nums[i] * nums[i]);\n  }\n\n  return 0;\n}",
      difficulty: "medium",
      lang: "c",
    },
    {
      content:
        "#include <stdio.h>\n\nint factorial(int n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nint main(void) {\n  printf(\"%d\\n\", factorial(5));\n  return 0;\n}",
      difficulty: "medium",
      lang: "c",
    },
  ],
};

function normalizeLanguage(
  raw: string | undefined,
): SupportedLanguage | undefined {
  if (!raw) return undefined;
  const normalized = raw.toLowerCase();
  return supportedLanguages.find((lang) => lang === normalized);
}

async function getSnippetsForLanguage(
  language: SupportedLanguage,
): Promise<Snippet[]> {
  try {
    const result = await client.query(
      "SELECT id, content, difficulty, LOWER(lang) AS lang FROM test WHERE LOWER(lang) = $1",
      [language],
    );

    if (result.rows.length > 0) {
      return result.rows as Snippet[];
    }
  } catch (err) {
    console.error(`Error executing ${language} snippet query`, err);
  }

  return defaultSnippets[language];
}

router.get("/languages", (req, res) => {
  res.json(supportedLanguages);
});

async function snippetsHandler(req: express.Request, res: express.Response) {
  const fromQuery =
    typeof req.query.lang === "string" ? req.query.lang : undefined;
  const fromParam =
    typeof req.params.lang === "string" ? req.params.lang : undefined;
  const language = normalizeLanguage(fromQuery ?? fromParam) ?? "javascript";

  const snippets = await getSnippetsForLanguage(language);
  res.json(snippets);
}

router.get("/", snippetsHandler);
router.get("/:lang", snippetsHandler);

router.get("/legacy/all", async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM test`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Server Error");
  }
});

export default router;
