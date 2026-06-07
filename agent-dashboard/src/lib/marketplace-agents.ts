import type { AgentConfig } from './agent-types'

export interface MarketplaceAgent {
  config: AgentConfig
  repo: string
  githubStars: string
  license: string
  difficulty: 'Fácil' | 'Media' | 'Compleja'
}

export const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  {
    config: {
      id: 'autogpt',
      name: 'AutoGPT',
      description: 'Agente autónomo de propósito general. Define un objetivo y él mismo planea y ejecuta los pasos para lograrlo.',
      icon: '🤖',
      color: '#6366f1',
      category: 'ai',
      enabled: false,
    },
    repo: 'Significant-Gravitas/AutoGPT',
    githubStars: '170K+',
    license: 'MIT',
    difficulty: 'Media',
  },
  {
    config: {
      id: 'crewai',
      name: 'CrewAI',
      description: 'Framework multi-agente. Define roles, tareas y crews que trabajan en equipo para resolver problemas complejos.',
      icon: '👥',
      color: '#06b6d4',
      category: 'ai',
      enabled: false,
    },
    repo: 'joaomdmoura/crewAI',
    githubStars: '45K+',
    license: 'MIT',
    difficulty: 'Fácil',
  },
  {
    config: {
      id: 'gpt-researcher',
      name: 'GPT-Researcher',
      description: 'Agente de investigación profunda. Busca en la web, cruza fuentes y genera reportes estructurados con citas.',
      icon: '🔬',
      color: '#8b5cf6',
      category: 'research',
      enabled: false,
    },
    repo: 'assafelovic/gpt-researcher',
    githubStars: '20K+',
    license: 'Apache 2.0',
    difficulty: 'Fácil',
  },
  {
    config: {
      id: 'browser-use',
      name: 'Browser-Use',
      description: 'Navegación web automatizada con IA. Combina LLMs con browser automation para interactuar con sitios web.',
      icon: '🌐',
      color: '#f59e0b',
      category: 'browser',
      enabled: false,
    },
    repo: 'browser-use/browser-use',
    githubStars: '25K+',
    license: 'MIT',
    difficulty: 'Fácil',
  },
  {
    config: {
      id: 'aider',
      name: 'Aider',
      description: 'Pair programming en terminal. Edita código, entiende tu repo, hace commits con mensajes descriptivos.',
      icon: '💻',
      color: '#10b981',
      category: 'coding',
      enabled: false,
    },
    repo: 'paul-gauthier/aider',
    githubStars: '30K+',
    license: 'Apache 2.0',
    difficulty: 'Fácil',
  },
  {
    config: {
      id: 'superagi',
      name: 'SuperAGI',
      description: 'Infraestructura para desplegar y gestionar agentes a escala. Dashboard, ejecución concurrente y marketplace.',
      icon: '⚡',
      color: '#ef4444',
      category: 'ai',
      enabled: false,
    },
    repo: 'TransformerOptimus/SuperAGI',
    githubStars: '15K+',
    license: 'MIT',
    difficulty: 'Media',
  },
  {
    config: {
      id: 'openhands',
      name: 'OpenHands',
      description: 'Ingeniero de software autónomo. Toma issues de GitHub, escribe fixes, corre tests y crea PRs.',
      icon: '🖐️',
      color: '#3b82f6',
      category: 'coding',
      enabled: false,
    },
    repo: 'All-Hands-AI/OpenHands',
    githubStars: '50K+',
    license: 'MIT',
    difficulty: 'Media',
  },
  {
    config: {
      id: 'metagpt',
      name: 'MetaGPT',
      description: 'Multi-agente con roles estilo startup. PM, arquitecto, ingeniero — todos colaborando con procesos definidos.',
      icon: '🏗️',
      color: '#ec4899',
      category: 'ai',
      enabled: false,
    },
    repo: 'geekan/MetaGPT',
    githubStars: '40K+',
    license: 'MIT',
    difficulty: 'Media',
  },
  {
    config: {
      id: 'haystack',
      name: 'Haystack',
      description: 'Framework RAG para búsqueda y recuperación. Ideal para construir sistemas de Q&A y research automation.',
      icon: '🔍',
      color: '#84cc16',
      category: 'research',
      enabled: false,
    },
    repo: 'deepset-ai/haystack',
    githubStars: '20K+',
    license: 'Apache 2.0',
    difficulty: 'Media',
  },
  {
    config: {
      id: 'agno',
      name: 'Agno (Phidata)',
      description: 'Framework para agentes con memoria, knowledge base y herramientas.',
      icon: '🧩',
      color: '#14b8a6',
      category: 'ai',
      enabled: false,
    },
    repo: 'agno-agi/agno',
    githubStars: '15K+',
    license: 'MIT',
    difficulty: 'Fácil',
  },
]

export const MARKETPLACE_CATEGORIES: { key: string; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'ai', label: '🤖 IA General' },
  { key: 'coding', label: '💻 Coding' },
  { key: 'research', label: '🔬 Research' },
  { key: 'browser', label: '🌐 Browser' },
  { key: 'trading', label: '📈 Trading' },
  { key: 'marketing', label: '📱 Marketing' },
  { key: 'social', label: '🎵 Social' },
  { key: 'dev', label: '🏗️ DevOps' },
]
