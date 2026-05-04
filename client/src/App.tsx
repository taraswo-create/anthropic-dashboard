import { useEffect, useMemo, useState } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Compass,
  ExternalLink,
  GraduationCap,
  Layers3,
  Moon,
  Route as RouteIcon,
  ShieldCheck,
  Sun,
  Workflow,
} from "lucide-react";

type Theme = "light" | "dark";
type Track = "Все" | "Для всех" | "Разработчикам" | "Командам" | "Safety";

type Program = {
  level: number;
  title: string;
  track: Track;
  difficulty: string;
  source: string;
  sourceLabel: string;
  outcome: string;
  topics: string[];
  practice: string;
  hours: string;
  depth: number;
};

const sources = {
  learn: "https://www.anthropic.com/learn",
  aiFluency: "https://www.anthropic.com/learn/claude-for-you",
  build: "https://www.anthropic.com/learn/build-with-claude",
  prompt: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
  claudeCode: "https://docs.anthropic.com/en/docs/claude-code",
  company: "https://www.anthropic.com/company",
  claude: "https://www.anthropic.com/claude",
  education: "https://www.anthropic.com/news/introducing-claude-for-education",
};

const programs: Program[] = [
  {
    level: 1,
    title: "Claude 101: первое знакомство",
    track: "Для всех",
    difficulty: "Старт",
    source: sources.learn,
    sourceLabel: "Anthropic Academy",
    outcome: "Понять, где Claude полезен в работе, учёбе и личных проектах.",
    topics: ["Что умеет Claude", "модели Opus, Sonnet, Haiku", "диалог, файлы, анализ, web search"],
    practice: "Соберите 5 рабочих сценариев: письмо, анализ документа, план, исследование, визуальное резюме.",
    hours: "1–2 ч",
    depth: 15,
  },
  {
    level: 2,
    title: "AI Fluency: Framework & Foundations",
    track: "Для всех",
    difficulty: "База",
    source: sources.aiFluency,
    sourceLabel: "AI Fluency",
    outcome: "Научиться взаимодействовать с AI эффективно, этично и безопасно.",
    topics: ["delegation", "description", "discernment", "diligence", "description-discernment loop"],
    practice: "Возьмите одну рабочую задачу и пройдите цикл: описать, делегировать, проверить, улучшить.",
    hours: "3–5 ч",
    depth: 28,
  },
  {
    level: 3,
    title: "Prompt Engineering: управляемые результаты",
    track: "Для всех",
    difficulty: "Практика",
    source: sources.prompt,
    sourceLabel: "Prompt engineering docs",
    outcome: "Писать промпты с критериями успеха, примерами и понятной структурой.",
    topics: ["clarity", "examples", "XML structuring", "role prompting", "thinking", "prompt chaining"],
    practice: "Создайте шаблон промпта для HR/обучения: входные данные, формат ответа, критерии качества.",
    hours: "4–6 ч",
    depth: 42,
  },
  {
    level: 4,
    title: "Build with Claude: API quickstart",
    track: "Разработчикам",
    difficulty: "Разработка",
    source: sources.build,
    sourceLabel: "Build with Claude",
    outcome: "Сделать первый API-вызов и понять базовую архитектуру Claude-приложения.",
    topics: ["developer account", "API keys", "Messages API", "SDKs", "quickstart"],
    practice: "Соберите мини-прототип: форма вопроса → запрос к Claude → структурированный ответ.",
    hours: "1 день",
    depth: 55,
  },
  {
    level: 5,
    title: "API Development: файлы, batch, caching",
    track: "Разработчикам",
    difficulty: "Углубление",
    source: sources.build,
    sourceLabel: "Build with Claude",
    outcome: "Проектировать более устойчивые и экономичные AI-сценарии.",
    topics: ["Message Batches API", "prompt caching", "Files API", "PDF support", "Admin API"],
    practice: "Спроектируйте обработку пакета учебных материалов: загрузка, анализ, резюме, контроль качества.",
    hours: "2–3 дня",
    depth: 68,
  },
  {
    level: 6,
    title: "MCP и tool use: подключение контекста",
    track: "Разработчикам",
    difficulty: "Интеграции",
    source: sources.build,
    sourceLabel: "Build with Claude",
    outcome: "Понять, как Claude подключается к инструментам и внешним источникам данных.",
    topics: ["tool use", "MCP Desktop", "ready-made MCP servers", "remote MCP", "Messages API"],
    practice: "Опишите архитектуру внутреннего учебного ассистента с доступом к базе знаний и задачам.",
    hours: "2–4 дня",
    depth: 78,
  },
  {
    level: 7,
    title: "Claude Code: агентная разработка",
    track: "Разработчикам",
    difficulty: "Продвинуто",
    source: sources.claudeCode,
    sourceLabel: "Claude Code docs",
    outcome: "Делегировать Claude Code реальные задачи: анализ кодовой базы, правки, тесты, PR.",
    topics: ["terminal", "IDE", "CLAUDE.md", "workflows", "MCP", "hooks", "Agent SDK"],
    practice: "Пройдите quickstart: изучить кодовую базу, внести исправление, запустить проверку, подготовить commit.",
    hours: "1 неделя",
    depth: 88,
  },
  {
    level: 8,
    title: "Evals, safety и внедрение в организации",
    track: "Командам",
    difficulty: "Эксперт",
    source: sources.build,
    sourceLabel: "Build with Claude",
    outcome: "Запускать Claude не как эксперимент, а как управляемую практику с метриками и рисками.",
    topics: ["success criteria", "automated evaluations", "Eval Tool", "enterprise deployment", "AI safety"],
    practice: "Соберите pilot charter: цель, риски, критерии качества, eval-набор, правила использования.",
    hours: "2–3 недели",
    depth: 96,
  },
];

