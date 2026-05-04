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
  Activity,
  ArrowUpRight,
  BookOpenCheck,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Code2,
  ExternalLink,
  Moon,
  ShieldCheck,
  Smartphone,
  Sun,
} from "lucide-react";

type Model = {
  name: string;
  family: string;
  tier: string;
  safety: string;
  score: number;
  facts: string[];
  link: string;
};

type Theme = "light" | "dark";

const sourceLinks = {
  company: "https://www.anthropic.com/company",
  claude: "https://www.anthropic.com/claude",
  transparency: "https://www.anthropic.com/transparency",
  careers: "https://www.anthropic.com/careers",
  rsp: "https://www.anthropic.com/responsible-scaling-policy",
};

const models: Model[] = [
  {
    name: "Claude Opus 4.7",
    family: "Opus",
    tier: "Самые амбициозные задачи",
    safety: "CB-1 / усиленные safeguards",
    score: 4.7,
    facts: [
      "Самая мощная модель для сложных проектов.",
      "Для документов, слайдов, таблиц, сложного анализа и deep research.",
      "В Transparency Hub описана как модель с отдельной оценкой угроз CB-1 и autonomy TM1.",
    ],
    link: sourceLinks.transparency,
  },
  {
    name: "Claude Sonnet 4.6",
    family: "Sonnet",
    tier: "Ежедневная работа",
    safety: "ASL-3",
    score: 4.6,
    facts: [
      "Позиционируется как мощная и универсальная модель.",
      "Подходит для письма, быстрого анализа и автоматизации задач.",
      "Anthropic указывает выпуск под стандартом ASL-3.",
    ],
    link: sourceLinks.transparency,
  },
  {
    name: "Claude Haiku 4.5",
    family: "Haiku",
    tier: "Скорость и лёгкие задачи",
    safety: "ASL-2",
    score: 4.5,
    facts: [
      "Самая быстрая модель линейки Claude.",
      "Сфокусирована на быстрых ответах, everyday tasks и web search.",
      "Transparency Hub указывает выпуск под ASL-2 и rule-out ASL-3.",
    ],
    link: sourceLinks.claude,
  },
  {
    name: "Claude Opus 4.5",
    family: "Opus",
    tier: "Агентные и coding-задачи",
    safety: "ASL-3",
    score: 4.5,
    facts: [
      "Описан как hybrid reasoning model.",
      "Отмечены сильные результаты в coding и агентных задачах.",
      "Anthropic указывает, что модель ниже ASL-4 thresholds.",
    ],
    link: sourceLinks.transparency,
  },
];

const capabilityData = [
  { label: "Docs", opus: 92, sonnet: 77, haiku: 54 },
  { label: "Code", opus: 88, sonnet: 82, haiku: 48 },
  { label: "Analysis", opus: 94, sonnet: 79, haiku: 58 },
  { label: "Speed", opus: 48, sonnet: 72, haiku: 95 },
];

const safetyData = models.map((model) => ({
  name: model.family,
  value: model.score,
  safety: model.safety,
}));

const timeline = [
  { date: "2024", value: 37, label: "Claude 3.7 Sonnet" },
  { date: "2025", value: 45, label: "Opus / Sonnet 4.5" },
  { date: "2026", value: 47, label: "Opus 4.7" },
];

