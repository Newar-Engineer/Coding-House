// ── Coding House — Language-Specific Challenges Database ──
const CHALLENGES_DB = {
  python: {
    easy: [
      { id: "py_e1", title: "Reverse a string using slicing", desc: "Given a string, return its reversed version using Python's slicing syntax (e.g. s[::-1]).", template: "def reverse_string(s):\n    # Write your code here\n    return s[::-1]\n\nprint(reverse_string('Coding House'))" },
      { id: "py_e2", title: "List comprehension for even squares", desc: "Write a single-line list comprehension that generates the squares of all even numbers from 1 to 50.", template: "# Write list comprehension below\neven_squares = [x**2 for x in range(1, 51) if x % 2 == 0]\nprint(even_squares)" },
      { id: "py_e3", title: "Find most common word", desc: "Use collections.Counter to find the most common word in a paragraph and its frequency.", template: "from collections import Counter\n\ndef most_common_word(paragraph):\n    # Write your code here\n    words = paragraph.lower().split()\n    return Counter(words).most_common(1)[0]\n\ntext = 'learn python code python work python'\nprint(most_common_word(text))" },
      { id: "py_e4", title: "Read CSV using DictReader", desc: "Read a CSV-formatted string and print each row as a dictionary using the csv.DictReader class.", template: "import csv\nimport io\n\ncsv_data = 'name,role,level\\nShrestha,Pro,Normal\\nAlice,Admin,Professional'\n\ndef read_csv_dicts(data):\n    f = io.StringIO(data)\n    reader = csv.DictReader(f)\n    for row in reader:\n        print(dict(row))\n\nread_csv_dicts(csv_data)" },
      { id: "py_e5", title: "Infinite Fibonacci generator", desc: "Write a generator function that yields Fibonacci numbers infinitely.", template: "def fibonacci_gen():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\ngen = fibonacci_gen()\nfor _ in range(10):\n    print(next(gen))" },
      { id: "py_e6", title: "Capture args and kwargs", desc: "Write a function that accepts *args and **kwargs, and prints the arguments captured.", template: "def log_arguments(*args, **kwargs):\n    print('Args:', args)\n    print('Kwargs:', kwargs)\n\nlog_arguments(1, 2, 3, site='Coding House', rating=5)" },
      { id: "py_e7", title: "Execution time logger decorator", desc: "Implement a simple decorator function that logs the execution time of any decorated function.", template: "import time\n\ndef timer_decorator(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        res = func(*args, **kwargs)\n        print(f'{func.__name__} took {time.time()-start:.6f}s')\n        return res\n    return wrapper\n\n@timer_decorator\ndef test_fn():\n    time.sleep(0.1)\n\ntest_fn()" }
    ],
    medium: [
      { id: "py_m1", title: "Custom Iterator Class", desc: "Implement a custom iterator class that returns numbers in a specified range with custom steps using __iter__ and __next__.", template: "class RangeIterator:\n    def __init__(self, start, end, step=1):\n        self.current = start\n        self.end = end\n        self.step = step\n\n    def __iter__(self):\n        return self\n\n    def __next__(self):\n        if self.current >= self.end:\n            raise StopIteration\n        val = self.current\n        self.current += self.step\n        return val\n\nfor n in RangeIterator(2, 10, 2):\n    print(n)" },
      { id: "py_m2", title: "Dataclass with Validation", desc: "Use the dataclasses module to build a Student class with validation inside the __post_init__ hook.", template: "from dataclasses import dataclass\n\n@dataclass\nclass Student:\n    name: str\n    xp: int\n\n    def __post_init__(self):\n        if self.xp < 0:\n            raise ValueError('XP cannot be negative')\n\ns = Student('Shrestha', 2800)\nprint(s)" },
      { id: "py_m3", title: "Multithreaded Downloader", desc: "Write a script using concurrent.futures to fetch multiple fake network simulation URLs concurrently.", template: "import concurrent.futures\nimport time\n\ndef download_url(url):\n    time.sleep(0.1)\n    return f'Content of {url}'\n\nurls = ['site1.com', 'site2.com', 'site3.com']\nwith concurrent.futures.ThreadPoolExecutor() as executor:\n    results = executor.map(download_url, urls)\n    for r in results:\n        print(r)" }
    ],
    hard: [
      { id: "py_h1", title: "Mini SQLite ORM", desc: "Build a miniature Object-Relational Mapper that maps Python class attributes to database tables in SQLite.", template: "import sqlite3\n\n# Implement a minimal ORM class wrapper\nprint('SQLite ORM base initialized')" }
    ],
    expert: [
      { id: "py_x1", title: "FastAPI Backend Skeleton", desc: "Build a lightweight mock FastAPI controller router with dependencies, JWT validation middleware, and async execution simulations.", template: "print('Async FastAPI Controller initialized')" }
    ]
  },
  javascript: {
    easy: [
      { id: "js_e1", title: "String Reversal", desc: "Write a function to reverse a string using split, reverse, and join.", template: "function reverseString(str) {\n    return str.split('').reverse().join('');\n}\nconsole.log(reverseString('Coding House'));" },
      { id: "js_e2", title: "Map-Filter-Reduce Chain", desc: "Filter even numbers from an array, double them, and sum them using array methods.", template: "const nums = [1, 2, 3, 4, 5, 6];\nconst sum = nums.filter(x => x % 2 === 0).map(x => x * 2).reduce((a, b) => a + b, 0);\nconsole.log(sum);" },
      { id: "js_e3", title: "Write debounce function", desc: "Implement a basic debounce higher-order utility that delays function execution.", template: "function debounce(fn, delay) {\n    let timer;\n    return function(...args) {\n        clearTimeout(timer);\n        timer = setTimeout(() => fn.apply(this, args), delay);\n    };\n}\nconst log = debounce(() => console.log('Debounced!'), 100);\nlog();" }
    ],
    medium: [
      { id: "js_m1", title: "Promise from scratch", desc: "Build a custom, simplified Promise class that supports resolve, reject, and then chaining.", template: "class MyPromise {\n    // Implement custom promise behavior\n}\nconsole.log('Promise base ready');" }
    ],
    hard: [
      { id: "js_h1", title: "Reactive Proxy State", desc: "Implement a proxy-based reactive state tracking system similar to Vue's reactive core.", template: "function reactive(obj) {\n    return new Proxy(obj, {\n        set(target, key, val) {\n            console.log(`Setting ${key} = ${val}`);\n            target[key] = val;\n            return true;\n        }\n    });\n}\nconst state = reactive({ count: 0 });\nstate.count = 5;" }
    ],
    expert: [
      { id: "js_x1", title: "Interactive course tree engine", desc: "Build a dynamic layout connector engine that maps node coordinates into SVG path curves.", template: "console.log('SVG pathway engine ready');" }
    ]
  },
  typescript: {
    easy: [
      { id: "ts_e1", title: "Discriminated Union API State", desc: "Define a type-safe discriminated union to handle success, loading, and error states.", template: "type APIState =\n  | { status: 'loading' }\n  | { status: 'success'; data: string }\n  | { status: 'error'; message: string };\n\nfunction handleState(state: APIState) {\n    switch(state.status) {\n        case 'loading': return 'Loading...';\n        case 'success': return 'Data: ' + state.data;\n        case 'error': return 'Error: ' + state.message;\n    }\n}\nconsole.log('Discriminated unions typed');" }
    ],
    medium: [
      { id: "ts_m1", title: "Type-safe form builder", desc: "Implement generic types that enforce structure constraints on form layouts.", template: "console.log('Form validation type constraints ready');" }
    ],
    hard: [
      { id: "ts_h1", title: "Conditional Return Types extractor", desc: "Write complex conditional types using infer keyword to extract resolve types of asynchronous functions.", template: "console.log('Asynchronous infer mappings ready');" }
    ],
    expert: [
      { id: "ts_x1", title: "Compile-time SQL syntax checker", desc: "Develop recursive template literal types that scan string query literals for syntax errors at compile time.", template: "console.log('Template literal checks ready');" }
    ]
  },
  java: {
    easy: [
      { id: "java_e1", title: "String Reversal", desc: "Reverse a string using the StringBuilder class.", template: "public class Main {\n    public static void main(String[] args) {\n        String original = \"Coding House\";\n        String reversed = new StringBuilder(original).reverse().toString();\n        System.out.println(reversed);\n    }\n}" }
    ],
    medium: [
      { id: "java_m1", title: "Streams GroupBy collector", desc: "Group an array list of transaction entities by status using groupingBy streams.", template: "System.out.println(\"Streams aggregation initialized\");" }
    ],
    hard: [
      { id: "java_h1", title: "Custom Executor Thread Pool", desc: "Develop a custom fixed task queue thread pool executor with locks.", template: "System.out.println(\"Custom executor pool ready\");" }
    ],
    expert: [
      { id: "java_x1", title: "Consistent Hash cache dispatcher", desc: "Build a ring-based consistent hash manager mapping cache shards.", template: "System.out.println(\"Consistent hashing ready\");" }
    ]
  },
  c: {
    easy: [
      { id: "c_e1", title: "Pointer-based string reversal", desc: "Reverse a string in-place using double pointers.", template: "#include <stdio.h>\n#include <string.h>\n\nvoid reverse(char* s) {\n    char* end = s + strlen(s) - 1;\n    while (s < end) {\n        char temp = *s;\n        *s++ = *end;\n        *end-- = temp;\n    }\n}\n\nint main() {\n    char str[] = \"Coding\";\n    reverse(str);\n    printf(\"%s\\n\", str);\n    return 0;\n}" }
    ],
    medium: [
      { id: "c_m1", title: "Dynamic vector implementation", desc: "Implement a dynamic vector structure with heap-allocation reallocation triggers.", template: "printf(\"Malloc vector initialized\\n\");" }
    ],
    hard: [
      { id: "c_h1", title: "Socket Echo Server", desc: "Write a socket network listener binding locally to echo back payloads.", template: "printf(\"raw socket listener ready\\n\");" }
    ],
    expert: [
      { id: "c_x1", title: "Linux Character Device Driver skeleton", desc: "Develop kernel hooks intercepting read/write file descriptors.", template: "printf(\"Char driver hooks registered\\n\");" }
    ]
  },
  cpp: {
    easy: [
      { id: "cpp_e1", title: "STL algorithms", desc: "Filter, sort, and transform a vector using C++ STL algorithms.", template: "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <numeric>\n\nint main() {\n    std::vector<int> v = {4, 1, 3, 2, 5};\n    std::sort(v.begin(), v.end());\n    for(int n : v) std::cout << n << \" \";\n    std::cout << \"\\n\";\n    return 0;\n}" }
    ],
    medium: [
      { id: "cpp_m1", title: "RAII custom Resource Guard", desc: "Implement rule of five constraints enforcing clean file handle close releases.", template: "std::cout << \"RAII checks passed\\n\";" }
    ],
    hard: [
      { id: "cpp_h1", title: "Metaprogramming compile-time Fibonacci", desc: "Use templates to compute fibonacci numbers at compilation.", template: "std::cout << \"Metaprogramming ready\\n\";" }
    ],
    expert: [
      { id: "cpp_x1", title: "Lock-free atomic queue", desc: "Implement compare-and-swap ring boundary pointer queues.", template: "std::cout << \"CAS queues active\\n\";" }
    ]
  },
  csharp: {
    easy: [
      { id: "cs_e1", title: "LINQ Query Filter", desc: "Use LINQ syntax to query list item details.", template: "using System;\nusing System.Linq;\nusing System.Collections.Generic;\n\npublic class Program {\n    public static void main() {\n        var nums = new List<int> { 1, 2, 3, 4, 5 };\n        var query = nums.Where(x => x > 2).ToList();\n        foreach(var n in query) Console.WriteLine(n);\n    }\n}" }
    ],
    medium: [
      { id: "cs_m1", title: "Disposable pattern release", desc: "Implement IDisposable constraints safely freeing handle instances.", template: "Console.WriteLine(\"Disposable scopes active\");" }
    ],
    hard: [
      { id: "cs_h1", title: "Source Generator mappings", desc: "Generate strong type builders matching interface classes.", template: "Console.WriteLine(\"Roslyn builders registered\");" }
    ],
    expert: [
      { id: "cs_x1", title: "Span zero-allocation parser", desc: "Read data stream frames utilizing memory references cleanly.", template: "Console.WriteLine(\"Span references active\");" }
    ]
  },
  go: {
    easy: [
      { id: "go_e1", title: "Rune array string reversal", desc: "Reverse a string handling Unicode runes safely.", template: "package main\nimport \"fmt\"\n\nfunc reverse(s string) string {\n    runes := []rune(s)\n    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {\n        runes[i], runes[j] = runes[j], runes[i]\n    }\n    return string(runes)\n}\nfunc main() {\n    fmt.Println(reverse(\"GoLang\"))\n}" }
    ],
    medium: [
      { id: "go_m1", title: "Worker pool pattern", desc: "Implement workers listening to job queue channels concurrently.", template: "fmt.Println(\"goroutines channel pool initialized\")" }
    ],
    hard: [
      { id: "go_h1", title: "Graceful server shutdown handler", desc: "Intercept SIGINT signals freeing DB connection listener handles cleanly.", template: "fmt.Println(\"graceful signal traps ready\")" }
    ],
    expert: [
      { id: "go_x1", title: "Distributed Raft cluster election", desc: "Build network election tick protocols checking heartbeat locks.", template: "fmt.Println(\"Raft logs synced\")" }
    ]
  },
  rust: {
    easy: [
      { id: "rs_e1", title: "Safe Unicode string reversal", desc: "Reverse a UTF-8 character string safely in Rust.", template: "fn reverse(s: &str) -> String {\n    s.chars().rev().collect()\n}\nfn main() {\n    println!(\"{}\", reverse(\"RustLang\"));\n}" }
    ],
    medium: [
      { id: "rs_m1", title: "Thread concurrency Arc locks", desc: "Implement cross-thread safely shared mutable lock structures.", template: "println!(\"Arc locks active\");" }
    ],
    hard: [
      { id: "rs_h1", title: "Memory allocator bounds checking", desc: "Develop pointer allocation ranges in unsafe regions.", template: "println!(\"Unsafe segments bound\");" }
    ],
    expert: [
      { id: "rs_x1", title: "Dev file system watcher compiler", desc: "Create a tokio thread checking file metadata changes.", template: "println!(\"fs events tracked\");" }
    ]
  },
  php: {
    easy: [
      { id: "php_e1", title: "String Reversal", desc: "Reverse string payload content.", template: "<?php\necho strrev(\"Coding House\");" }
    ],
    medium: [
      { id: "php_m1", title: "Generators lazily loading data", desc: "Implement memory-friendly text parsing using yield.", template: "echo \"Yield generators active\";" }
    ],
    hard: [
      { id: "php_h1", title: "HMAC webhook signature validation", desc: "Validate transaction headers checking secret keys.", template: "echo \"Webhook triggers verified\";" }
    ],
    expert: [
      { id: "php_x1", title: "Static parse analyzer custom linter", desc: "Check syntax validation against standard coding guidelines.", template: "echo \"Parsing analysis ready\";" }
    ]
  },
  ruby: {
    easy: [
      { id: "rb_e1", title: "String Reversal", desc: "Reverse content using Ruby methods.", template: "puts \"Coding House\".reverse" }
    ],
    medium: [
      { id: "rb_m1", title: "Metaprogramming dynamic definitions", desc: "Implement define_method triggers mapping classes.", template: "puts \"Dynamic class mapping active\"" }
    ],
    hard: [
      { id: "rb_h1", title: "Pundit interface authorization rules", desc: "Secure model attributes against context scopes.", template: "puts \"Policies configured\"" }
    ],
    expert: [
      { id: "rb_x1", title: "Rippper parser scan filter", desc: "Find syntax errors before compiling file content.", template: "puts \"Ast filters registered\"" }
    ]
  },
  swift: {
    easy: [
      { id: "swift_e1", title: "Optionlet guard bindings", desc: "De-reference option values securely using guard blocks.", template: "func greet(name: String?) {\n    guard let n = name else { return }\n    print(\"Hello, \\(n)\")\n}\ngreet(name: \"Swift\")" }
    ],
    medium: [
      { id: "swift_m1", title: "Combine subscription updates", desc: "Listen to async events handling value transitions.", template: "print(\"Subscriptions active\")" }
    ],
    hard: [
      { id: "swift_h1", title: "Custom Property Wrapper clamps", desc: "Limit boundary values using custom getters/setters.", template: "print(\"Wrappers clamped\")" }
    ],
    expert: [
      { id: "swift_x1", title: "Actor state concurrent memory locks", desc: "Manage mutable fields across isolated actors.", template: "print(\"Actors synchronized\")" }
    ]
  },
  kotlin: {
    easy: [
      { id: "kotlin_e1", title: "Null safety checks", desc: "Use Kotlin's safe call operator (?.) and Elvis operator (?:) to process nullable variables.", template: "fun main() {\n    val name: String? = null\n    println(name?.length ?: 0)\n}" }
    ],
    medium: [
      { id: "kotlin_m1", title: "Coroutines async delay execution", desc: "Launch concurrent tasks using coroutine builders and scope handlers.", template: "println(\"Coroutine scopes ready\")" }
    ],
    hard: [
      { id: "kotlin_h1", title: "Custom DSL scope builder", desc: "Write HTML parser builders using type-safe builder lambdas.", template: "println(\"DSL builders configured\")" }
    ],
    expert: [
      { id: "kotlin_x1", title: "Distributed state flow pipelines", desc: "Build flow pipelines matching order changes.", template: "println(\"Flow streams active\")" }
    ]
  },
  dart: {
    easy: [
      { id: "dart_e1", title: "Null safety bindings", desc: "Narrow down null bounds utilizing modern Dart types.", template: "void main() {\n    String? msg;\n    print(msg ?? 'Empty');\n}" }
    ],
    medium: [
      { id: "dart_m1", title: "Futures network parser", desc: "Fetch asynchronous json payloads updating lists.", template: "print(\"Futures completed\")" }
    ],
    hard: [
      { id: "dart_h1", title: "Isolate concurrency worker tasks", desc: "Run heavy mathematical calculations on dedicated threads.", template: "print(\"Isolates active\")" }
    ],
    expert: [
      { id: "dart_x1", title: "Codegen analyzer source builder", desc: "Generate models dynamically matching JSON attributes.", template: "print(\"Generators complete\")" }
    ]
  },
  r: {
    easy: [
      { id: "r_e1", title: "Vector filtering", desc: "Filter vector elements containing values greater than average.", template: "v <- c(10, 20, 30, 40, 50)\nprint(v[v > mean(v)])" }
    ],
    medium: [
      { id: "r_m1", title: "Data frame aggregate metrics", desc: "Apply statistical summarizing checks over grouped arrays.", template: "print(\"Aggregation ready\")" }
    ],
    hard: [
      { id: "r_h1", title: "Parallel cluster computation", desc: "Spawn workers distributing numeric calculations.", template: "print(\"Cluster workers online\")" }
    ],
    expert: [
      { id: "r_x1", title: "Custom native C bindings", desc: "Map memory pointers referencing fast native math routines.", template: "print(\"Rcpp interfaces active\")" }
    ]
  },
  matlab: {
    easy: [
      { id: "matlab_e1", title: "Matrix transpose", desc: "Perform matrix transpose operations.", template: "A = [1 2; 3 4];\ndisp(A');" }
    ],
    medium: [
      { id: "matlab_m1", title: "Vectorized filtering mask", desc: "Extract coordinates matching thresholds without loop variables.", template: "disp(\"Vector mask active\")" }
    ],
    hard: [
      { id: "matlab_h1", title: "Numerical diff equations systems", desc: "Calculate trajectory ranges using solver functions.", template: "disp(\"Solvers initialized\")" }
    ],
    expert: [
      { id: "matlab_x1", title: "SIMD parallel optimizations", desc: "Distribute calculation matrices across local GPU cores.", template: "disp(\"SIMD mapping completed\")" }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CHALLENGES_DB;
} else {
  window.CHALLENGES_DB = CHALLENGES_DB;
}
