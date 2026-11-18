export type Lesson = {
  id: number;
  chapterId: number;
  title: string;
  topic: string;
  duration: string;
  emoji: string;
  description: string;
  level: string;
  xp: number;
};

export type Chapter = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

export const chapters: Chapter[] = [
  {
    id: 1,
    title: "Python foundations",
    description: "Get comfortable with your first Python instructions.",
    icon: "🌱",
  },
  {
    id: 2,
    title: "Logic and loops",
    description: "Make choices and repeat actions in your programs.",
    icon: "🔁",
  },
  {
    id: 3,
    title: "Reusable code",
    description: "Build useful blocks of code with functions.",
    icon: "🧩",
  },
  {
    id: 4,
    title: "Working with collections",
    description: "Organize related information in lists and dictionaries.",
    icon: "🗂️",
  },
];

export const lessons: Lesson[] = [
  {
    id: 1,
    chapterId: 1,
    title: "Meet Python",
    topic: "Introduction",
    duration: "15-20 min",
    emoji: "🐍",
    description: "Meet your new coding friend and write your first program.",
    level: "Beginner",
    xp: 10,
  },
  {
    id: 2,
    chapterId: 1,
    title: "Variables & Data",
    topic: "Fundamentals",
    duration: "15-20 min",
    emoji: "📦",
    description: "Store information in variables, just like labeled boxes.",
    level: "Beginner",
    xp: 15,
  },
  {
    id: 3,
    chapterId: 1,
    title: "Print Your Ideas",
    topic: "Output",
    duration: "15-20 min",
    emoji: "🖨️",
    description: "Show messages and results on the screen.",
    level: "Beginner",
    xp: 10,
  },
  {
    id: 7,
    chapterId: 2,
    title: "Compare Values",
    topic: "Comparisons",
    duration: "15-20 min",
    emoji: "⚖️",
    description: "Compare numbers and understand true and false results.",
    level: "Beginner",
    xp: 15,
  },
  {
    id: 4,
    chapterId: 2,
    title: "Make Decisions",
    topic: "Conditions",
    duration: "15-20 min",
    emoji: "🤔",
    description: "Teach your program to make choices with if and else.",
    level: "Beginner",
    xp: 20,
  },
  {
    id: 5,
    chapterId: 2,
    title: "Loop the Loop",
    topic: "For loops",
    duration: "15-20 min",
    emoji: "🔁",
    description: "Repeat actions without writing the same code again.",
    level: "Beginner",
    xp: 20,
  },
  {
    id: 8,
    chapterId: 2,
    title: "Repeat with While",
    topic: "While loops",
    duration: "15-20 min",
    emoji: "⏳",
    description: "Keep repeating instructions while a condition is true.",
    level: "Beginner",
    xp: 15,
  },
  {
    id: 6,
    chapterId: 3,
    title: "Functions: Superpowers",
    topic: "Functions",
    duration: "15-20 min",
    emoji: "🦸",
    description: "Create reusable blocks of code to do useful tasks.",
    level: "Beginner",
    xp: 25,
  },
  {
    id: 9,
    chapterId: 3,
    title: "Add Inputs and Results",
    topic: "Function parameters",
    duration: "15-20 min",
    emoji: "🎁",
    description: "Give functions information and get useful results back.",
    level: "Beginner",
    xp: 20,
  },
  {
    id: 10,
    chapterId: 4,
    title: "Create a List",
    topic: "Lists",
    duration: "15-20 min",
    emoji: "📝",
    description: "Keep several related values together in one collection.",
    level: "Beginner",
    xp: 15,
  },
  {
    id: 11,
    chapterId: 4,
    title: "Use List Items",
    topic: "List operations",
    duration: "15-20 min",
    emoji: "📋",
    description: "Read, add, and count items in a Python list.",
    level: "Beginner",
    xp: 20,
  },
  {
    id: 12,
    chapterId: 4,
    title: "Meet Dictionaries",
    topic: "Dictionaries",
    duration: "15-20 min",
    emoji: "🔑",
    description: "Look up related information using clear keys and values.",
    level: "Beginner",
    xp: 20,
  },
];

export const lessonContent: Record<
  number,
  {
    heading: string;
    explanation: string;
    code: string;
    output: string;
    question: string;
    options: string[];
    answer: number;
    reason: string;
  }
