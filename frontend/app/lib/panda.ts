import { compiledCourses } from "../lessons/compiled-courses";
import { learningLanguages } from "../lessons/course";

export const tutorLanguages = ["Python", "JavaScript", "C++", "Java", "C#"] as const;
export type TutorLanguage = (typeof tutorLanguages)[number];

export type PandaAnswer = {
  reply: string;
  source: string;
};

function apiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://127.0.0.1:8000";
  }
  return null;
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function teach(message: string): string {
  const text = message.toLowerCase();

  if (includesAny(text, ["variable", "variables"])) {
    return [
      "A variable is a named box that holds a value.",
      "",
      "```python",
      'name = "Aman"',
      "score = 12",
      'print(name)',
      "print(score)",
      "```",
      "",
      "Line by line:",
      '- `name = "Aman"` stores the text Aman in a box called name.',
      "- `score = 12` stores the number 12.",
      "- `print(...)` shows what is inside the box.",
      "",
      "You can change a variable later: `score = score + 1` makes it 13.",
      "Text belongs in quotes. Numbers do not.",
    ].join("\n");
  }

  if (includesAny(text, ["print", "output", "console.log", "console"])) {
    return [
      "Printing means showing a result on the screen.",
      "",
      "Python:",
      "```python",
      'print("Hello, CodeBuddy")',
      "print(2 + 3)",
      "```",
      "Output:",
      "```text",
      "Hello, CodeBuddy",
      "5",
      "```",
      "",
      "JavaScript uses `console.log` instead of `print`:",
      "```javascript",
      'console.log("Hello, CodeBuddy");',
      "```",
      "",
      "If nothing appears, check that you called print or console.log, then run the code again.",
    ].join("\n");
  }

  if (includesAny(text, ["if", "else", "condition", "decision", "true", "false"])) {
    return [
      "An if statement lets the program choose.",
      "",
      "```python",
      "score = 80",
      "if score >= 50:",
      '    print("You passed")',
      "else:",
      '    print("Try again")',
      "```",
      "",
      "Python checks `score >= 50`. Because 80 is greater, it prints You passed and skips the else.",
      "The indented lines belong to that choice. Indentation is required in Python.",
      "",
      "Useful comparisons: `==` equal, `!=` not equal, `>` greater, `<` smaller, `>=` greater or equal.",
    ].join("\n");
  }

  if (includesAny(text, ["for loop", "for ", "loop", "repeat"])) {
    return [
      "A for loop repeats code for each item, so you do not copy the same line.",
      "",
      "```python",
      "for number in range(1, 4):",
      '    print("Lap", number)',
      "```",
      "",
      "`range(1, 4)` gives 1, 2, and 3. It stops before 4.",
      "The print line runs once for each number.",
      "",
      "The same idea in JavaScript:",
      "```javascript",
      "for (let number = 1; number <= 3; number++) {",
      '  console.log("Lap", number);',
      "}",
      "```",
    ].join("\n");
  }

  if (includesAny(text, ["while"])) {
    return [
      "A while loop keeps going as long as a condition stays true.",
      "",
      "```python",
      "lives = 3",
      "while lives > 0:",
      '    print("Lives left:", lives)',
      "    lives = lives - 1",
      "```",
      "",
      "Each pass subtracts 1. When lives becomes 0, `lives > 0` is false and the loop stops.",
      "If you forget to change lives, the loop never ends. That is an infinite loop.",
    ].join("\n");
  }

  if (includesAny(text, ["function", "def ", "parameter", "return"])) {
    return [
      "A function is a reusable recipe. You name it once, then call it whenever you need it.",
      "",
      "```python",
      "def greet(name):",
      '    return "Hello, " + name',
      "",
      'message = greet("Panda")',
      "print(message)",
      "```",
      "",
      "- `def greet(name):` creates the function. `name` is the input.",
      "- `return` sends a result back.",
      '- `greet("Panda")` runs the recipe and gives back `Hello, Panda`.',
      "",
      "Use a function when you would otherwise copy the same code more than once.",
    ].join("\n");
  }

  if (includesAny(text, ["list", "array", "dictionary", "dict"])) {
    return [
      "A list keeps several values in order.",
      "",
      "```python",
      'colors = ["red", "green", "blue"]',
      "print(colors[0])",
      'colors.append("gold")',
      "```",
      "",
      "The first item is index 0, so this prints red. `append` adds gold at the end.",
      "",
      "A dictionary stores labeled values:",
      "```python",
      'player = {"name": "Aman", "score": 12}',
      'print(player["name"])',
      "```",
      "Use a list for a sequence, and a dictionary when each value needs a name.",
    ].join("\n");
  }

  if (includesAny(text, ["error", "bug", "debug", "traceback", "syntax"])) {
    return [
      "Debugging means reading the error, finding the line, and changing one thing at a time.",
      "",
      "Common beginner errors:",
      "- `SyntaxError` — a typo, a missing colon, or a missing quote.",
      "- `NameError` — you used a variable name that was never created.",
      "- `IndentationError` — the spaces before a line are uneven.",
      "- `TypeError` — you mixed types, such as adding a number to text.",
      "",
      "Try this pattern:",
      "1. Read the last line of the error. It names the problem.",
      "2. Look at the line number it mentions.",
      "3. Add a print just before that line to see the values.",
      "4. Fix one issue, then run again.",
      "",
      "Example of a type mix-up and the fix:",
      "```python",
      'name = "Panda"',
      "print(name + \" is \" + str(2) + \" years old\")",
      "```",
      "`str(2)` turns the number into text so it can be joined.",
    ].join("\n");
  }

  if (includesAny(text, ["project", "build", "practice", "challenge", "problem"])) {
    return [
      "Here is a small project you can finish in one sitting: a quiz score tracker.",
      "",
      "1. Create `score = 0`.",
      "2. Ask three yes-or-no questions with `input()`.",
      "3. Add 1 to score for each correct answer.",
      "4. Print a different message if the score is 3, at least 1, or 0.",
      "",
      "Starter code:",
      "```python",
      "score = 0",
      'answer = input("Is Python a programming language? yes/no: ")',
      'if answer.lower() == "yes":',
      "    score = score + 1",
      'print("Your score is", score)',
      "```",
      "",
      "Add two more questions yourself before looking up a full solution. Try it in the lessons first, then ask me about the part that gets stuck.",
    ].join("\n");
  }

  if (includesAny(text, ["javascript", "js ", " vs "])) {
    return [
      "Python and JavaScript can express the same ideas with different spelling.",
      "",
      "```python",
      'name = "Panda"',
      "print(name)",
      "```",
      "",
      "```javascript",
      'const name = "Panda";',
      "console.log(name);",
      "```",
      "",
      "Python uses indentation and `print`. JavaScript uses braces, semicolons, and `console.log`.",
      "Learn the idea once — a variable, a decision, a loop — then the second language is mostly new spelling.",
      "The playground on this site runs both Python and JavaScript. Try the Python examples directly from a lesson.",
    ].join("\n");
  }

  if (message.trim().split("\n").length > 2 || text.includes("```") || text.includes("def ") || text.includes("console.log")) {
    return [
      "I can see you shared some code. Read it in this order:",
      "",
      "1. What names are being created? Those are variables.",
      "2. Which lines only run when a condition is true?",
      "3. Which lines repeat?",
      "4. What is the last value that gets printed?",
      "",
      "Paste one function or one error message and tell me what you expected to happen. I will walk through that exact piece.",
      "",
      "A reliable check is to add a print or `console.log` before the line that surprises you.",
    ].join("\n");
  }

  return [
    "I am Panda, your coding buddy. Ask me about a beginner topic and I will explain it with a short example.",
    "",
    "Good questions sound like:",
    "- Teach me Python variables.",
    "- How does a for loop work?",
    "- What does this error mean: NameError?",
    "- Give me a tiny Python project.",
    "",
    `You asked: "${message.trim()}"`,
    "",
    "Tell me the language (Python or JavaScript) and what you expected the code to do. We will solve it one line at a time.",
  ].join("\n");
}

