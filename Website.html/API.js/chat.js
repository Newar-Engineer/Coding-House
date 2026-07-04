export const config = {
  runtime: 'nodejs'
};

const LANGUAGE_AGENTS = {
  c: {
    name: 'C',
    focus: 'pointers, memory layout, compilation, data structures, and low-level systems programming'
  },
  cpp: {
    name: 'C++',
    focus: 'modern C++, STL, classes, templates, memory safety, performance, and systems design'
  },
  csharp: {
    name: 'C#',
    focus: '.NET, OOP, LINQ, async/await, APIs, desktop apps, and backend services'
  },
  dart: {
    name: 'Dart',
    focus: 'Dart syntax, null safety, async code, Flutter-ready patterns, and app architecture'
  },
  go: {
    name: 'Go',
    focus: 'goroutines, channels, interfaces, modules, HTTP services, CLIs, and backend systems'
  },
  java: {
    name: 'Java',
    focus: 'OOP, collections, streams, exceptions, JVM tooling, Spring-ready backend patterns, and testing'
  },
  javascript: {
    name: 'JavaScript',
    focus: 'DOM work, async/await, promises, browser APIs, Node.js basics, and frontend logic'
  },
  kotlin: {
    name: 'Kotlin',
    focus: 'null safety, coroutines, Android-ready patterns, JVM interop, and clean application structure'
  },
  matlab: {
    name: 'MATLAB',
    focus: 'matrix operations, plotting, scripts, functions, simulations, and numerical workflows'
  },
  php: {
    name: 'PHP',
    focus: 'PHP syntax, forms, sessions, PDO, Laravel-ready patterns, and server-rendered apps'
  },
  python: {
    name: 'Python',
    focus: 'Python syntax, OOP, scripts, automation, data work, virtual environments, and debugging'
  },
  r: {
    name: 'R',
    focus: 'data frames, tidyverse-style analysis, statistics, plotting, scripts, and reproducible reports'
  },
  ruby: {
    name: 'Ruby',
    focus: 'Ruby syntax, blocks, enumerable patterns, OOP, gems, and Rails-ready thinking'
  },
  rust: {
    name: 'Rust',
    focus: 'ownership, borrowing, lifetimes, traits, cargo, error handling, and safe systems programming'
  },
  swift: {
    name: 'Swift',
    focus: 'Swift syntax, optionals, protocols, async code, SwiftUI-ready structure, and app logic'
  },
  typescript: {
    name: 'TypeScript',
    focus: 'types, interfaces, generics, narrowing, React-ready patterns, Node.js typing, and maintainable JavaScript'
  }
};

const LANGUAGE_ALIASES = {
  'c++': 'cpp',
  'cpp': 'cpp',
  'c#': 'csharp',
  'c-sharp': 'csharp',
  'cs': 'csharp',
  'js': 'javascript',
  'node': 'javascript',
  'nodejs': 'javascript',
  'ts': 'typescript',
  'r-lang': 'r'
};

function normalizeLanguage(language) {
  const raw = String(language || 'javascript').trim().toLowerCase();
  return LANGUAGE_ALIASES[raw] || raw;
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-12)
    .map((entry) => {
      if (!entry || typeof entry.content !== 'string') return null;
      const role = entry.role === 'assistant' ? 'assistant' : 'user';
      const content = entry.content.trim().slice(0, 4000);
      return content ? { role, content } : null;
    })
    .filter(Boolean);
}

function buildSystemPrompt(agent) {
  return `You are the Coding House ${agent.name} Agent.

You are dedicated to one programming language only: ${agent.name}.
Your specialty is ${agent.focus}.

Rules:
1. Answer only questions about ${agent.name}, its ecosystem, syntax, debugging, tooling, projects, and algorithms implemented in ${agent.name}.
2. If the learner asks about another language, says to use another language, or requests a multi-language answer, briefly say you are the ${agent.name} Agent and offer the ${agent.name} version instead.
3. Any code you write must be ${agent.name}. Do not provide code in other programming languages.
4. If the learner pastes code from another language, explain that it is outside this agent's scope and, when useful, translate the idea into ${agent.name}.
5. Keep answers concise, beginner-safe, practical, and friendly. Use step-by-step explanations when debugging.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [], language } = req.body || {};
  const langKey = normalizeLanguage(language);
  const agent = LANGUAGE_AGENTS[langKey];

  if (!agent) {
    return res.status(400).json({
      error: 'Unsupported language agent',
      allowedLanguages: Object.keys(LANGUAGE_AGENTS)
    });
  }

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 700,
        system: buildSystemPrompt(agent),
        messages: [
          ...sanitizeHistory(history),
          { role: 'user', content: message.trim().slice(0, 6000) }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AI Agent] Anthropic API error:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'AI provider request failed'
      });
    }

    const reply = (data.content || [])
      .filter((part) => part.type === 'text' && part.text)
      .map((part) => part.text)
      .join('\n\n')
      .trim();

    res.status(200).json({
      reply: reply || 'I could not generate a response. Please try again.',
      language: langKey,
      agent: agent.name
    });
  } catch (error) {
    console.error('[AI Agent] Chat error:', error);
    res.status(500).json({ error: 'Failed to reach the AI agent' });
  }
}
