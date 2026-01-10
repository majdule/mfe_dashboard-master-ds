# Project Architecture Documentation

## Table of Contents

- [System Overview](#system-overview)
- [Microfrontend Architecture](#microfrontend-architecture)
- [Module Federation](#module-federation)
- [Package Structure](#package-structure)
- [Technology Stack](#technology-stack)
- [Communication Patterns](#communication-patterns)
- [Routing Strategy](#routing-strategy)
- [Build & Deployment](#build--deployment)
- [Development Workflow](#development-workflow)
- [Design Decisions](#design-decisions)
- [Scalability & Performance](#scalability--performance)
- [Security Considerations](#security-considerations)

## System Overview

The Microfrontend Dashboard is a modern web application built using the **Microfrontend Architecture** pattern with **Webpack Module Federation**. The application consists of 4 independently deployable packages that work together as a unified user experience.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (localhost:8080)                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Container Application (Host)               │ │
│  │                                                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │ │
│  │  │  Header  │  │ Progress │  │  React Router v6     │ │ │
│  │  │ Component│  │  (Loading)│  │  (BrowserRouter)     │ │ │
│  │  └──────────┘  └──────────┘  └──────────────────────┘ │ │
│  │                                                         │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │         Dynamic MFE Loading Zone                │  │ │
│  │  │                                                  │  │ │
│  │  │  ┌──────────────┐  ┌──────────────┐            │  │ │
│  │  │  │ Marketing MFE│  │   Auth MFE   │            │  │ │
│  │  │  │ (React)      │  │   (React)    │            │  │ │
│  │  │  │              │  │              │            │  │ │
│  │  │  │ Routes:      │  │ Routes:      │            │  │ │
│  │  │  │ /            │  │ /auth/signin │            │  │ │
│  │  │  │ /pricing     │  │ /auth/signup │            │  │ │
│  │  │  └──────────────┘  └──────────────┘            │  │ │
│  │  │                                                  │  │ │
│  │  │  ┌──────────────────────────────────┐          │  │ │
│  │  │  │      Dashboard MFE (Vue 3)       │          │  │ │
│  │  │  │                                   │          │  │ │
│  │  │  │  Routes: /dashboard/*            │          │  │ │
│  │  │  │  (Protected - requires auth)     │          │  │ │
│  │  │  └──────────────────────────────────┘          │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │ │
└─────────────────────────────────────────────────────────────┘

         ↓ Module Federation (Runtime)

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Marketing    │  │    Auth      │  │  Dashboard   │
│ :8081        │  │    :8082     │  │    :8083     │
│              │  │              │  │              │
│ remoteEntry  │  │ remoteEntry  │  │ remoteEntry  │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Key Characteristics

- **Monorepo Structure**: All packages in a single repository
- **Independent Deployment**: Each MFE can be deployed separately
- **Runtime Integration**: MFEs loaded dynamically at runtime via Module Federation
- **Technology Agnostic**: Mix of React and Vue frameworks
- **Type-Safe**: Full TypeScript support with shared type definitions
- **Shared Dependencies**: React, React Router, Material-UI shared across React MFEs

## Microfrontend Architecture

### What is a Microfrontend?

A microfrontend is an architectural pattern where a web application is composed of semi-independent fragments that can be built, tested, and deployed independently. Each fragment is owned by an independent team and represents a specific business domain.

### Our Implementation

#### 1. **Container (Host/Shell)**
- **Role**: Orchestrator and layout manager
- **Responsibilities**:
  - Provides application shell (header, layout)
  - Manages global routing
  - Loads remote microfrontends dynamically
  - Manages shared state (authentication)
  - Provides common UI components

#### 2. **Marketing MFE**
- **Role**: Public-facing marketing content
- **Responsibilities**:
  - Landing page
  - Pricing page
  - Marketing content
- **Routes**: `/`, `/pricing`

#### 3. **Auth MFE**
- **Role**: User authentication
- **Responsibilities**:
  - Sign in functionality
  - Sign up functionality
  - Authentication forms
- **Routes**: `/auth/signin`, `/auth/signup`

#### 4. **Dashboard MFE**
- **Role**: Authenticated user dashboard
- **Responsibilities**:
  - Display user-specific data
  - Interactive dashboard components
  - Data visualization
- **Routes**: `/dashboard/*` (protected)

## Module Federation

### What is Module Federation?

Module Federation is a Webpack 5 feature that allows multiple independent builds to form a single application. It enables code sharing at runtime, making it perfect for microfrontend architectures.

### Configuration

#### Container Configuration

**File**: `packages/container/config/webpack.dev.js`

```javascript
new ModuleFederationPlugin({
  name: 'container',
  remotes: {
    marketing: 'marketing@http://localhost:8081/remoteEntry.js',
    auth: 'auth@http://localhost:8082/remoteEntry.js',
    dashboard: 'dashboard@http://localhost:8083/remoteEntry.js',
  },
  shared: packageJson.dependencies,
}),
```

**Explanation**:
- `name`: Unique identifier for this build
- `remotes`: Map of remote MFEs and their entry points
- `shared`: Dependencies shared across all MFEs (React, React Router, etc.)

#### Remote MFE Configuration (Example: Auth)

**File**: `packages/auth/config/webpack.dev.js`

```javascript
new ModuleFederationPlugin({
  name: 'auth',
  filename: 'remoteEntry.js',
  exposes: {
    './AuthApp': './src/bootstrap',
  },
  shared: packageJson.dependencies,
}),
```

**Explanation**:
- `name`: Unique identifier for this remote
- `filename`: Entry point file for Module Federation
- `exposes`: Modules exposed to other applications
- `shared`: Dependencies to share with host

### Runtime Loading Flow

```
1. User visits http://localhost:8080
   ↓
2. Container loads and initializes
   ↓
3. React Router matches route (e.g., /auth/signin)
   ↓
4. Container lazy-loads AuthApp component
   ↓
5. Webpack fetches http://localhost:8082/remoteEntry.js
   ↓
6. Auth MFE code loaded into browser
   ↓
7. Container calls mount() function from Auth MFE
   ↓
8. Auth MFE renders into container's DOM
```

### Type Safety with Module Federation

**Challenge**: TypeScript doesn't know about runtime-loaded modules.

**Solution**: Ambient module declarations

**File**: `packages/container/src/types/module-federation.d.ts`

```typescript
declare module 'marketing/MarketingApp' {
  import { MountFunction } from './mount';
  export const mount: MountFunction;
}

declare module 'auth/AuthApp' {
  import { MountFunction } from './mount';
  export const mount: MountFunction;
}

declare module 'dashboard/DashboardApp' {
  import { VueMountFunction } from './mount';
  export const mount: VueMountFunction;
}
```

This tells TypeScript: "Trust me, these modules will exist at runtime, and here are their types."

## Package Structure

### Monorepo Organization

```
mfe_dashboard-master-ds/
├── tsconfig.base.json              # Shared TypeScript config
├── docs/                           # Documentation
│   ├── README.md
│   ├── architecture.md             # This file
│   ├── typescript-migration.md
│   └── typescript-quick-reference.md
│
├── packages/
│   ├── container/                  # Host Application
│   │   ├── config/
│   │   │   ├── webpack.common.js
│   │   │   ├── webpack.dev.js
│   │   │   └── webpack.prod.js
│   │   ├── public/
│   │   │   └── index.html
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── AuthApp.tsx          # Auth MFE wrapper
│   │   │   │   ├── MarketingApp.tsx     # Marketing MFE wrapper
│   │   │   │   ├── DashboardApp.tsx     # Dashboard MFE wrapper
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Progress.tsx
│   │   │   ├── types/
│   │   │   │   ├── module-federation.d.ts
│   │   │   │   └── mount.d.ts
│   │   │   ├── App.tsx
│   │   │   ├── bootstrap.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── auth/                       # Auth Microfrontend
│   │   ├── config/
│   │   │   ├── webpack.common.js
│   │   │   ├── webpack.dev.js
│   │   │   └── webpack.prod.js
│   │   ├── public/
│   │   │   └── index.html
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Signin.tsx
│   │   │   │   └── Signup.tsx
│   │   │   ├── types/
│   │   │   │   └── mount.d.ts
│   │   │   ├── App.tsx
│   │   │   ├── bootstrap.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── marketing/                  # Marketing Microfrontend
│   │   ├── config/
│   │   │   ├── webpack.common.js
│   │   │   ├── webpack.dev.js
│   │   │   └── webpack.prod.js
│   │   ├── public/
│   │   │   └── index.html
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Landing.tsx
│   │   │   │   └── Pricing.tsx
│   │   │   ├── types/
│   │   │   │   └── mount.d.ts
│   │   │   ├── App.tsx
│   │   │   ├── bootstrap.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── dashboard/                  # Dashboard Microfrontend (Vue)
│       ├── config/
│       │   ├── webpack.common.js
│       │   ├── webpack.dev.js
│       │   └── webpack.prod.js
│       ├── public/
│       │   └── index.html
│       ├── src/
│       │   ├── components/
│       │   │   └── Dashboard.vue
│       │   ├── types/
│       │   │   └── mount.d.ts
│       │   ├── bootstrap.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
```

### Bootstrap Pattern

Each MFE follows a consistent bootstrap pattern for framework-agnostic integration:

**Structure**:
```
src/
├── index.ts        # Entry point (dynamic import to avoid shared dependency issues)
├── bootstrap.tsx   # Actual application initialization and mount function
└── App.tsx         # Root application component
```

**index.ts** (Entry Point):
```typescript
import('./bootstrap');
export {};
```

**Why?** The dynamic import ensures shared dependencies are loaded before the application code.

**bootstrap.tsx** (Mount Function):
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MountOptions, MountResult } from './types/mount';

const mount = (el: HTMLElement, options: MountOptions = {}): MountResult => {
  const { onSignIn, onNavigate, initialPath } = options;
  const root = ReactDOM.createRoot(el);
  root.render(<App onSignIn={onSignIn} onNavigate={onNavigate} initialPath={initialPath} />);

  return {
    onParentNavigate({ pathname: nextPathname }) {
      // Handle navigation from parent
    },
  };
};

// Development mode standalone
if (process.env.NODE_ENV === 'development') {
  const devRoot = document.querySelector('#_auth-dev-root');
  if (devRoot) {
    mount(devRoot as HTMLElement);
  }
}

export { mount };
```

**Benefits**:
1. Framework-agnostic integration
2. Can run standalone in development
3. Controlled lifecycle (mount/unmount)
4. Type-safe interface

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | 5.x | Type safety and developer experience |
| **Webpack** | 5.104.1 | Module bundling and Module Federation |
| **React** | 18.3.1 | UI framework (Container, Auth, Marketing) |
| **Vue** | 3.5.13 | UI framework (Dashboard) |
| **React Router** | 6.28.0 | Client-side routing |
| **Material-UI** | 4.12.4 | UI component library (React MFEs) |
| **PrimeVue** | 3.53.1 | UI component library (Vue MFE) |

### Build Tools

| Tool | Purpose |
|------|---------|
| **ts-loader** | TypeScript compilation in Webpack |
| **babel-loader** | JavaScript transpilation |
| **webpack-dev-server** | Development server with HMR |
| **vue-loader** | Vue SFC compilation |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| **@types/\*** | TypeScript type definitions |
| **clean-webpack-plugin** | Clean dist folder before build |
| **html-webpack-plugin** | Generate HTML files |
| **css-loader** | CSS module loading |
| **style-loader** | Inject CSS into DOM |

## Communication Patterns

### 1. Parent-to-Child Communication

Container passes data to MFEs via the mount function:

```typescript
// Container
mount(element, {
  initialPath: '/auth/signin',
  onSignIn: () => setIsSignedIn(true),
  onNavigate: ({ pathname }) => navigate(pathname),
});
```

### 2. Child-to-Parent Communication

MFEs communicate back via callbacks:

```typescript
// Auth MFE
<Signin onSignIn={onSignIn} />

// When user signs in
onSignIn?.(); // Calls parent's callback
```

### 3. Navigation Communication

Bidirectional navigation sync:

```typescript
// Parent → Child
const { onParentNavigate } = mount(element, options);
onParentNavigate({ pathname: location.pathname });

// Child → Parent
onNavigate?.({ pathname: '/dashboard' });
```

### 4. State Management

**Current**: Props drilling and callbacks

**Options for scaling**:
- Redux with shared store
- Context API for each MFE
- Event bus for cross-MFE communication
- Custom events for decoupled communication

### Communication Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Container                         │
│                                                      │
│  State: isSignedIn, currentPath                     │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  mount(element, {                          │    │
│  │    initialPath: '/auth/signin',            │    │
│  │    onSignIn: () => setIsSignedIn(true), ←─┼────┼─── Callback
│  │    onNavigate: (path) => navigate(path)    │    │
│  │  })                                         │    │
│  └────────────────────────────────────────────┘    │
│                       ↓                             │
└───────────────────────┼─────────────────────────────┘
                        ↓
              ┌─────────────────┐
              │    Auth MFE     │
              │                 │
              │  Receives:      │
              │  - initialPath  │
              │  - onSignIn     │
              │  - onNavigate   │
              │                 │
              │  User clicks    │
              │  "Sign In"      │
              │       ↓         │
              │  onSignIn() ────┘ Calls parent callback
              └─────────────────┘
```

## Routing Strategy

### Multi-Level Routing

The application uses a hierarchical routing strategy:

#### Level 1: Container (BrowserRouter)

```typescript
// packages/container/src/App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/auth/*" element={<AuthLazy onSignIn={...} />} />
    <Route path="/dashboard/*" element={<DashboardLazy />} />
    <Route path="/*" element={<MarketingLazy />} />
  </Routes>
</BrowserRouter>
```

#### Level 2: MFE Internal Routing (MemoryRouter)

```typescript
// packages/auth/src/App.tsx
<MemoryRouter initialEntries={[initialPath || '/auth/signin']}>
  <Routes>
    <Route path="/auth/signin" element={<Signin onSignIn={onSignIn} />} />
    <Route path="/auth/signup" element={<Signup onSignIn={onSignIn} />} />
  </Routes>
</MemoryRouter>
```

**Why MemoryRouter?**
- Prevents conflicts with container's BrowserRouter
- MFE doesn't manipulate browser URL directly
- Container maintains single source of truth for URL

### Route Ownership

| Route Pattern | Owner | MFE Loaded |
|---------------|-------|------------|
| `/` | Container | Marketing |
| `/pricing` | Container | Marketing |
| `/auth/signin` | Container | Auth |
| `/auth/signup` | Container | Auth |
| `/dashboard/*` | Container | Dashboard |

### Protected Routes

```typescript
// Container protects dashboard route
<Route
  path="/dashboard/*"
  element={!isSignedIn ? <Navigate to="/" replace /> : <DashboardLazy />}
/>
```

### Navigation Synchronization

```typescript
// Container wrapper synchronizes navigation
useEffect(() => {
  if (!ref.current) return;

  const { onParentNavigate } = mount(ref.current, {
    initialPath: location.pathname,
    onNavigate: ({ pathname: nextPathname }) => {
      if (location.pathname !== nextPathname) {
        navigate(nextPathname);
      }
    },
  });

  onParentNavigate({ pathname: location.pathname });
}, [location.pathname]);
```

## Build & Deployment

### Development Build

Each package has its own dev server:

```bash
# Start all in parallel
cd packages/container && npm start &  # Port 8080
cd packages/auth && npm start &       # Port 8082
cd packages/marketing && npm start &  # Port 8081
cd packages/dashboard && npm start &  # Port 8083
```

**Webpack Dev Server Features**:
- Hot Module Replacement (HMR)
- Fast refresh
- Source maps
- Module Federation in development mode

### Production Build

```bash
# Build all packages
npm run build  # (if root script exists)

# Or build individually
cd packages/container && npm run build
cd packages/auth && npm run build
cd packages/marketing && npm run build
cd packages/dashboard && npm run build
```

**Output**:
```
packages/
├── container/dist/
│   ├── index.html
│   ├── main.[hash].js
│   └── [vendor].[hash].js
├── auth/dist/
│   ├── remoteEntry.js        # ← Module Federation entry
│   ├── main.[hash].js
│   └── [vendor].[hash].js
├── marketing/dist/
│   ├── remoteEntry.js        # ← Module Federation entry
│   └── ...
└── dashboard/dist/
    ├── remoteEntry.js        # ← Module Federation entry
    └── ...
```

### Deployment Strategies

#### 1. Independent Deployment

Each MFE deployed to separate URLs:

```javascript
// Production webpack config
new ModuleFederationPlugin({
  name: 'container',
  remotes: {
    marketing: 'marketing@https://marketing.example.com/remoteEntry.js',
    auth: 'auth@https://auth.example.com/remoteEntry.js',
    dashboard: 'dashboard@https://dashboard.example.com/remoteEntry.js',
  },
}),
```

**Benefits**:
- Deploy MFEs independently
- Different teams own different MFEs
- Scale MFEs independently

**Challenges**:
- Version management
- CORS configuration
- Cache invalidation

#### 2. Monolithic Deployment (Simplified)

All MFEs deployed to same domain:

```
https://example.com/
https://example.com/marketing/remoteEntry.js
https://example.com/auth/remoteEntry.js
https://example.com/dashboard/remoteEntry.js
```

**Benefits**:
- Simpler CORS
- Single deployment pipeline
- Easier to manage

**Trade-offs**:
- Lose some microfrontend benefits
- All MFEs deployed together

#### 3. Hybrid Approach (Recommended)

Container and stable MFEs on main domain, frequently updated MFEs on separate CDN:

```javascript
remotes: {
  marketing: 'marketing@https://cdn.example.com/marketing/remoteEntry.js',
  auth: 'auth@/auth/remoteEntry.js',        // Same domain
  dashboard: 'dashboard@/dashboard/remoteEntry.js',  // Same domain
}
```

### CI/CD Pipeline Example

```yaml
# .github/workflows/deploy.yml
name: Deploy Microfrontends

on:
  push:
    branches: [main]

jobs:
  deploy-container:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Container
        run: cd packages/container && npm ci && npm run build
      - name: Deploy to S3
        run: aws s3 sync packages/container/dist s3://bucket/container

  deploy-auth:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Auth
        run: cd packages/auth && npm ci && npm run build
      - name: Deploy to S3
        run: aws s3 sync packages/auth/dist s3://bucket/auth

  # Similar for marketing and dashboard
```

## Development Workflow

### Getting Started

```bash
# 1. Clone repository
git clone https://github.com/majdule/mfe_dashboard-master-ds.git
cd mfe_dashboard-master-ds

# 2. Install dependencies for all packages
cd packages/container && npm install
cd ../auth && npm install
cd ../marketing && npm install
cd ../dashboard && npm install

# 3. Start development servers (4 terminals)
cd packages/container && npm start
cd packages/auth && npm start
cd packages/marketing && npm start
cd packages/dashboard && npm start

# 4. Open browser
open http://localhost:8080
```

### Adding a New Feature

#### To Existing MFE:

```bash
# 1. Navigate to MFE
cd packages/auth

# 2. Create feature branch
git checkout -b feature/new-auth-feature

# 3. Develop and test
npm start

# 4. Build and verify
npm run build

# 5. Commit and push
git add .
git commit -m "Add new auth feature"
git push origin feature/new-auth-feature
```

#### Create New MFE:

```bash
# 1. Create new package
mkdir packages/new-mfe
cd packages/new-mfe

# 2. Initialize package
npm init -y

# 3. Copy webpack config from similar MFE
cp -r ../auth/config ./

# 4. Install dependencies
npm install react react-dom react-router-dom
npm install -D webpack webpack-cli webpack-dev-server typescript ts-loader

# 5. Create src structure
mkdir -p src/{components,types}
touch src/{index.ts,bootstrap.tsx,App.tsx}
touch src/types/mount.d.ts

# 6. Update webpack config
# Edit config/webpack.dev.js to expose new module

# 7. Update container to load new MFE
# Edit packages/container/config/webpack.dev.js
# Add to remotes: newMfe: 'newMfe@http://localhost:8084/remoteEntry.js'

# 8. Create type declarations in container
# Edit packages/container/src/types/module-federation.d.ts
```

### Testing Strategy

#### Unit Testing

```bash
# Add testing libraries
npm install -D jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

#### Integration Testing

```bash
# Use Cypress or Playwright
npm install -D cypress

# Test cross-MFE navigation
cy.visit('http://localhost:8080')
cy.contains('Login').click()
cy.url().should('include', '/auth/signin')
```

#### E2E Testing

Test complete user flows across all MFEs:
```javascript
test('User can sign in and access dashboard', async () => {
  await page.goto('http://localhost:8080');
  await page.click('text=Login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password');
  await page.click('text=Sign In');
  await page.waitForURL('**/dashboard');
  expect(await page.isVisible('text=Dashboard')).toBe(true);
});
```

## Design Decisions

### Why Microfrontends?

**Pros**:
- ✅ Independent deployment
- ✅ Team autonomy
- ✅ Technology diversity (React + Vue)
- ✅ Isolated failures
- ✅ Incremental upgrades

**Cons**:
- ❌ Increased complexity
- ❌ Bundle size overhead (if not configured properly)
- ❌ Runtime performance considerations
- ❌ More challenging debugging

**Decision**: Benefits outweigh costs for this multi-team, feature-rich application.

### Why Module Federation?

**Alternatives Considered**:
- iframes (poor UX, limited communication)
- Web Components (browser support, complexity)
- Single-SPA (more boilerplate, less native Webpack integration)

**Why Module Federation Won**:
- Native Webpack integration
- Shared dependencies (smaller bundles)
- Type safety possible with TypeScript
- Runtime code splitting
- Mature ecosystem

### Why TypeScript?

**Benefits**:
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Safer refactoring
- Team scalability

**Trade-offs**:
- Initial setup time
- Learning curve
- Build complexity

**Decision**: Type safety critical for microfrontend communication contracts.

### Why React Router v6?

**Benefits**:
- Modern React patterns (hooks)
- Better TypeScript support
- Smaller bundle size
- Improved nested routing

**Chosen over**:
- React Router v5 (legacy)
- TanStack Router (too new)
- Custom routing (unnecessary complexity)

### Why Material-UI v4?

**Note**: Using older version for stability.

**Considerations for upgrade**:
- MUI v5 has better TypeScript support
- Breaking changes require careful migration
- All MFEs must upgrade together (shared dependency)

### Why Monorepo?

**Benefits**:
- Shared tooling and configs
- Atomic commits across MFEs
- Easier dependency management
- Single source of truth

**Alternatives**:
- Separate repos (harder to coordinate)
- Multirepo (CI/CD complexity)

**Decision**: Monorepo best for this project size and team structure.

## Scalability & Performance

### Bundle Size Optimization

#### Shared Dependencies

Module Federation automatically shares dependencies:

```javascript
shared: {
  react: { singleton: true, requiredVersion: '^18.3.1' },
  'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
  'react-router-dom': { singleton: true, requiredVersion: '^6.28.0' },
}
```

**Result**: React loaded once, shared by all MFEs.

#### Code Splitting

```typescript
// Lazy load MFEs
const AuthLazy = lazy(() => import('./components/AuthApp'));
const MarketingLazy = lazy(() => import('./components/MarketingApp'));
const DashboardLazy = lazy(() => import('./components/DashboardApp'));
```

**Result**: MFEs loaded on-demand, not upfront.

#### Tree Shaking

TypeScript + Webpack automatically removes unused code:

```typescript
// Only imports used in bundle
import { Button } from '@material-ui/core';  // Not entire library
```

### Performance Monitoring

```typescript
// Add performance marks
performance.mark('mfe-load-start');
const { mount } = await import('auth/AuthApp');
performance.mark('mfe-load-end');
performance.measure('mfe-load', 'mfe-load-start', 'mfe-load-end');
```

### Caching Strategy

```javascript
// Production webpack config
output: {
  filename: '[name].[contenthash].js',  // Content-based hashing
  chunkFilename: '[name].[contenthash].js',
}
```

**Result**: Aggressive caching, cache busting on changes.

### Scaling Considerations

**Horizontal Scaling**:
- Deploy MFEs to CDN
- Use multiple regions
- Load balance requests

**Vertical Scaling**:
- Optimize bundle size
- Lazy load components
- Implement virtual scrolling for long lists

## Security Considerations

### 1. Content Security Policy (CSP)

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' https://marketing.example.com https://auth.example.com;
               connect-src 'self' https://api.example.com;">
```

### 2. CORS Configuration

```javascript
// Express server example
app.use(cors({
  origin: ['https://example.com', 'http://localhost:8080'],
  credentials: true,
}));
```

### 3. Authentication Flow

```
1. User signs in (Auth MFE)
2. Server returns JWT token
3. Token stored in httpOnly cookie
4. Container reads auth state
5. Protected routes check auth status
6. API calls include token automatically
```

### 4. XSS Prevention

- React/Vue automatically escape output
- Use `dangerouslySetInnerHTML` sparingly
- Sanitize user input
- Validate API responses

### 5. Dependency Security

```bash
# Regular security audits
npm audit

# Fix vulnerabilities
npm audit fix
```

### 6. Module Federation Security

**Risks**:
- Loading untrusted remotes
- Version mismatches
- Supply chain attacks

**Mitigations**:
- Whitelist remote URLs
- Integrity checks (SRI)
- Monitor remote health
- Version pinning in production

```javascript
// Use environment-specific remote URLs
const remoteUrl = process.env.AUTH_REMOTE_URL || 'http://localhost:8082/remoteEntry.js';
```

## Conclusion

This microfrontend architecture provides:

- ✅ **Independent deployability** for fast iterations
- ✅ **Technology flexibility** (React + Vue)
- ✅ **Team autonomy** with clear boundaries
- ✅ **Type safety** across the entire system
- ✅ **Performance optimization** through shared dependencies
- ✅ **Scalable architecture** for future growth

The combination of Webpack Module Federation, TypeScript, and a well-structured monorepo creates a maintainable, scalable, and developer-friendly platform.

---

**Last Updated**: January 10, 2026
**Architecture Version**: 1.0
**Maintainers**: Development Team
