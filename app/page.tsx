import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SOS</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">SOS Voice</span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Dashboard →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 mb-8">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
              Powered by BimpeAI Voice AI
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-6">
            SOS Voice
          </h1>

          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            One call can turn a crisis into a coordinated response.
          </p>

          <p className="text-base text-gray-400 dark:text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">
            Talk to SOS Voice. Tell us what happened. We'll understand the situation and prepare the
            next response — no app, no typing, no forms.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Open Dashboard
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors text-sm"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 dark:bg-gray-900 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
            How it works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: '📞',
                title: 'Call',
                desc: 'One phone number. No app, no login, no form.',
              },
              {
                step: '02',
                icon: '🗣️',
                title: 'Explain',
                desc: 'Speak naturally. Tell the AI what happened in your own words.',
              },
              {
                step: '03',
                icon: '🧠',
                title: 'AI Understands',
                desc: 'SOS Voice identifies the emergency, severity, location, and critical details.',
              },
              {
                step: '04',
                icon: '🚨',
                title: 'Response Routed',
                desc: 'A structured incident is created and the right responders are identified.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5"
              >
                <p className="text-xs font-mono text-gray-400 mb-2">{s.step}</p>
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">{s.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Flow diagram */}
          <div className="mt-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-4 text-center">
              System Flow
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-mono text-gray-500 dark:text-gray-400">
              {[
                'CALLER',
                '→',
                'BimpeAI Voice',
                '→',
                'SOS Voice Agent',
                '→',
                'Backend',
                '→',
                'Incident Engine',
                '→',
                'Responder Routing',
                '→',
                'Dashboard',
              ].map((item, i) => (
                <span
                  key={i}
                  className={
                    item === '→'
                      ? 'text-gray-300 dark:text-gray-600'
                      : 'px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300'
                  }
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency categories */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Emergency Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { icon: '🏥', label: 'MEDICAL', color: 'border-red-200 dark:border-red-800' },
              { icon: '🔥', label: 'FIRE', color: 'border-orange-200 dark:border-orange-800' },
              { icon: '🚔', label: 'POLICE', color: 'border-blue-200 dark:border-blue-800' },
              { icon: '🚗', label: 'ACCIDENT', color: 'border-yellow-200 dark:border-yellow-800' },
              { icon: '⚠️', label: 'OTHER', color: 'border-gray-200 dark:border-gray-700' },
            ].map((c) => (
              <div
                key={c.label}
                className={`rounded-xl border ${c.color} bg-white dark:bg-gray-900 p-4 text-center`}
              >
                <p className="text-2xl mb-1">{c.icon}</p>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo notice */}
      <section className="bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-800 px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-semibold">Hackathon MVP — Demo Mode</span>
            {' '}· External emergency-centre contact is simulated. No real emergency service is contacted.
            The voice interaction and incident workflow are real.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 px-6 py-6 text-center">
        <p className="text-xs text-gray-400">
          SOS Voice · Powered by BimpeAI Voice AI · Built for Nigeria
        </p>
      </footer>
    </main>
  );
}
