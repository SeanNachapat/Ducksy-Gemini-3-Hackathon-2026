export default function TypesOfService() {
    return (
        <div className="min-h-screen bg-neutral-950 p-8 font-sans text-neutral-200">
            <div className="max-w-3xl mx-auto space-y-8">
                <header className="border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
                    <p className="text-neutral-400">Last updated: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="prose prose-invert prose-neutral max-w-none">
                    <p className="text-lg leading-relaxed">
                        Welcome to Ducksy. By downloading, installing, or using our application, you agree to these terms.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4 text-white">1. License and Use</h2>
                    <p>
                        Ducksy is an open-source tool provided for personal, educational, and development use. You are granted a limited, non-exclusive license to use the software "as is".
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4 text-white">2. Google Services</h2>
                    <p>
                        Our application integrates with Google Services (specifically Google Calendar and Gemini). By using these features, you verify that you agree to be bound by <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Google's Terms of Service</a>.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4 text-white">3. User Responsibilities</h2>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>You are responsible for managing your own API keys and credentials.</li>
                        <li>You agree not to use the application for any illegal or unauthorized purpose.</li>
                        <li>You are responsible for the security of your local data.</li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-8 mb-4 text-white">4. Disclaimer of Warranties</h2>
                    <p>
                        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4 text-white">5. Limitation of Liability</h2>
                    <p>
                        In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
                    </p>
                </div>
            </div>
        </div>
    )
}
