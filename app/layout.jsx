export const metadata = {
  title: "FMC AI Chat",
  description: "Live AI Chatbot powered by multiple models (GPT-5, Gemini, DeepSeek, etc.)"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
