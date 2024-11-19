import './globals.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Next.js Tailwind Starter</title>
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-xl font-bold">My Next.js App</h1>
        </header>
        <main className="flex-grow p-8">{children}</main>
        <footer className="bg-gray-200 text-center py-4">
          <p>&copy; 2024 My Next.js App</p>
        </footer>
      </body>
    </html>
  );
}