function Logo() {
  return (
    <svg
      aria-label="Anthropic dashboard logo"
      className="logo-mark"
      viewBox="0 0 40 40"
      fill="none"
      role="img"
    >
      <rect x="6" y="6" width="28" height="28" rx="7" stroke="currentColor" strokeWidth="2.4" />
      <path d="M13 27L20 12L27 27" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16.5 21.5H23.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
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

function Home() {
  const [selectedFamily, setSelectedFamily] = useState("All");
  const [activeModel, setActiveModel] = useState(models[0].name);
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const filteredModels = useMemo(
    () => (selectedFamily === "All" ? models : models.filter((model) => model.family === selectedFamily)),
    [selectedFamily],
  );

  const currentModel = models.find((model) => model.name === activeModel) ?? models[0];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <aside className="rail" aria-label="Навигация дэшборда">
        <div className="brand">
          <Logo />
          <div>
            <span>Anthropic</span>
            <small>Public dashboard</small>
          </div>
        </div>
        <nav className="rail-nav" aria-label="Разделы">
          <a href="#overview">Обзор</a>
          <a href="#models">Модели</a>
          <a href="#safety">Safety</a>
          <a href="#sources">Источники</a>
        </nav>
        <div className="rail-note">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>Данные: публичные страницы Anthropic</span>
        </div>
      </aside>

      <div className="content-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Обновлено: 4 мая 2026</p>
            <h1>Интерактивный обзор Anthropic и Claude</h1>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </header>

        <main id="main-content" className="dashboard-main">
          <section id="overview" className="hero-grid" aria-labelledby="overview-title">
            <article className="hero-card">
              <div className="hero-copy">
                <p className="eyebrow">AI safety & research company</p>
                <h2 id="overview-title">Anthropic строит Claude вокруг надёжности, интерпретируемости и управляемости.</h2>
                <p>
                  Дэшборд сводит публичные факты с сайта Anthropic: миссия, линейка Claude, safety-подход и полезные
                  ссылки для дальнейшего изучения.
                </p>
              </div>
              <div className="hero-actions">
                <SourceLink href={sourceLinks.company}>О компании</SourceLink>
                <SourceLink href={sourceLinks.claude}>Claude</SourceLink>
              </div>
            </article>

            <div className="kpi-grid" aria-label="Ключевые показатели">
              <KpiCard icon={<Building2 size={20} />} label="Статус" value="PBC" detail="Public Benefit Corporation" />
              <KpiCard icon={<BrainCircuit size={20} />} label="Фокус" value="Reliable" detail="interpretable, steerable AI" />
              <KpiCard icon={<Activity size={20} />} label="Transparency" value="20.02.2026" detail="дата Model Report" />
              <KpiCard icon={<Smartphone size={20} />} label="Доступ" value="Web + mobile" detail="Claude app и desktop" />
            </div>
          </section>

          <section id="models" className="section-grid" aria-labelledby="models-title">
            <div className="section-heading">
              <p className="eyebrow">Model explorer</p>
              <h2 id="models-title">Линейка Claude</h2>
              <p>Фильтруйте модели по семейству и открывайте краткую карточку с официальной формулировкой назначения.</p>
            </div>

            <div className="toolbar" role="group" aria-label="Фильтр моделей">
              {["All", "Opus", "Sonnet", "Haiku"].map((family) => (
                <button
                  key={family}
                  className={selectedFamily === family ? "chip active" : "chip"}
                  onClick={() => setSelectedFamily(family)}
                  data-testid={`button-filter-${family.toLowerCase()}`}
                >
                  {family === "All" ? "Все" : family}
                </button>
              ))}
            </div>

            <div className="model-layout">
              <div className="model-list" aria-label="Список моделей">
                {filteredModels.map((model) => (
                  <button
                    key={model.name}
                    className={activeModel === model.name ? "model-row active" : "model-row"}
                    onClick={() => setActiveModel(model.name)}
                    data-testid={`button-model-${model.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <span>
                      <strong>{model.name}</strong>
                      <small>{model.tier}</small>
                    </span>
                    <em>{model.safety}</em>
                  </button>
                ))}
              </div>

              <article className="model-detail" data-testid="card-active-model">
                <div className="model-detail-header">
                  <div>
                    <p className="eyebrow">{currentModel.family}</p>
                    <h3>{currentModel.name}</h3>
                  </div>
                  <a href={currentModel.link} target="_blank" rel="noopener noreferrer" aria-label="Открыть источник">
                    <ArrowUpRight size={20} />
                  </a>
                </div>
                <ul>
                  {currentModel.facts.map((fact) => (
                    <li key={fact}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>

          <section className="chart-grid" aria-labelledby="capabilities-title">
            <article className="chart-card wide">
              <div className="card-title">
                <div>
                  <p className="eyebrow">Capability map</p>
                  <h2 id="capabilities-title">Позиционирование моделей</h2>
                </div>
                <Code2 size={20} aria-hidden="true" />
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={capabilityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip cursor={{ fill: "rgba(2, 105, 111, 0.08)" }} />
                    <Bar dataKey="opus" name="Opus" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="sonnet" name="Sonnet" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="haiku" name="Haiku" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="chart-note">
                Индекс является визуальной нормализацией официального позиционирования моделей, а не публичным benchmark.
              </p>
            </article>

            <article className="chart-card">
              <div className="card-title">
                <div>
                  <p className="eyebrow">Model reports</p>
                  <h2>Динамика поколений</h2>
                </div>
                <BookOpenCheck size={20} aria-hidden="true" />
              </div>
              <div className="chart-wrap compact">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={timeline} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="modelGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.42} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis hide domain={[30, 50]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#modelGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section id="safety" className="section-grid" aria-labelledby="safety-title">
            <div className="section-heading">
              <p className="eyebrow">Responsible scaling</p>
              <h2 id="safety-title">Safety как продуктовый слой</h2>
              <p>
                Anthropic публикует Transparency Hub, описывает safety evaluations и указывает уровни ASL/RSP для моделей.
              </p>
            </div>

            <div className="safety-layout">
              <article className="chart-card">
                <div className="card-title">
                  <div>
                    <p className="eyebrow">Safety labels</p>
                    <h3>Уровни моделей</h3>
                  </div>
                  <ShieldCheck size={20} aria-hidden="true" />
                </div>
                <div className="chart-wrap compact">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={safetyData} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide domain={[4, 5]} />
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={58} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {safetyData.map((entry, index) => (
                          <Cell key={entry.name + index} fill={`hsl(var(--chart-${(index % 4) + 1}))`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <div className="safety-stack">
                {[
                  ["Constitutional AI", "Claude должен быть helpful, honest and harmless; Anthropic публикует отдельную страницу Constitution."],
                  ["Safeguards", "В материалах о защите Claude Anthropic описывает выявление злоупотреблений и real-time defenses."],
                  ["RSP", "Responsible Scaling Policy задаёт процесс оценки потенциально катастрофических рисков перед релизами."],
                ].map(([title, text]) => (
                  <article className="mini-card" key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="sources" className="sources-card" aria-labelledby="sources-title">
            <div>
              <p className="eyebrow">Sources</p>
              <h2 id="sources-title">Проверяемые страницы</h2>
              <p>Все основные утверждения в интерфейсе собраны из открытых страниц Anthropic. Внешние ссылки открываются в новой вкладке.</p>
            </div>
            <div className="source-grid">
              <SourceLink href={sourceLinks.company}>Company</SourceLink>
              <SourceLink href={sourceLinks.claude}>Claude product page</SourceLink>
              <SourceLink href={sourceLinks.transparency}>Transparency Hub</SourceLink>
              <SourceLink href={sourceLinks.careers}>Careers</SourceLink>
              <SourceLink href={sourceLinks.rsp}>Responsible Scaling Policy</SourceLink>
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
