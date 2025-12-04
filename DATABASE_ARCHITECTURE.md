# Database Architecture PRD: "The Architect"

## 1. Overview
This document defines the MongoDB schema architecture for "The Architect." It is designed to support the **Deep-Dive Interrogation** workflow (storing extensive context) and the **Blueprint Suite** (storing multiple technical artifacts).

## 2. Connection Strategy
*   **Pattern:** Singleton Connection Pattern.
*   **Library:** Mongoose (Strict Schema Validation).
*   **Environment:** Serverless / Edge compatible (cached connection).

## 3. Mongoose Schemas

### A. User Schema (`User`)
*Purpose: Authentication and Rate Limiting.*

```typescript
const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  image: String,
  credits: { type: Number, default: 3 }, // Daily limit
  createdAt: { type: Date, default: Date.now },
});
```

### B. Project Schema (`Project`)
*Purpose: The core entity storing the "Idea" and the "Interrogation Context".*

```typescript
const ProjectSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "Untitled Project" },
  
  // 1. The Seed
  rawIdea: { type: String, required: true },
  
  // 2. The Deep-Dive Context (10-30 Questions)
  context: [{
    questionId: String,
    questionText: String,
    userAnswer: String, // Null until answered
    category: String,   // e.g., "Auth", "Database", "UI"
    isFluff: Boolean,   // Marked by Scope Rationalization
  }],

  // 3. Workflow State
  status: { 
    type: String, 
    enum: ["DRAFT", "ANALYZING", "WAITING_INPUT", "GENERATING", "COMPLETED"], 
    default: "DRAFT" 
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

### C. Artifact Schema (`Artifact`)
*Purpose: Stores the generated PRDs. One document per PRD type per Project.*

```typescript
const ArtifactSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  
  // The Blueprint Suite Types
  type: { 
    type: String, 
    enum: [
      "DESIGN_SYSTEM", 
      "FRONTEND_SPEC", 
      "BACKEND_SPEC", 
      "SECURITY_SPEC", 
      "DATABASE_SCHEMA", 
      "MVP_FEATURES"
    ], 
    required: true 
  },
  
  content: { type: String, required: true }, // Markdown content
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});
```

## 4. Indexes & Performance
*   **Artifacts:** Compound index on `{ projectId: 1, type: 1 }` for O(1) retrieval of specific specs.
*   **Projects:** Index on `{ userId: 1, updatedAt: -1 }` for Dashboard queries.

## 5. Data Retention
*   **Interrogation Data:** Retained indefinitely to allow "Re-Architecting" (regenerating PRDs with new context).
