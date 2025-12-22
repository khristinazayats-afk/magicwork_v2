# AI Agents Found in Source Files

## 📍 Location Summary

Found **3 AI Agent Services** that create content for the meditation platform:

### 1. **AI Practice Generator** 🧘
**Location**: `mobile-app-flutter/lib/services/ai_practice_generator.dart`

**What it creates**: Meditation practice content (scripts/guided meditations)

**API Endpoint**: `POST ${AppConfig.apiBaseUrl}/generate-practice`

**Input Parameters**:
- `emotionalState` (String) - User's current emotional state
- `durationMinutes` (int) - Desired practice duration

**Output**: Returns generated practice content as a String

**Key Features** (from practice-generation.mdc):
- Maps 5-point emotional scale to practice content parameters
- Dynamic pacing adjustment:
  - Guided mode: 120 words/minute
  - Minimal mode: 30 words/minute
- Incorporates desired emotional outcomes into narrative flow

---

### 2. **AI Image Generator** 🎨
**Location**: `mobile-app-flutter/lib/services/ai_image_generator.dart`

**What it creates**: Images based on prompts

**API Endpoint**: `POST ${AppConfig.apiBaseUrl}/generate-image`

**Input Parameters**:
- `prompt` (String) - Image generation prompt

**Output**: Returns image URL as a String

---

### 3. **AI Video Generator** 🎬
**Location**: `mobile-app-flutter/lib/services/ai_video_generator.dart`

**What it creates**: Videos based on prompts

**API Endpoint**: `POST ${AppConfig.apiBaseUrl}/generate-video`

**Input Parameters**:
- `prompt` (String) - Video generation prompt

**Output**: Returns video URL as a String

---

## ⚠️ Missing Backend Implementation

**Status**: The client-side services exist, but the backend API endpoints are **NOT FOUND** in the `api/` directory.

**Current API Directory Contents**:
```
api/
  - config/
    - gamification.js
  - content-assets.js
  - content-sets.js
  - db/
    - client.js
    - index.js
    - schema.sql
  - events.js
  - progress.js
```

**Missing Endpoints**:
- ❌ `api/generate-practice.js` (or `/api/generate-practice`)
- ❌ `api/generate-image.js` (or `/api/generate-image`)
- ❌ `api/generate-video.js` (or `/api/generate-video`)

---

## 🔍 Related Files Found

### Documentation
- ✅ `.cursor/rules/practice-generation.mdc` - Practice generation system documentation
- ✅ `mobile-app-flutter/AI_CONTENT_SETUP.md` - AI content setup guide
- ✅ `mobile-app-flutter/OPENAI_API_KEY_SETUP.md` - OpenAI API key setup
- ✅ `mobile-app-flutter/AI_SERVICES_TEST_RESULTS.md` - Test results

### React Native Version
- ✅ `mobile-app/services/aiPracticeGenerator.js` - React Native version (empty file)

### Configuration
- Need to check: `mobile-app-flutter/lib/config/app_config.dart` for `apiBaseUrl`

---

## 📝 Next Steps

1. **Create Backend API Endpoints**:
   - Create `api/generate-practice.js`
   - Create `api/generate-image.js`
   - Create `api/generate-video.js`

2. **Check Vercel Configuration**:
   - Verify `vercel.json` routes are configured
   - Ensure API endpoints are properly routed

3. **Check Environment Variables**:
   - Verify OpenAI API key is configured
   - Check for other AI service API keys (Anthropic, etc.)

4. **Review Documentation**:
   - Check `AI_CONTENT_SETUP.md` for setup instructions
   - Check `OPENAI_API_KEY_SETUP.md` for API key configuration

---

## 🔧 Implementation Needed

The backend endpoints need to:
1. Accept POST requests with the specified parameters
2. Call OpenAI/Anthropic/other AI service APIs
3. Process and format the response
4. Return the generated content as JSON

**Example Structure**:
```javascript
// api/generate-practice.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emotionalState, durationMinutes } = req.body;

  // Call AI service (OpenAI, Anthropic, etc.)
  // Process response
  // Return generated content

  return res.status(200).json({ content: generatedContent });
}
```

---

*Found 3 AI agent services in client code, but backend API endpoints are missing*


