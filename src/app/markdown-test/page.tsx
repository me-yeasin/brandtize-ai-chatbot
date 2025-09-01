import MarkdownTest from "../_component/_message-container-comp/markdown_test";

export default function MarkdownTestPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="p-4 bg-gray-900">
        <h1 className="text-2xl font-bold text-white">
          Markdown Rendering Test Page
        </h1>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <MarkdownTest />
      </main>

      <footer className="p-4 bg-gray-900 text-white text-center">
        <p>Chat Application Markdown Renderer Demo</p>
      </footer>
    </div>
  );
}
