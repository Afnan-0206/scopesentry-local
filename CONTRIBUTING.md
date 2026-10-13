# Contributing to ScopeSentry Local

Thank you for your interest in contributing to **ScopeSentry Local**!

ScopeSentry Local is an open-source, local-first AI assistant built to help freelancers detect scope changes, verify evidence quotations verbatim against written agreements, and draft polite client replies without sending data to third-party proprietary APIs.

## Development Workflow

### Prerequisites
- **Node.js**: v20+ or v24+
- **npm**: v10+
- **Ollama**: (Optional for live inference) running on `http://127.0.0.1:11434` with `qwen2.5:7b` or `qwen2.5:0.5b`. Demo fixtures mode is available if Ollama is not installed.

### Setup
```powershell
# Clone the repository
git clone https://github.com/your-username/scopesentry-local.git
cd scopesentry-local

# Install all dependencies across workspaces
npm install

# Build shared types and packages
npm run build
```

### Running Locally
```powershell
# Run the local backend (Port 3001)
npm run dev:server

# In a second terminal, run the React Vite frontend (Port 5173)
npm run dev:client
```
Open `http://localhost:5173` in your browser.

### Running Checks & Tests
```powershell
# Run full test suite across server and client
npm test

# Run TypeScript typechecks
npm run typecheck

# Build for production
npm run build
```

## Core Engineering Principles
1. **Never fabricate evidence**: Any quotation presented as evidence must be confirmed verbatim in the original agreement text.
2. **Strict privacy**: Inference runs locally over loopback. Do not introduce third-party cloud LLM API calls.
3. **Conservative classification**: If agreement clauses conflict or critical terms are undefined, always prefer `NEEDS CLARIFICATION` over inventing terms.
4. **Editable drafts**: Never fabricate fees, deadlines, or quotes unless the user has explicitly entered them.