> = {
  1: {
    heading: "Your first Python program",
    explanation:
      "Python is a programming language. We use it to give instructions to a computer. The print() function displays a message on the screen.",
    code: 'print("Hello, World!")',
    output: "Hello, World!",
    question: "What does print() do in this example?",
    options: [
      "Deletes a message",
      "Displays a message",
      "Creates a new computer",
      "Repeats the message forever",
    ],
    answer: 1,
    reason:
      "Correct! print() displays the text inside the parentheses. The quotation marks tell Python that Hello, World! is text.",
  },
  2: {
    heading: "Store information in variables",
    explanation:
      "A variable is like a labeled box. You give it a name and store a value inside it. Python can use that value later.",
    code: 'name = "Panda"\nprint(name)',
    output: "Panda",
    question: "What value is stored in the variable name?",
    options: ['"Python"', '"Panda"', "print", "Nothing"],
    answer: 1,
    reason:
      'Correct! The line name = "Panda" stores the text Panda in the variable called name.',
  },
  3: {
    heading: "Print your ideas",
    explanation:
      "The print() function can display text, numbers, and the results of calculations.",
    code: 'print("Coding is fun!")\nprint(2 + 3)',
    output: "Coding is fun!\n5",
    question: "What will print(2 + 3) display?",
    options: ["23", "2 + 3", "5", "An error"],
    answer: 2,
    reason:
      "Correct! Python calculates 2 + 3 first, then print() displays the result: 5.",
  },
  4: {
    heading: "Teach your code to decide",
    explanation:
      "An if statement checks a condition. If the condition is true, Python runs the indented code underneath it.",
    code: 'age = 18\nif age >= 18:\n    print("You can vote!")',
    output: "You can vote!",
    question: "When does the code inside an if block run?",
    options: [
      "Whenever the computer starts",
      "When its condition is true",
      "Only when the condition is false",
      "Never",
    ],
    answer: 1,
    reason:
      "Correct! Since 18 >= 18 is true, Python displays You can vote!",
  },
  5: {
    heading: "Repeat with loops",
    explanation:
      "A for loop repeats instructions for each item in a sequence. range(3) produces 0, 1, and 2.",
    code: "for i in range(3):\n    print(i)",
    output: "0\n1\n2",
    question: "How many times does this loop run?",
    options: ["Two times", "Three times", "Four times", "Forever"],
    answer: 1,
    reason:
      "Correct! range(3) produces three values: 0, 1, and 2. The loop runs once for each value.",
  },
  6: {
    heading: "Create your own function",
    explanation:
      "A function is a reusable block of code. You define it with def and run it by calling its name.",
    code: 'def say_hi():\n    print("Hi, buddy!")\n\nsay_hi()',
    output: "Hi, buddy!",
    question: "Which keyword is used to define a Python function?",
    options: ["function", "make", "def", "repeat"],
    answer: 2,
    reason: "Correct! Python uses the def keyword to define a function.",
  },
  7: {
    heading: "Compare values",
    explanation:
      "Comparison operators check how two values relate. They produce True or False, which a program can use to make decisions.",
    code: "score = 8\nprint(score >= 5)\nprint(score == 10)",
    output: "True\nFalse",
    question: "What does the expression 8 == 8 evaluate to?",
    options: ["True", "False", "16", "An error"],
    answer: 0,
    reason:
      "Correct! The == operator checks whether the values are equal, so 8 == 8 is True.",
  },
  8: {
    heading: "Repeat while a condition is true",
    explanation:
      "A while loop repeats its indented instructions as long as its condition is true. Updating the value in the loop helps it finish.",
    code: "count = 1\nwhile count <= 3:\n    print(count)\n    count += 1",
    output: "1\n2\n3",
    question: "When does a while loop stop?",
    options: [
      "When its condition becomes false",
      "After every single line",
      "When a variable is created",
      "It never stops",
    ],
    answer: 0,
    reason:
      "Correct! The loop checks its condition again after each turn and stops once that condition is false.",
  },
  9: {
    heading: "Give functions inputs and get results",
    explanation:
      "Parameters let a function receive information. The return keyword sends a result back to the code that called it.",
    code: "def double(number):\n    return number * 2\n\nprint(double(4))",
    output: "8",
    question: "What does return send back from a function?",
    options: [
      "A result to the code that called it",
      "A new function name",
      "A repeated loop",
      "A printed message only",
    ],
    answer: 0,
    reason:
      "Correct! return sends the calculated value back, so double(4) gives the value 8.",
  },
  10: {
    heading: "Keep values together in a list",
    explanation:
      "A list stores multiple values in order. Square brackets create a list, and each item has a position called an index.",
    code: 'pets = ["Panda", "Pup", "Cat"]\nprint(pets[0])',
    output: "Panda",
    question: "Which index gives you the first item in a Python list?",
    options: ["0", "1", "-1 only", "The list length"],
    answer: 0,
    reason:
      "Correct! Python list indexes start at 0, so pets[0] is the first item.",
  },
  11: {
    heading: "Read and update list items",
    explanation:
      "Use append() to add an item to the end of a list and len() to count how many items it contains.",
    code: 'tasks = ["learn"]\ntasks.append("practice")\nprint(len(tasks))',
    output: "2",
    question: "What does tasks.append('practice') do?",
    options: [
      "Adds an item to the list",
      "Removes the whole list",
      "Counts the list items",
      "Sorts the list alphabetically",
    ],
    answer: 0,
    reason:
      "Correct! append() adds the new value to the end of the list.",
  },
  12: {
    heading: "Find information with a dictionary",
    explanation:
      "A dictionary pairs keys with values. Look up a value by placing its key inside square brackets.",
    code: 'buddy = {"name": "Panda", "level": 1}\nprint(buddy["name"])',
    output: "Panda",
    question: "In a dictionary, what do you use to look up a value?",
    options: ["Its key", "Its list position", "A loop only", "The value's length"],
    answer: 0,
    reason:
      'Correct! The key "name" looks up and returns the value "Panda".',
  },
};
