class AppConfig {
  // Supabase Configuration (updated to new project)
  static const String supabaseUrl = 'https://tbfwvdcvohmykwdfgiqy.supabase.co';
  static const String supabaseAnonKey = 'sb_publishable_jKfaSWRtxFAR47a6ruk4yQ_vOxPYeuU';
  
  // Deep Link Configuration
  static const String deepLinkScheme = 'magicwork';
  static const String authCallbackPath = '/auth-callback';
  
  // API Configuration
  static const String apiBaseUrl = 'https://magicwork.vercel.app/api';
  
  // OpenAI Configuration
  static const String openaiApiKey = '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';
  static const String openaiBaseUrl = 'https://api.openai.com/v1';
  
  // Alternative AI Service API Keys (optional, for future use)
  // static const String sunoApiKey = ''; // For music generation
  // static const String udioApiKey = ''; // For music generation
  // static const String elevenLabsApiKey = ''; // For premium voice generation
  // static const String runwayApiKey = ''; // For video generation (alternative to Sora)
  
  // App Info
  static const String appName = 'MagicWork';
  static const String appVersion = '1.0.0';
}
