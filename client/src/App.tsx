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
  CalendarDays,
  CheckCircle2,
  Code2,
  Compass,
  ExternalLink,
  GraduationCap,
  Layers3,
  Moon,
  RefreshCcw,
  Route as RouteIcon,
  ShieldCheck,
  Sun,
  Users,
  Workflow,
} from "lucide-react";

type Theme = "light" | "dark";
type Track = "Все" | "Для всех" | "Разработчикам" | "Командам";

type Program = {
  level: number;
  week: string;
  title: string;
  track: Exclude<Track, "Все">;
  difficulty: string;
  source: string;
  sourceLabel: string;
  outcome: string;
  topics: string[];
  practice: string;
  teamFormat: string;
  hours: string;
  depth: number;
};

const STORAGE_KEY = "anthropic-corporate-learning-progress-v1";

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
    week: "Неделя 1",
    title: "Claude 101: рабочие сценарии",
    track: "Для всех",
    difficulty: "Старт",
    source: sources.learn,
    sourceLabel: "Anthropic Academy",
    outcome: "Сотрудники понимают, где Claude полезен в работе, обучении и личной продуктивности.",
    topics: ["возможности Claude", "модели Opus, Sonnet, Haiku", "диалог, файлы, анализ, web search"],
    practice: "Собрать 5 сценариев для своей роли: письмо, анализ документа, план, исследование, визуальное резюме.",
    teamFormat: "60 минут воркшоп + 30 минут самостоятельной практики.",
    hours: "1,5 ч",
    depth: 14,
  },
  {
    level: 2,
    week: "Неделя 1–2",
    title: "AI Fluency: безопасная делегация",
    track: "Для всех",
    difficulty: "База",
    source: sources.aiFluency,
    sourceLabel: "AI Fluency",
    outcome: "Участники используют AI Fluency Framework: delegation, description, discernment и diligence.",
    topics: ["delegation", "description", "discernment", "diligence", "description-discernment loop"],
    practice: "Выбрать одну рабочую задачу и пройти цикл: описать, делегировать, проверить, улучшить.",
    teamFormat: "Домашнее задание с разбором 2–3 примеров на встрече команды.",
    hours: "3–5 ч",
    depth: 28,
  },
  {
    level: 3,
    week: "Неделя 2",
    title: "Prompt Engineering: управляемые результаты",
    track: "Для всех",
    difficulty: "Практика",
    source: sources.prompt,
    sourceLabel: "Prompt engineering docs",
    outcome: "Команда пишет промпты с критериями успеха, примерами, ролями и структурой ответа.",
    topics: ["clarity", "examples", "XML structuring", "role prompting", "thinking", "prompt chaining"],
    practice: "Создать шаблон промпта для обучения или HR: входные данные, формат ответа, критерии качества.",
    teamFormat: "Парная работа: один участник пишет промпт, второй проверяет результат по критериям.",
    hours: "4–6 ч",
    depth: 42,
  },
  {
    level: 4,
    week: "Неделя 3",
    title: "Claude for Work: командные процессы",
    track: "Командам",
    difficulty: "Внедрение",
    source: sources.learn,
    sourceLabel: "Anthropic Academy",
    outcome: "Появляется карта процессов, где Claude помогает команде без нарушения правил безопасности.",
    topics: ["use cases", "team productivity", "knowledge work", "review workflow", "responsible use"],
    practice: "Описать 3 процесса команды: цель, входные данные, ограничения, контроль качества, владелец.",
    teamFormat: "90 минут фасилитированной сессии с руководителем направления.",
    hours: "1 день",
    depth: 54,
  },
  {
    level: 5,
    week: "Неделя 3–4",
    title: "Build with Claude: API quickstart",
    track: "Разработчикам",
    difficulty: "Разработка",
    source: sources.build,
    sourceLabel: "Build with Claude",
    outcome: "Техническая группа понимает Messages API, SDKs и первый API-вызов.",
    topics: ["developer account", "API keys", "Messages API", "SDKs", "quickstart"],
    practice: "Собрать мини-прототип: форма вопроса, запрос к Claude, структурированный ответ.",
    teamFormat: "Технический lab для разработчиков или no-code обзор архитектуры для владельцев продукта.",
    hours: "1–2 дня",
    depth: 62,
  },
  {
    level: 6,
    week: "Неделя 4",
    title: "API Development: файлы, batch, caching",
    track: "Разработчикам",
    difficulty: "Углубление",
    source: sources.build,
    sourceLabel: "Build with Claude",
    outcome: "Команда проектирует устойчивые и экономичные AI-сценарии для документов и пакетной обработки.",
    topics: ["Message Batches API", "prompt caching", "Files API", "PDF support", "Admin API"],
    practice: "Спроектировать обработку пакета учебных материалов: загрузка, анализ, резюме, контроль качества.",
    teamFormat: "Архитектурный разбор с чеклистом рисков, стоимости и качества.",
    hours: "2–3 дня",
    depth: 72,
  },
  {
    level: 7,
    week: "Неделя 5",
    title: "MCP, tool use и Claude Code",
    track: "Разработчикам",
    difficulty: "Продвинуто",
    source: sources.claudeCode,
    sourceLabel: "Claude Code docs",
    outcome: "Разработчики понимают, как подключать инструменты, работать с кодовой базой и автоматизировать задачи.",
    topics: ["tool use", "MCP", "Claude Code", "CLAUDE.md", "hooks", "Agent SDK"],
    practice: "Пройти quickstart: изучить кодовую базу, внести исправление, запустить проверку, подготовить commit.",
    teamFormat: "Практикум в песочнице: одна небольшая задача на участника или пару.",
    hours: "1 неделя",
    depth: 86,
  },
  {
    level: 8,
    week: "Неделя 6",
    title: "Evals, safety и pilot charter",
    track: "Командам",
    difficulty: "Эксперт",
    source: sources.build,
    sourceLabel: "Build with Claude",
    outcome: "Claude запускается не как эксперимент, а как управляемый пилот с метриками, рисками и правилами.",
    topics: ["success criteria", "automated evaluations", "Eval Tool", "enterprise deployment", "AI safety"],
    practice: "Собрать pilot charter: цель, риски, eval-набор, роли, правила использования, критерии запуска.",
    teamFormat: "Итоговая защита пилота перед владельцем процесса и L&D/IT/безопасностью.",
    hours: "1–2 недели",
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
];

