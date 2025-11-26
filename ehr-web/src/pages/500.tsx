import Link from 'next/link'

export default function Custom500() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="max-w-md space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">500 error</p>
        <h1 className="text-3xl font-bold text-gray-900">Something went wrong</h1>
        <p className="text-gray-600">
          We ran into an issue while processing your request. Please try again in a moment or go back
          to the dashboard.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Go back home
          </Link>
          <a
            href=""
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
          >
            Try again
          </a>
        </div>
      </div>
    </main>
  )
}