export async function askPanda(message: string, language: TutorLanguage = "Python"): Promise<PandaAnswer> {
  const base = apiBase();
  if (base) {
    try {
      const health = await fetch(`${base}/api/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(1200),
      });
      if (health.ok) {
        const response = await fetch(`${base}/api/tutor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, language }),
          signal: AbortSignal.timeout(120000),
        });
        if (response.ok) {
          const data: unknown = await response.json();
          if (
            data &&
            typeof data === "object" &&
            "reply" in data &&
            typeof data.reply === "string" &&
            data.reply.trim()
          ) {
            return { reply: data.reply, source: "Ollama" };
          }
        }
      }
    } catch {
      // The phone and the published site use the built-in tutor.
    }
  }

  const course = compiledCourses.find((item) => learningLanguages[item.language] === language);
  if (course) {
    const topic = message.toLowerCase();
    const unit = course.units.find((item) => topic.includes(item.topic.toLowerCase()) ||
      topic.includes(item.topic.toLowerCase().replace(/s$/, ""))) ?? course.units[0];
    const { content } = unit;
    return {
      reply: [
        `Panda is offline. Here is a worked ${language} example from the lessons.`,
        content.explanation,
        `\`\`\`${course.language}\n${content.code}\n\`\`\``,
        `Expected output: ${content.output}`,
        content.exercise,
      ].join("\n\n"),
      source: "Built-in guidance",
    };
  }
  return { reply: teach(language === "JavaScript" ? `JavaScript: ${message}` : message), source: "Built-in guidance" };
}