const weekPlan = [
  ["Неделя 1", "Claude 101 + AI Fluency", "общая рамка безопасной работы"],
  ["Неделя 2", "Prompt Engineering", "шаблоны промптов и критерии качества"],
  ["Неделя 3", "Командные процессы + API обзор", "карта применений и первый прототип"],
  ["Неделя 4", "Files, batch, caching", "архитектура обработки материалов"],
  ["Неделя 5", "MCP + Claude Code", "интеграции и агентная разработка"],
  ["Неделя 6", "Evals + pilot charter", "готовый план пилота"],
];

function readSavedProgress() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "number") : [];
  } catch {
    return [];
  }
}

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

function ProgramCard({
  program,
  active,
  completed,
  onSelect,
}: {
  program: Program;
  active: boolean;
  completed: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={active ? "program-card active" : "program-card"}
      onClick={onSelect}
      data-testid={`button-program-${program.level}`}
      aria-pressed={active}
    >
      <span className={completed ? "program-index complete" : "program-index"}>
        {completed ? "✓" : `L${program.level}`}
      </span>
      <span className="program-copy">
        <strong>{program.title}</strong>
        <small>
          {program.week} · {program.difficulty} · {program.hours}
        </small>
      </span>
      <span className="program-track">{program.track}</span>
    </button>
  );
}