const depthData = programs.map((program) => ({
  name: `L${program.level}`,
  depth: program.depth,
  title: program.title,
}));

const trackData = [
  { name: "Для всех", count: programs.filter((program) => program.track === "Для всех").length },
  { name: "Dev", count: programs.filter((program) => program.track === "Разработчикам").length },
  { name: "Teams", count: programs.filter((program) => program.track === "Командам").length },
  { name: "Safety", count: 1 },
];

function Logo() {
  return (
    <svg aria-label="Learning guide logo" className="logo-mark" viewBox="0 0 40 40" fill="none" role="img">
      <rect x="6" y="6" width="28" height="28" rx="7" stroke="currentColor" strokeWidth="2.4" />
      <path d="M13 25.5L20 12L27 25.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M15.5 22H24.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function SourceLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="source-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <ExternalLink size={14} aria-hidden="true" />
    </a>
  );
}

function ThemeToggle({ theme, setTheme }: { theme: Theme; setTheme: (theme: Theme) => void }) {
  return (
    <button
      className="theme-toggle"
      data-testid="button-theme-toggle"
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function KpiCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="kpi-card" data-testid={`card-kpi-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="kpi-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
  );
}

function ProgramCard({ program, active, onSelect }: { program: Program; active: boolean; onSelect: () => void }) {
  return (
    <button
      className={active ? "program-card active" : "program-card"}
      onClick={onSelect}
      data-testid={`button-program-${program.level}`}
    >
      <span className="program-index">L{program.level}</span>
      <span className="program-copy">
        <strong>{program.title}</strong>
        <small>{program.difficulty} · {program.hours}</small>
      </span>
      <span className="program-track">{program.track}</span>
    </button>
  );
}

function Home() {
  const [selectedTrack, setSelectedTrack] = useState<Track>("Все");
  const [activeLevel, setActiveLevel] = useState(1);
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const filteredPrograms = useMemo(
    () => (selectedTrack === "Все" ? programs : programs.filter((program) => program.track === selectedTrack)),
    [selectedTrack],
  );

  useEffect(() => {
    if (!filteredPrograms.some((program) => program.level === activeLevel)) {
      setActiveLevel(filteredPrograms[0]?.level ?? 1);
    }
  }, [activeLevel, filteredPrograms]);

  const activeProgram = programs.find((program) => program.level === activeLevel) ?? programs[0];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <aside className="rail" aria-label="Навигация учебного гайда">
        <div className="brand">
          <Logo />
          <div>
            <span>Anthropic Learn</span>
            <small>от простого к сложному</small>
          </div>
        </div>
        <nav className="rail-nav" aria-label="Разделы">
          <a href="#overview">Обзор</a>
          <a href="#path">Маршрут</a>
          <a href="#practice">Практика</a>
          <a href="#sources">Источники</a>
        </nav>
        <div className="rail-note">
          <GraduationCap size={18} aria-hidden="true" />
          <span>Основано на Anthropic Academy, docs и страницах Claude</span>
        </div>
      </aside>

      <div className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Обновлено: 4 мая 2026</p>
            <h1>Гайд по учебным программам Anthropic</h1>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </header>

        <main id="main-content" className="dashboard-main">
          <section id="overview" className="hero-grid" aria-labelledby="overview-title">
            <article className="hero-card">
              <div className="hero-copy">
                <p className="eyebrow">Learning roadmap</p>
                <h2 id="overview-title">Последовательность обучения: от Claude 101 до evals, MCP и Claude Code.</h2>
                <p>
                  Маршрут собран по официальным материалам Anthropic: Anthropic Academy, AI Fluency, Build with Claude,
                  prompt engineering documentation и Claude Code documentation.
                </p>
              </div>
              <div className="hero-actions">
                <SourceLink href={sources.learn}>Anthropic Academy</SourceLink>
                <SourceLink href={sources.build}>Build with Claude</SourceLink>
                <SourceLink href={sources.aiFluency}>AI Fluency</SourceLink>
              </div>
            </article>

            <div className="kpi-grid" aria-label="Ключевые показатели гайда">
              <KpiCard icon={<RouteIcon size={20} />} label="Уровни" value="8" detail="от старта до экспертного внедрения" />
              <KpiCard icon={<BookOpenCheck size={20} />} label="Курсы" value="Academy" detail="Claude 101, AI Fluency, API, MCP, Code" />
              <KpiCard icon={<Workflow size={20} />} label="Практика" value="8 заданий" detail="по одному результату на уровень" />
              <KpiCard icon={<ShieldCheck size={20} />} label="Фокус" value="Safe AI" detail="эффективно, этично, безопасно" />
            </div>
          </section>

          <section id="path" className="section-grid" aria-labelledby="path-title">
            <div className="section-heading">
              <p className="eyebrow">Curriculum path</p>
              <h2 id="path-title">Выберите учебный трек</h2>
              <p>
                Фильтр помогает собрать маршрут под аудиторию: универсальный старт, технический трек для разработчиков
                или внедрение для команд.
              </p>
            </div>

            <div className="toolbar" role="group" aria-label="Фильтр учебных треков">
              {(["Все", "Для всех", "Разработчикам", "Командам"] as Track[]).map((track) => (
                <button
                  key={track}
                  className={selectedTrack === track ? "chip active" : "chip"}
                  onClick={() => setSelectedTrack(track)}
                  data-testid={`button-filter-${track.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {track}
                </button>
              ))}
            </div>

            <div className="model-layout">
              <div className="model-list" aria-label="Уровни программы">
                {filteredPrograms.map((program) => (
                  <ProgramCard
                    key={program.level}
                    program={program}
                    active={activeProgram.level === program.level}
                    onSelect={() => setActiveLevel(program.level)}
                  />
                ))}
              </div>

              <article className="model-detail" data-testid="card-active-program">
                <div className="model-detail-header">
                  <div>
                    <p className="eyebrow">Level {activeProgram.level}</p>
                    <h3>{activeProgram.title}</h3>
                  </div>
                  <a href={activeProgram.source} target="_blank" rel="noopener noreferrer" aria-label="Открыть источник">
                    <ArrowUpRight size={20} />
                  </a>
                </div>
                <p className="detail-lede">{activeProgram.outcome}</p>
                <ul>
                  {activeProgram.topics.map((topic) => (
                    <li key={topic}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
                <div className="practice-box">
                  <strong>Практический результат</strong>
                  <p>{activeProgram.practice}</p>
                  <SourceLink href={activeProgram.source}>{activeProgram.sourceLabel}</SourceLink>
                </div>
              </article>
            </div>
          </section>

          <section className="chart-grid" aria-labelledby="progress-title">
            <article className="chart-card wide">
              <div className="card-title">
                <div>
                  <p className="eyebrow">Learning curve</p>
                  <h2 id="progress-title">Рост сложности по уровням</h2>
                </div>
                <Layers3 size={20} aria-hidden="true" />
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={depthData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="depthGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.42} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="depth"
                      name="Сложность"
                      stroke="hsl(var(--primary))"
                      fill="url(#depthGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="chart-note">
                Индекс сложности составлен редакционно по структуре материалов Anthropic: от вводных курсов к API,
                интеграциям, агентной разработке и evals.
              </p>
            </article>

            <article className="chart-card">
              <div className="card-title">
                <div>
                  <p className="eyebrow">Tracks</p>
                  <h2>Распределение гайда</h2>
                </div>
                <Compass size={20} aria-hidden="true" />
              </div>
              <div className="chart-wrap compact">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trackData} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide domain={[0, 5]} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={70} />
                    <Tooltip />
                    <Bar dataKey="count" name="Уровней" radius={[0, 8, 8, 0]}>
                      {trackData.map((entry, index) => (
                        <Cell key={entry.name} fill={`hsl(var(--chart-${(index % 4) + 1}))`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section id="practice" className="section-grid" aria-labelledby="practice-title">
            <div className="section-heading">
              <p className="eyebrow">How to use</p>
              <h2 id="practice-title">Как проходить маршрут</h2>
              <p>Для корпоративного обучения удобно проходить уровни спринтами и завершать каждый измеримым артефактом.</p>
            </div>

            <div className="safety-layout">
              <article className="mini-card">
                <GraduationCap size={20} aria-hidden="true" />
                <h3>Для сотрудников без кода</h3>
                <p>Берите уровни 1–3: Claude 101, AI Fluency и prompt engineering. Итог: библиотека рабочих промптов и правила проверки результатов.</p>
              </article>
              <article className="mini-card">
                <Code2 size={20} aria-hidden="true" />
                <h3>Для разработчиков</h3>
                <p>После уровней 1–3 переходите к API, Files, batch, prompt caching, MCP и Claude Code. Итог: прототип или автоматизация.</p>
              </article>
              <article className="mini-card">
                <BrainCircuit size={20} aria-hidden="true" />
                <h3>Для руководителей и L&D</h3>
                <p>Добавьте уровень 8: критерии успеха, evals, риски, политика использования и pilot charter для команды.</p>
              </article>
            </div>
          </section>

          <section id="sources" className="sources-card" aria-labelledby="sources-title">
            <div>
              <p className="eyebrow">Sources</p>
              <h2 id="sources-title">Официальные страницы Anthropic</h2>
              <p>Гайд не копирует закрытые курсы, а структурирует открытые страницы Anthropic и документации Claude в учебный маршрут.</p>
            </div>
            <div className="source-grid">
              <SourceLink href={sources.learn}>Anthropic Academy</SourceLink>
              <SourceLink href={sources.aiFluency}>AI Fluency</SourceLink>
              <SourceLink href={sources.build}>Build with Claude</SourceLink>
              <SourceLink href={sources.prompt}>Prompt engineering</SourceLink>
              <SourceLink href={sources.claudeCode}>Claude Code docs</SourceLink>
              <SourceLink href={sources.claude}>Claude product page</SourceLink>
              <SourceLink href={sources.company}>Company</SourceLink>
              <SourceLink href={sources.education}>Claude for Education</SourceLink>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
