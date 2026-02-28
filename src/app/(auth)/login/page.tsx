import { signIn } from "@/lib/auth"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Top/Left side - Image */}
      <div className="relative h-64 sm:h-80 lg:h-auto lg:w-1/2 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/cycling-ai.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900 lg:bg-gradient-to-r lg:from-slate-900/90 lg:via-slate-900/70 lg:to-transparent" />
        
        {/* Mobile overlay content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center lg:hidden">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">VeloIQ</h1>
          <p className="text-slate-300">AI-Powered Cycling Analytics</p>
        </div>
        
        {/* Desktop content */}
        <div className="hidden lg:flex relative z-10 flex-col justify-end p-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="px-3 py-1 bg-indigo-500/20 backdrop-blur-sm rounded-full text-indigo-300 text-sm font-medium">
              AI-Powered
            </div>
            <div className="px-3 py-1 bg-purple-500/20 backdrop-blur-sm rounded-full text-purple-300 text-sm font-medium">
              Smart Training
            </div>
          </div>
          <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
            Train Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Ride Faster.
            </span>
          </h2>
          <p className="text-slate-300 text-lg max-w-md">
            AI-powered cycling analytics. Track your power, analyze your performance, 
            and optimize your training with intelligent insights.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-slate-900 p-8">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="hidden lg:flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to VeloIQ</h1>
              <p className="text-slate-400">Sign in to access your training dashboard</p>
            </div>
            
            <form
              action={async () => {
                "use server"
                await signIn("google", { redirectTo: "/" })
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-medium py-3.5 px-4 rounded-xl hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
