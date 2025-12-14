import { useState, useEffect } from 'react';

/**
 * CanvaDesignsDemo - Showcase your latest Canva designs
 * This component demonstrates different ways to integrate Canva content into your app
 */
function CanvaDesignsDemo() {
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [exportFormat, setExportFormat] = useState('png');

  // Your latest Canva designs
  const designs = [
    {
      id: 'DAG5zEkmdtg',
      title: 'Neutral Soft Meditative Mobile Video',
      thumbnail: 'https://design.canva.ai/Y0NWwElzUqtZ6Bm',
      format: 'Mobile Video',
      size: '335x595',
      editUrl: 'https://www.canva.com/d/puTk9iP7KIj90WO',
      exportFormats: ['pdf', 'jpg', 'png', 'gif', 'mp4'],
      useCases: [
        'Meditation session backgrounds',
        'Loading screen animations',
        'Calming visual content in Feed',
        'Social media stories'
      ]
    },
    {
      id: 'DAG5m8gyXuo',
      title: 'Instagram Post - Embrace your natural journey',
      thumbnail: 'https://design.canva.ai/TuM6SL9VQEKNuOx',
      format: 'Instagram Post',
      size: '400x500',
      editUrl: 'https://www.canva.com/d/6FuDkLc9dHxwQDI',
      exportFormats: ['pdf', 'jpg', 'png', 'gif', 'mp4'],
      useCases: [
        'Social sharing cards',
        'Practice completion shareouts',
        'Onboarding step backgrounds',
        'Marketing content'
      ]
    },
    {
      id: 'DAG5m6PdwGw',
      title: 'Mobile Video Design',
      thumbnail: 'https://design.canva.ai/dYDeKXeItMtpFq-',
      format: 'Mobile Video',
      size: '335x596',
      editUrl: 'https://www.canva.com/d/aOGTkYRpU0kH-C0',
      exportFormats: ['pdf', 'jpg', 'png', 'gif', 'mp4'],
      useCases: [
        'Splash screen background',
        'Video content in Feed',
        'Breathing exercise visuals',
        'Ambient animations'
      ]
    },
    {
      id: 'DAG48HIoozA',
      title: 'Email Design',
      thumbnail: 'https://design.canva.ai/_GoA68mPCo1qMXh',
      format: 'Email',
      size: '376x532',
      editUrl: 'https://www.canva.com/d/0tZlCt5TzGxf02q',
      exportFormats: ['pdf', 'jpg', 'png', 'gif', 'mp4'],
      useCases: [
        'Email newsletters',
        'User notifications',
        'Marketing campaigns',
        'Welcome sequences'
      ]
    }
  ];

  const integrationMethods = [
    {
      method: 'Static Images',
      description: 'Export as PNG/JPG for static visuals',
      steps: [
        'Export design from Canva as PNG (high quality)',
        'Place in /public/assets/canva/ folder',
        'Import in component: <img src="/assets/canva/design.png" />',
        'Best for: backgrounds, icons, static content'
      ],
      example: `
// Example: Using exported PNG as background
<div 
  className="w-full h-screen bg-cover bg-center"
  style={{ backgroundImage: 'url(/assets/canva/meditation-bg.png)' }}
>
  <YourContent />
</div>
      `
    },
    {
      method: 'Animated Content',
      description: 'Export as MP4/GIF for motion graphics',
      steps: [
        'Export design from Canva as MP4 or GIF',
        'Place in /public/assets/videos/ folder',
        'Use <video> tag with autoplay and loop',
        'Best for: ambient backgrounds, loading animations'
      ],
      example: `
// Example: Looping background video
<video 
  autoPlay 
  loop 
  muted 
  playsInline
  className="absolute inset-0 w-full h-full object-cover"
>
  <source src="/assets/videos/meditative-loop.mp4" type="video/mp4" />
</video>
      `
    },
    {
      method: 'Lottie Animations',
      description: 'Convert to Lottie JSON for interactive animations',
      steps: [
        'Use LottieFiles Canva plugin to convert',
        'Export as .json file',
        'Place in /src/assets/lottie/ folder',
        'Use lottie-react library to render',
        'Best for: interactive elements, smooth animations'
      ],
      example: `
// Example: Lottie animation (you already have this setup!)
import Lottie from 'lottie-react';
import meditationAnim from '../assets/lottie/meditation.json';

<Lottie 
  animationData={meditationAnim}
  loop={true}
  className="w-64 h-64"
/>
      `
    },
    {
      method: 'Direct Canva Links',
      description: 'Link directly to Canva for editing',
      steps: [
        'Use view_url for public viewing',
        'Use edit_url for team editing',
        'Great for documentation/style guides',
        'Best for: team collaboration, design references'
      ],
      example: `
// Example: Link to Canva for design updates
<a 
  href="https://www.canva.com/d/..."
  target="_blank"
  className="text-blue-600 underline"
>
  View/Edit Design in Canva
</a>
      `
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcf8f2] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Canva Designs Integration
          </h1>
          <p className="text-lg text-gray-600">
            Your latest Canva designs and how to use them in magicwork
          </p>
        </div>

        {/* Design Gallery */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Latest Designs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {designs.map((design) => (
              <div
                key={design.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
                  selectedDesign?.id === design.id ? 'ring-4 ring-[#8fb569]' : ''
                }`}
                onClick={() => setSelectedDesign(design)}
              >
                <div className="aspect-[3/4] bg-gray-100 relative">
                  <img
                    src={design.thumbnail}
                    alt={design.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {design.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {design.format}
                    </span>
                    <span className="text-xs">{design.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Selected Design Details */}
        {selectedDesign && (
          <section className="mb-16 bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Design Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedDesign.title}
                </h2>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Format & Size
                  </h3>
                  <p className="text-gray-600">
                    {selectedDesign.format} • {selectedDesign.size}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Export Formats Available
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDesign.exportFormats.map((format) => (
                      <span
                        key={format}
                        className="bg-[#8fb569] text-white px-3 py-1 rounded-full text-sm uppercase"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Suggested Use Cases
                  </h3>
                  <ul className="space-y-2">
                    {selectedDesign.useCases.map((useCase, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#8fb569] mt-1">✓</span>
                        <span className="text-gray-600">{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-4">
                  <a
                    href={selectedDesign.editUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#8fb569] text-white px-6 py-3 rounded-lg hover:bg-[#7a9e5a] transition-colors"
                  >
                    Edit in Canva
                  </a>
                  <button
                    onClick={() => {
                      alert('Export feature: Use Canva API to export directly, or manually export from Canva');
                    }}
                    className="border-2 border-[#8fb569] text-[#8fb569] px-6 py-3 rounded-lg hover:bg-[#8fb569] hover:text-white transition-colors"
                  >
                    Export Design
                  </button>
                </div>
              </div>

              {/* Right: Preview */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Preview</h3>
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                  <img
                    src={selectedDesign.thumbnail}
                    alt={selectedDesign.title}
                    className="max-w-full max-h-[500px] object-contain rounded"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Integration Methods */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Integration Methods
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {integrationMethods.map((method, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {method.method}
                </h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    {method.steps.map((step, stepIdx) => (
                      <li key={stepIdx}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto">
                  <pre className="text-xs">
                    <code>{method.example}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Project Structure Suggestion */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recommended Folder Structure
          </h2>
          <div className="bg-gray-900 text-gray-100 rounded p-6 overflow-x-auto">
            <pre className="text-sm">
{`public/
  assets/
    canva/
      images/          # Static PNG/JPG exports
        meditation-bg.png
        embrace-journey.png
        email-template.jpg
      videos/          # MP4/GIF exports
        meditative-loop.mp4
        breathing-anim.gif
      
src/
  assets/
    lottie/          # Lottie JSON files (already exists!)
      meditation.json
      breathing-circle.json
      
  components/
    canva/           # Canva-specific components
      CanvaBackground.jsx
      CanvaVideo.jsx
      CanvaShareCard.jsx`}
            </pre>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-8 bg-[#8fb569] text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <span>Choose which designs you want to export</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <span>Select the best format (PNG for static, MP4 for videos, Lottie for interactions)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <span>Download from Canva and organize in your project folders</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <span>Create reusable components to display the content</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default CanvaDesignsDemo;










