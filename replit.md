# Código Generator Application

## Overview

This is a full-stack web application for generating and managing engineering document codes. It's built with React frontend and Express backend, featuring user authentication, code generation with predefined categories, and code management capabilities. The application uses Supabase for authentication and database services, with a PostgreSQL database managed through Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: 
  - React Context API for authentication and code management
  - TanStack Query for server state management
- **Routing**: React Router DOM for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Supabase Auth integration
- **Development**: Hot reload with Vite middleware

## Key Components

### Authentication System
- Supabase-based authentication with JWT tokens
- Role-based access control with invitation token system
- Protected routes using React Router guards
- User profiles with roles stored in PostgreSQL

### Code Generation System
- Structured code generation following engineering document standards
- Categories include: company, location, service, system, component, stage, discipline, document type
- Date-based versioning system
- Code validation and formatting utilities

### Data Management
- Centralized code options management via Supabase
- Local storage for user preferences
- Code history and persistence
- PDF export functionality for generated codes

### UI Components
- Responsive design with mobile-first approach
- Sidebar navigation with collapsible states
- Form components with real-time validation
- Toast notifications for user feedback
- Modal dialogs for code legends and details

## Data Flow

1. **Authentication Flow**: User authenticates via Supabase → Profile created/retrieved from PostgreSQL → Context provides user state throughout app
2. **Code Generation Flow**: User selects options from predefined categories → Code generated using business logic → Code can be saved to database → PDF export available
3. **Code Management Flow**: Saved codes retrieved from Supabase → Displayed in paginated table → Individual codes can be copied or viewed with legends

## External Dependencies

### Authentication & Database
- **Supabase**: Handles user authentication, real-time subscriptions, and PostgreSQL database hosting
- **Neon Database**: Serverless PostgreSQL for production deployments

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development & Build
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundling for production

### Utilities
- **html2canvas & jsPDF**: Client-side PDF generation
- **date-fns**: Date manipulation utilities
- **Zod**: Schema validation
- **clsx & class-variance-authority**: Conditional CSS classes

## Deployment Strategy

### Development
- Uses Vite dev server with Express middleware integration
- Hot module replacement for React components
- Development-specific error overlays and debugging tools

### Production Build
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: ESBuild bundles Express server to `dist/index.js`
- Single deployment artifact with both frontend and backend

### Environment Configuration
- Database URL via environment variables
- Supabase configuration embedded in client
- Separate development and production configurations

## Changelog
```
Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Migração do Lovable para Replit concluída
  - Mantida integração com Supabase (conforme solicitação do usuário)
  - Aplicação rodando com sucesso na porta 5000
  - Backend simplificado para servir apenas assets estáticos
  - Frontend mantido com todas funcionalidades originais
  - Adicionados tipos de documento faltantes no Supabase
  - Sistema de geração de códigos funcionando completamente
  - Logo da A2Z Projetos integrada na tela de login e barra lateral
- July 08, 2025. Sistema de contratantes implementado
  - Campo contratante adicionado ao gerador de códigos
  - Contratantes IGU e CAH configurados no estado local
  - Botão "+" permite adicionar novos contratantes via API backend
  - Códigos incluem contratante no formato: CONTRATANTE-EMPRESA-LOCALIDADE-...
  - API backend criada para inserção direta no PostgreSQL
  - Sistema de abreviação automática para novos contratantes
  - IMPORTANTE: Execute supabase_fix.sql no painel do Supabase para resolver RLS
- July 08, 2025. Sistema totalmente colaborativo implementado
  - Migração completa para Supabase com token "admin-token-2024"
  - Sistema colaborativo: todos usuários podem ver e criar códigos
  - Criação automática de perfis via triggers do Supabase
  - Dashboard com estatísticas e gráficos interativos
  - Sistema de tema escuro/claro com persistência
  - RLS configurado para acesso colaborativo em todas as tabelas
- July 08, 2025. Design elegante e moderno implementado
  - Interface redesenhada com gradientes azul-roxo elegantes
  - Animações CSS suaves (fade-in, scale-in) em todos os componentes
  - Página de login com background gradiente e elementos glassmorphism
  - Sidebar modernizada com logo em container elegante e menus estilizados
  - Botões com gradientes e efeitos hover aprimorados
  - Menu do usuário com design circular e dropdown modernizado
  - Sistema mantém cores atuais mas com visual muito mais elegante
  - Experiência de usuário significativamente melhorada
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```