function Home() {
  const [selectedTrack, setSelectedTrack] = useState<Track>("Все");
  const [activeLevel, setActiveLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>(readSavedProgress);
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedLevels));
    } catch {
      // If browser storage is unavailable, progress remains in the current tab only.
    }
  }, [completedLevels]);

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
  const progressPercent = Math.round((completedLevels.length / programs.length) * 100);
  const activeCompleted = completedLevels.includes(activeProgram.level);

  function toggleLevel(level: number) {
    setCompletedLevels((current) =>
      current.includes(level) ? current.filter((item) => item !== level) : [...current, level].sort((a, b) => a - b),
    );
  }

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="app-shell">
      <button className="skip-link" onClick={() => scrollToSection("main-content")}>
        Перейти к содержанию
      </button>
      <aside className="rail" aria-label="Навигация учебной программы">
        <div className="brand">
          <Logo />
          <div>
            <span>Anthropic Learn</span>
            <small>корпоративный маршрут</small>
          </div>
        </div>
        <nav className="rail-nav" aria-label="Разделы">
          <button type="button" onClick={() => scrollToSection("overview")} data-testid="button-nav-overview">
            Обзор
          </button>
          <button type="button" onClick={() => scrollToSection("path")} data-testid="button-nav-path">
            Маршрут
          </button>
          <button type="button" onClick={() => scrollToSection("calendar")} data-testid="button-nav-calendar">
            План
          </button>
          <button type="button" onClick={() => scrollToSection("sources")} data-testid="button-nav-sources">
            Источники
          </button>
        </nav>
        <div className="rail-note">
          <GraduationCap size={18} aria-hidden="true" />
          <span>Прогресс хранится только в браузере посетителя, без логина и общей базы.</span>
        </div>
      </aside>

      <div className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Обновлено: 4 мая 2026</p>
            <h1>Корпоративная программа Anthropic на 4–6 недель</h1>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </header>

        <main id="main-content" className="dashboard-main">
          <section id="overview" className="hero-grid" aria-labelledby="overview-title">
            <article className="hero-card">
              <div className="hero-copy">
                <p className="eyebrow">Learning roadmap</p>
                <h2 id="overview-title">От базовой AI-грамотности до пилота Claude с evals и правилами внедрения.</h2>
                <p>
                  Программа собрана по официальным материалам Anthropic: Anthropic Academy, AI Fluency, Build with
                  Claude, prompt engineering documentation и Claude Code documentation.
                </p>
              </div>
              <div className="hero-actions">
                <SourceLink href={sources.learn}>Anthropic Academy</SourceLink>
                <SourceLink href={sources.build}>Build with Claude</SourceLink>
                <SourceLink href={sources.aiFluency}>AI Fluency</SourceLink>
              </div>
            </article>

            <div className="kpi-grid" aria-label="Ключевые показатели программы">
              <KpiCard icon={<CalendarDays size={20} />} label="Срок" value="4–6 недель" detail="можно сжать или расширить" />
              <KpiCard icon={<RouteIcon size={20} />} label="Уровни" value="8" detail="от старта до pilot charter" />
              <KpiCard icon={<Users size={20} />} label="Доступ" value="без логина" detail="каждый посетитель видит свой прогресс" />
              <KpiCard icon={<ShieldCheck size={20} />} label="Фокус" value="Safe AI" detail="эффективно, этично, безопасно" />
            </div>
          </section>

          <section className="progress-card" aria-labelledby="progress-title">
            <div>
              <p className="eyebrow">Personal progress</p>
              <h2 id="progress-title">Ваш прогресс: {progressPercent}%</h2>
              <p>
                Отмечайте уровни по мере прохождения. Данные сохраняются в этом браузере и не передаются другим
                посетителям.
              </p>
            </div>
            <div className="progress-controls">
              <div className="progress-bar" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              <button className="reset-button" data-testid="button-reset-progress" onClick={() => setCompletedLevels([])}>
                <RefreshCcw size={16} aria-hidden="true" />
                Сбросить мой прогресс
              </button>
            </div>
          </section>

          <section id="path" className="section-grid" aria-labelledby="path-title">
            <div className="section-heading">
              <p className="eyebrow">Curriculum path</p>
              <h2 id="path-title">Маршрут обучения</h2>
              <p>
                Фильтр помогает собрать программу под аудиторию: общий старт, технический трек для разработчиков или
                управленческий трек для внедрения.
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
                    completed={completedLevels.includes(program.level)}
                    onSelect={() => setActiveLevel(program.level)}
                  />
                ))}
              </div>

              <article className="model-detail" data-testid="card-active-program">
                <div className="model-detail-header">
                  <div>
                    <p className="eyebrow">Level {activeProgram.level} · {activeProgram.week}</p>
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
                  <strong>Формат для команды</strong>
                  <p>{activeProgram.teamFormat}</p>
                  <div className="practice-actions">
                    <button
                      className={activeCompleted ? "complete-button done" : "complete-button"}
                      data-testid="button-toggle-complete"
                      onClick={() => toggleLevel(activeProgram.level)}
                    >
                      <CheckCircle2 size={16} aria-hidden="true" />
                      {activeCompleted ? "Уровень пройден" : "Отметить уровень"}
                    </button>
                    <SourceLink href={activeProgram.source}>{activeProgram.sourceLabel}</SourceLink>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="chart-grid" aria-labelledby="curve-title">
            <article className="chart-card wide">
              <div className="card-title">
                <div>
                  <p className="eyebrow">Learning curve</p>
                  <h2 id="curve-title">Рост сложности по уровням</h2>
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
                  <h2>Распределение уровней</h2>
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

          <section id="calendar" className="section-grid" aria-labelledby="calendar-title">
            <div className="section-heading">
              <p className="eyebrow">4–6 week rollout</p>
              <h2 id="calendar-title">Календарный план</h2>
              <p>Программу можно провести за 6 недель или сжать до 4 недель, объединив недели 1–2 и 5–6.</p>
            </div>

            <div className="safety-layout">
              {weekPlan.map(([week, title, result]) => (
                <article className="mini-card" key={week}>
                  <CalendarDays size={20} aria-hidden="true" />
                  <h3>{week}</h3>
                  <p><strong>{title}</strong></p>
                  <p>{result}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="sources" className="sources-card" aria-labelledby="sources-title">
            <div>
              <p className="eyebrow">Sources</p>
              <h2 id="sources-title">Официальные страницы Anthropic</h2>
              <p>
                Гайд структурирует открытые страницы Anthropic и документацию Claude. Внешние ссылки открываются в новой
                вкладке, без логина к этим материалам.
              </p>
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
