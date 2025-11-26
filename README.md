# The Architect

**The Architect** is an AI-powered tool designed to help developers stop hallucinating code and start building right. It interrogates your ideas, catches gaps in your logic, and generates bulletproof technical blueprints (PRDs, frontend/backend specs) before you write a single line of code.

## 🚀 Features

*   **Idea Interrogation**: A "Critic" AI that challenges your assumptions and clarifies ambiguity.
*   **Blueprint Generation**: Automatically generates detailed `backend.md` and `frontend.md` specifications.
*   **Visualizations**: Dynamic, animated visualizations of your project's architecture and logic flows.
*   **Waitlist Integration**: Google Sheets-backed waitlist for early access.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Database**: Google Sheets (for Waitlist)

## 📦 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/vinodkrishna221/architect.git
    cd architect
    ```

2.  **Install dependencies**:
    ```bash
    cd apps/web
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env.local` file in `apps/web` with your Google Sheets credentials (see [Setup Guide](./apps/web/google_sheets_setup_guide.md)).

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
