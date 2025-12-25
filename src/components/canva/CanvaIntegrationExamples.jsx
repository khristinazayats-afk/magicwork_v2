import { useState } from 'react';
import CanvaBackground from './CanvaBackground';
import CanvaShareCard from './CanvaShareCard';

/**
 * CanvaIntegrationExamples - Real-world examples of using Canva designs
 * This shows practical implementations for the magiwork app
 */
function CanvaIntegrationExamples() {
  const [currentExample, setCurrentExample] = useState('background-image');

  const examples = [
    {
      id: 'background-image',
      title: 'Static Background',
      description: 'Use Canva designs as beautiful backgrounds for screens'
    },
    {
      id: 'background-video',
      title: 'Video Background',
      description: 'Animated Canva videos for immersive experiences'
    },
    {
      id: 'share-card',
      title: 'Share Card',
      description: 'Social sharing cards from Canva designs'
    },
    {
      id: 'email-template',
      title: 'Email Template',
      description: 'Use Canva email designs in your app'
    }
  ];

  const renderExample = () => {
    switch (currentExample) {
      case 'background-image':
        return (
          <div className="h-[600px]">
            <CanvaBackground
              type="image"
              src="https://design.canva.ai/TuM6SL9VQEKNuOx"
              overlay="dark"
            >
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center text-white">
                  <h1 className="text-5xl font-bold mb-4">
                    Embrace Your Journey
                  </h1>
                  <p className="text-xl mb-8 max-w-2xl mx-auto">
                    This is a Canva Instagram post used as a background with dark overlay
                  </p>
                  <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                    Begin Practice
                  </button>
                </div>
              </div>
            </CanvaBackground>
          </div>
        );

      case 'background-video':
        return (
          <div className="h-[600px]">
            <CanvaBackground
              type="video"
              src="https://design.canva.ai/Y0NWwElzUqtZ6Bm"
              overlay="light"
            >
              <div className="flex items-center justify-center h-full p-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 max-w-2xl">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Meditative Experience
                  </h1>
                  <p className="text-lg text-gray-700 mb-6">
                    Canva video playing in the background creates a calming atmosphere.
                    Perfect for meditation or breathing exercises.
                  </p>
                  <div className="flex gap-4">
                    <button className="bg-[#8fb569] text-white px-6 py-3 rounded-lg hover:bg-[#7a9e5a] transition-colors">
                      Start Session
                    </button>
                    <button className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </CanvaBackground>
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
              <p className="text-sm">
                <strong>Note:</strong> This example uses a thumbnail URL. In production, export the design as MP4 and host it locally.
              </p>
            </div>
          </div>
        );

      case 'share-card':
        return (
          <div className="flex items-center justify-center min-h-[600px] p-8 bg-gradient-to-br from-purple-100 to-pink-100">
            <div className="max-w-md w-full">
              <CanvaShareCard
                title="Practice Complete! 🎉"
                description="You've completed a 10-minute meditation session"
                imageSrc="https://design.canva.ai/TuM6SL9VQEKNuOx"
                onShare={() => alert('Share to social media! Could open native share dialog.')}
                onDownload={() => alert('Download image! Could save to device.')}
              />
            </div>
          </div>
        );

      case 'email-template':
        return (
          <div className="min-h-[600px] p-8 bg-gray-100">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Email Header */}
              <div className="bg-[#8fb569] text-white p-8">
                <h1 className="text-3xl font-bold">Weekly Insights</h1>
                <p className="text-white/90 mt-2">Your mindfulness journey update</p>
              </div>

              {/* Canva Email Design */}
              <div className="p-0">
                <img
                  src="https://design.canva.ai/_GoA68mPCo1qMXh"
                  alt="Email content"
                  className="w-full"
                />
              </div>

              {/* Email Footer */}
              <div className="p-8 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  This email template was designed in Canva and exported as a high-quality image.
                </p>
                <div className="mt-4 flex gap-4">
                  <button className="text-[#8fb569] hover:underline text-sm">
                    View in Browser
                  </button>
                  <button className="text-[#8fb569] hover:underline text-sm">
                    Unsubscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f2]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Canva Integration Examples
          </h1>
          <p className="text-lg text-gray-600">
            See how to use your Canva designs in real magiwork screens
          </p>
        </div>
      </div>

      {/* Example Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-4 overflow-x-auto py-4">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setCurrentExample(example.id)}
                className={`px-6 py-3 rounded-lg whitespace-nowrap transition-colors ${
                  currentExample === example.id
                    ? 'bg-[#8fb569] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {example.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Example Display */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {examples.find(e => e.id === currentExample)?.title}
          </h2>
          <p className="text-gray-600">
            {examples.find(e => e.id === currentExample)?.description}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {renderExample()}
        </div>

        {/* Code Example */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Code Example</h3>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm">
              <code>{getCodeExample(currentExample)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCodeExample(exampleId) {
  switch (exampleId) {
    case 'background-image':
      return `import CanvaBackground from './components/canva/CanvaBackground';

function MyScreen() {
  return (
    <CanvaBackground
      type="image"
      src="/assets/canva/images/embrace-journey.png"
      overlay="dark"
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white">
          <h1>Your Content Here</h1>
          <button>Call to Action</button>
        </div>
      </div>
    </CanvaBackground>
  );
}`;

    case 'background-video':
      return `import CanvaBackground from './components/canva/CanvaBackground';

function MeditationScreen() {
  return (
    <CanvaBackground
      type="video"
      src="/assets/canva/videos/meditative-loop.mp4"
      overlay="light"
    >
      <div className="flex items-center justify-center h-full">
        {/* Your meditation UI */}
      </div>
    </CanvaBackground>
  );
}`;

    case 'share-card':
      return `import CanvaShareCard from './components/canva/CanvaShareCard';

function PracticeCompleteScreen() {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'My Practice',
        text: 'I just completed a meditation!',
        url: window.location.href
      });
    }
  };

  const handleDownload = () => {
    // Download image logic
  };

  return (
    <CanvaShareCard
      title="Practice Complete! 🎉"
      description="You've completed a 10-minute session"
      imageSrc="/assets/canva/images/embrace-journey.png"
      onShare={handleShare}
      onDownload={handleDownload}
    />
  );
}`;

    case 'email-template':
      return `// Email template using Canva design
const emailHTML = \`
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="background: #8fb569; color: white; padding: 32px;">
      <h1>Weekly Insights</h1>
    </div>
    <img 
      src="https://your-domain.com/assets/canva/email-template.jpg"
      alt="Email content"
      style="width: 100%; display: block;"
    />
    <div style="padding: 32px;">
      <p>Your custom email content...</p>
    </div>
  </div>
\`;

// Send via your email service
await sendEmail({
  to: user.email,
  subject: 'Weekly Insights',
  html: emailHTML
});`;

    default:
      return '';
  }
}

export default CanvaIntegrationExamples;










