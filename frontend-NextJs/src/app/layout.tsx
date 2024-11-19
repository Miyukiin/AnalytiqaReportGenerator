import './globals.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Analytiqa</title>
        {/* Import Wix Madefor Text font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Wix+Madefor+Text:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-wixmadefortext bg-white">
        {/* Header */}
        <header className="bg-white shadow-md rounded-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-4">
            {/* Logo */}
            <img
              src="/images/analytiqa_header.png"
              alt="Analytiqa Logo"
              className="h-10 w-auto"
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center">
          <div className="w-full">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white text-center py-6">
          <p className="text-sm mt-2">&copy; 2024, ANALYTIQA. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
