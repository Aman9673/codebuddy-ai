import type { Chapter, LearningLanguage, Lesson, LessonContent } from "./course";

type Unit = Pick<Lesson, "id" | "title" | "topic" | "description" | "xp"> & {
  content: LessonContent;
  followUp: Pick<LessonContent, "question" | "options" | "answer" | "reason">;
  wrongOutputs: [string, string];
};

type CompiledCourse = {
  language: Exclude<LearningLanguage, "python">;
  chapter: Chapter;
  units: Unit[];
};

export const compiledCourses: CompiledCourse[] = [
  {
    language: "cpp",
    chapter: { id: 5, title: "C++ foundations", description: "Write a console program, repeat steps, and define reusable functions.", icon: "⚙️" },
    units: [
      {
        id: 13, title: "Meet C++", topic: "Output", description: "Print a message from your first C++ program.", xp: 10,
        content: {
          heading: "Write to the console with std::cout",
          explanation: "Execution starts in main. The iostream header provides std::cout, and the << operator sends text or values to it. The newline escape moves subsequent output to the next line.",
          code: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, C++!\\n";\n    return 0;\n}',
          output: "Hello, C++!",
          exercise: 'Print your own greeting, then use a second std::cout statement to print "Ready to code!" on the next line.',
          question: "Which name represents the standard output stream?",
          options: ["main", "std::cout", "iostream"], answer: 1, reason: "std::cout is the standard output stream. iostream is the header that declares it.",
        },
        followUp: { question: "What does return 0 signal from main?", options: ["Successful completion", "Print the number zero", "Restart the program"], answer: 0, reason: "A zero exit status signals successful completion." },
        wrongOutputs: ["0", "Hello, C++! followed by 0"],
      },
      {
        id: 14, title: "Count with C++ loops", topic: "Loops", description: "Update an integer total inside a for loop.", xp: 15,
        content: {
          heading: "Add numbers with a for loop",
          explanation: "The for loop initializes n once, checks n <= 4 before each iteration, and increments n after the body. The total lives outside the loop so it keeps its value between iterations.",
          code: '#include <iostream>\n\nint main() {\n    int total = 0;\n    for (int n = 1; n <= 4; ++n) {\n        total += n;\n    }\n    std::cout << total << "\\n";\n}',
          output: "10",
          exercise: "Change the loop to sum 1 through 5. Predict the output before running it.",
          question: "Which part runs after each iteration?", options: ["int n = 1", "n <= 4", "++n"], answer: 2, reason: "The third part of the for header increments n after the loop body runs.",
        },
        followUp: { question: "What does total += n do?", options: ["Resets total to zero", "Adds n to total", "Increments n by total"], answer: 1, reason: "total += n is shorthand for total = total + n." },
        wrongOutputs: ["6", "15"],
      },
      {
        id: 15, title: "Write a C++ function", topic: "Functions", description: "Pass a typed argument and use the returned result.", xp: 20,
        content: {
          heading: "Give a calculation a name",
          explanation: "The function square takes an int named value and returns an int. Its definition appears before main so the compiler knows the function's signature when main calls it.",
          code: '#include <iostream>\n\nint square(int value) {\n    return value * value;\n}\n\nint main() {\n    std::cout << square(6) << "\\n";\n}',
          output: "36",
          exercise: "Call square with 9, then write a function that takes two integers and returns their product.",
          question: "What does the first int in int square(int value) describe?", options: ["The return type", "The function name", "The value of the argument"], answer: 0, reason: "The type before the function name describes the returned result.",
        },
        followUp: { question: "What is the argument in square(6)?", options: ["square", "value", "6"], answer: 2, reason: "The argument is the value supplied at the call site. value is the parameter name." },
        wrongOutputs: ["6", "12"],
      },
    ],
  },
  {
    language: "java",
    chapter: { id: 6, title: "Java foundations", description: "Use a class to organize a console program, decisions, and methods.", icon: "☕" },
    units: [
      {
        id: 16, title: "Meet Java", topic: "Output", description: "Run an entry point inside a class.", xp: 10,
        content: {
          heading: "Print a line from main",
          explanation: "This console program has a class named Main. Java starts in public static void main(String[] args), and System.out.println prints a value followed by a newline.",
          code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}',
          output: "Hello, Java!",
          exercise: "Add a second println call to introduce yourself. Keep both calls inside main.",
          question: "What is the entry-point method called?", options: ["println", "out", "main"], answer: 2, reason: "The runtime starts the program in the main method.",
        },
        followUp: { question: "What filename matches public class Main?", options: ["main.txt", "Main.java", "System.java"], answer: 1, reason: "The Java source filename must match the public class name, including case." },
        wrongOutputs: ["Main", "No output"],
      },
      {
        id: 17, title: "Make decisions in Java", topic: "Conditions", description: "Compare a typed score and choose a branch.", xp: 15,
        content: {
          heading: "Use if and else to choose a message",
          explanation: "The variable score holds an integer. The comparison score >= 60 produces a boolean. Java runs the if block when it is true and the else block when it is false.",
          code: 'public class Main {\n    public static void main(String[] args) {\n        int score = 72;\n        if (score >= 60) {\n            System.out.println("Passed");\n        } else {\n            System.out.println("Keep practicing");\n        }\n    }\n}',
          output: "Passed",
          exercise: "Test scores of 59 and 60. Predict which branch each score takes before checking.",
          question: "Which operator means greater than or equal to?", options: [">=", "==", ">"], answer: 0, reason: ">= includes the boundary value as well as values above it.",
        },
        followUp: { question: "How many of these two branches run for one score?", options: ["Two", "One", "Zero"], answer: 1, reason: "The condition selects either the if block or its else block." },
        wrongOutputs: ["Keep practicing", "72"],
      },
      {
        id: 18, title: "Write a Java method", topic: "Methods", description: "Call a static method that accepts two arguments.", xp: 20,
        content: {
          heading: "Return a value from a static method",
          explanation: "add takes two int parameters. Declaring it static lets the static main method call it directly without creating an instance of Main. The returned value goes to println.",
          code: 'public class Main {\n    static int add(int left, int right) {\n        return left + right;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(add(8, 5));\n    }\n}',
          output: "13",
          exercise: "Add a static multiply method and print the result of multiplying 8 by 5.",
          question: "How many arguments does add expect?", options: ["None", "One", "Two"], answer: 2, reason: "The two parameters left and right each need an argument.",
        },
        followUp: { question: "Which statement passes the sum back to the caller?", options: ["return left + right;", "static int add", "public class Main"], answer: 0, reason: "return sends the calculated sum back to the expression that called add." },
        wrongOutputs: ["40", "85"],
      },
    ],
  },
  {
    language: "csharp",
    chapter: { id: 7, title: "C# foundations", description: "Write a .NET console program, loop through an array, and call a method.", icon: "💠" },
    units: [
      {
        id: 19, title: "Meet C#", topic: "Output", description: "Print an interpolated greeting in a .NET console program.", xp: 10,
        content: {
          heading: "Display a message with Console.WriteLine",
          explanation: "Main is the entry point in this console program. Console.WriteLine prints one line, and the dollar sign before a string lets C# insert expressions placed inside braces.",
          code: 'using System;\n\nclass Program {\n    static void Main() {\n        string name = "Panda";\n        Console.WriteLine($"Hello, {name}!");\n    }\n}',
          output: "Hello, Panda!",
          exercise: "Change the name and add a second line that prints how many lessons you want to finish.",
          question: "Which prefix enables string interpolation here?", options: ["#", "$", "@"], answer: 1, reason: "The $ prefix enables interpolation, and {name} inserts the value of name.",
        },
        followUp: { question: "What does Console.WriteLine append after the message?", options: ["A newline", "A closing brace", "A semicolon"], answer: 0, reason: "WriteLine moves subsequent output to the next line." },
        wrongOutputs: ["Hello, {name}!", "Panda"],
      },
      {
        id: 20, title: "Loop through a C# array", topic: "Arrays and loops", description: "Use foreach to add up values in an integer array.", xp: 15,
        content: {
          heading: "Read each array element with foreach",
          explanation: "scores is an array of integers. foreach assigns each element to score in turn, so you can work with each value without maintaining an index.",
          code: 'using System;\n\nclass Program {\n    static void Main() {\n        int[] scores = { 3, 5, 7 };\n        int total = 0;\n        foreach (int score in scores) {\n            total += score;\n        }\n        Console.WriteLine(total);\n    }\n}',
          output: "15",
          exercise: "Add 9 to the array. Then try an empty array and predict what total will contain.",
          question: "What does score represent on each iteration?", options: ["The array length", "The current index", "The current element"], answer: 2, reason: "foreach assigns the element itself to score.",
        },
        followUp: { question: "Which declaration gives total its initial value?", options: ["int[] scores", "int total = 0;", "foreach (int score in scores)"], answer: 1, reason: "The variable total starts at zero before the iteration begins." },
        wrongOutputs: ["3", "7"],
      },
      {
        id: 21, title: "Write a C# method", topic: "Methods", description: "Use a typed return value to reuse a calculation.", xp: 20,
        content: {
          heading: "Calculate a value and return it",
          explanation: "Double takes one int parameter and returns an int. Main calls the method twice with different arguments. Declaring it static lets Main call it directly in the same class.",
          code: 'using System;\n\nclass Program {\n    static int Double(int number) {\n        return number * 2;\n    }\n\n    static void Main() {\n        Console.WriteLine(Double(4));\n        Console.WriteLine(Double(9));\n    }\n}',
          output: "8\n18",
          exercise: "Write a Triple method and call it twice with different numbers.",
          question: "Which keyword sends the result back to Main?", options: ["return", "using", "class"], answer: 0, reason: "return provides the result of the method call to its caller.",
        },
        followUp: { question: "When Double(9) runs, what value does number receive?", options: ["18", "4", "9"], answer: 2, reason: "Each call supplies its own argument. The second call passes 9." },
        wrongOutputs: ["4 then 9", "18 then 8"],
      },
    ],
  },
];

export const compiledQuizQuestions = Object.fromEntries(compiledCourses.flatMap(({ units }) =>
  units.map(({ id, content, followUp, wrongOutputs }) => {
    const options = [...wrongOutputs];
    const answer = id % 3;
    options.splice(answer, 0, content.output.replaceAll("\n", " then "));
    return [id, [
      followUp,
      { question: "What does the worked example display?", code: content.code, options, answer, reason: `Tracing the example produces ${options[answer]}.` },
    ]];
  }),
));
