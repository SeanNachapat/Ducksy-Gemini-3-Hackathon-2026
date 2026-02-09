export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-neutral-950 p-8 font-sans text-neutral-200">
            <div className="max-w-3xl mx-auto space-y-8">
                <header className="border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
                    <p className="text-neutral-400">Last updated: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="prose prose-invert prose-neutral max-w-none">
                    <p className="text-lg leading-relaxed">
                        Ducksy ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how our desktop application handles your data, specifically in relation to Google services.
                        <strong> We do not collect, store, or share your personal data on our servers.</strong>
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4 text-white">1. Data Collection and Usage</h2>
                    <p>
                        Ducksy is a local-first application. All data processing occurs locally on your device or directly between your device and the APIs you configure (e.g., Google Gemini, Google Calendar).
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li><strong>Audio and Transcription:</strong> Audio data is processed in real-time to provide transcriptions. This data is not stored by us.</li>
                        <li><strong>Google User Data:</strong> If you choose to connect your Google Calendar, the application accesses your calendar events solely to display them to you and allow you to manage them within the app.</li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-8 mb-4 text-white">2. Google API Services User Data Policy</h2>
                    <p className="p-4 bg-white/5 rounded-lg border border-white/10">
                        Ducksy's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4 text-white">3. Data Sharing and Disclosure</h2>
                    <p>We do not share your personal data with third parties, except as described below:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li><strong>Google Services:</strong> Data required to perform requested actions (e.g., creating a calendar event) is sent directly to Google APIs.</li>
                        <li><strong>Legal Requirements:</strong> We may disclose information if required by law, though we generally possess no user data to disclose.</li>
                    </ul>

                    <h2 className="text-xl font-semibold mt-8 mb-4 text-white">4. Data Storage and Security</h2>
                    <p>All application data, including API keys and settings, is stored locally on your device. You are responsible for maintaining the security of your device.</p>

                    <h2 className="text-xl font-semibold mt-8 mb-4 text-white">5. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us via our GitHub repository issues page.</p>
                </div>
            </div>
        </div>
    )
}
