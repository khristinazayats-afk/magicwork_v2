/**
 * Multi-language translations system
 * Automatically detects user location and displays content in their language
 */

export const translations = {
  en: {
    // Navigation & Common
    getStarted: 'Get Started',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    profile: 'Profile',
    settings: 'Settings',
    back: 'Back',
    next: 'Next',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',

    // Landing Page
    heroTitle: 'Meditation',
    heroSubtitle: 'for Every Body',
    heroDescription: 'We believe meditation should be present in life every day. Let us help you find the right practice for you. Explore our AI-powered personalized practices designed for your unique journey.',
    features: 'Features',
    practices: 'Practices',
    yourJourney: 'Your Journey',
    pricing: 'Pricing',
    about: 'About',
    soundToggle: 'Toggle Sound',
    meditationEveryDay: 'Meditation for Every Body',
    personalizedJourney: 'Your Personalized Journey',
    discoverFeatures: 'Discover features designed to support your meditation practice every step of the way',
    aiPoweredPractices: 'AI-Powered Practices',
    aiPracticesDesc: 'Personalized meditation scripts generated based on your emotional state and intentions',
    ambientSoundscapes: 'Ambient Soundscapes',
    ambientSoundDesc: 'Immersive audio environments from forest birds to ocean waves to enhance your practice',
    progressTracking: 'Progress Tracking',
    progressTrackingDesc: 'Track your emotional journey with our 10-level vibe system and monthly progression tiers',
    joinThousands: 'Join thousands discovering peace, clarity, and transformation through personalized meditation',

    // Practice Descriptions (Main Feed)
    desc_gentleDeStress: 'A space to come back to center, together.',
    desc_slowMorning: 'A space to begin the day slowly, side by side.',
    desc_takeAWalk: 'A quiet space for mindful steps.',
    desc_drawYourFeels: 'A creative space where emotions flow by hand.',
    desc_moveAndCool: 'A space to release energy and find ease.',
    desc_tapToGround: 'A grounding space to reconnect with your body.',
    desc_breatheToRelax: 'A space for slow breaths and unwinding.',
    desc_getInTheFlowState: 'A space to focus on what matters.',
    desc_driftIntoSleep: 'A space to slow down and drift off together.',

    // Practice Cues (Instructions when joined)
    cue_gentleDeStress: 'Drop your shoulders. Breathe out slowly.',
    cue_slowMorning: 'Notice three things you are grateful for.',
    cue_takeAWalk: 'Count ten soft steps in silence.',
    cue_drawYourFeels: 'Pick a color. One continuous line.',
    cue_moveAndCool: 'Sway side to side with your breath.',
    cue_tapToGround: 'Press both feet into the floor.',
    cue_breatheToRelax: 'Inhale 4, exhale 6.',
    cue_getInTheFlowState: 'Ten brisk breaths, then rest.',
    cue_driftIntoSleep: 'Count from 30 down to 0.',

    // Subscription & Pricing
    subscription: 'Subscription',
    currentPlan: 'Current Plan',
    upgradePlan: 'Upgrade Plan',
    changePlan: 'Change Plan',
    cancelSubscription: 'Cancel Subscription',
    freePlan: 'Free Plan',
    starterPlan: 'Starter Plan',
    proPlan: 'Pro Plan',
    unlimitedPlan: 'Unlimited Plan',
    perMonth: '/month',
    perYear: '/year',
    selectPlan: 'Select Plan',
    subscribNow: 'Subscribe Now',
    mostPopular: 'Most Popular',
    
    // Practice Credits
    practiceCredits: 'Practice Credits',
    buyCredits: 'Buy Practice Credits',
    creditsRemaining: 'practices remaining this month',
    practicesUsed: 'Practices Used',
    needMore: 'Need More Practices?',
    purchaseAdditional: 'Purchase additional practice credits anytime',

    // Features
    feature_unlimited: 'Unlimited AI practices',
    feature_practices: 'AI practices per month',
    feature_ambient: 'ambient sounds',
    feature_voice: 'voice options',
    feature_support: 'support',
    feature_analytics: 'Advanced analytics',
    feature_export: 'Export practices',
    feature_api: 'API access',
    
    // Practices
    practices: 'Practices',
    quickPractices: 'Quick Practices',
    customPractice: 'Custom Practice',
    startPractice: 'Start Practice',
    duration: 'Duration',
    minutes: 'minutes',
    
    // Emotional States
    emotionalState: 'How are you feeling?',
    calm: 'Calm',
    stressed: 'Stressed',
    anxious: 'Anxious',
    energized: 'Energized',
    tired: 'Tired',
    focused: 'Focused',

    // Confirmation Messages
    confirmCancel: 'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
    subscriptionCancelled: 'Subscription cancelled. You can continue using free features.',
    upgradeSuccess: 'Successfully upgraded',
    purchaseSuccess: 'Successfully purchased',
    
    // Errors
    errorLoading: 'Error loading data',
    errorPurchase: 'Purchase failed. Please try again.',
    errorUpgrade: 'Upgrade failed. Please try again.',
  },

  es: {
    // Navegación y Común
    getStarted: 'Comenzar',
    signIn: 'Iniciar Sesión',
    signOut: 'Cerrar Sesión',
    profile: 'Perfil',
    settings: 'Configuración',
    back: 'Atrás',
    next: 'Siguiente',
    save: 'Guardar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',

    // Página de Inicio
    heroTitle: 'Meditación',
    heroSubtitle: 'para Todos',
    heroDescription: 'Creemos que la meditación debe estar presente en la vida todos los días. Dejanos ayudarte a encontrar la práctica adecuada para ti. Explora nuestras prácticas personalizadas impulsadas por IA diseñadas para tu viaje único.',
    features: 'Características',
    practices: 'Prácticas',
    yourJourney: 'Tu Viaje',
    soundToggle: 'Alternar Sonido',
    personalizedJourney: 'Tu Viaje Personalizado',
    discoverFeatures: 'Descubre características diseñadas para apoyar tu práctica de meditación en cada paso del camino',
    aiPoweredPractices: 'Prácticas Impulsadas por IA',
    aiPracticesDesc: 'Guiones de meditación personalizados generados según tu estado emocional e intenciones',
    ambientSoundscapes: 'Paisajes Sonoros Ambientales',
    ambientSoundDesc: 'Entornos de audio inmersivos desde aves del bosque hasta olas del océano para mejorar tu práctica',
    progressTracking: 'Seguimiento de Progreso',
    progressTrackingDesc: 'Sigue tu viaje emocional con nuestro sistema de vibra de 10 niveles y niveles de progresión mensual',
    joinThousands: 'Únete a miles descubriendo paz, claridad y transformación a través de meditación personalizada',
    back: 'Atrás',
    next: 'Siguiente',
    save: 'Guardar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',

    // Página Principal
    heroTitle: 'Encuentra Tu Paz Interior',
    heroSubtitle: 'Prácticas de meditación impulsadas por IA diseñadas para tu viaje único',
    heroDescription: 'Creemos que la meditación debe estar presente en la vida todos los días. Déjanos ayudarte a encontrar la práctica adecuada para ti.',
    features: 'Características',
    pricing: 'Precios',
    about: 'Acerca de',

    // Suscripción y Precios
    subscription: 'Suscripción',
    currentPlan: 'Plan Actual',
    upgradePlan: 'Mejorar Plan',
    changePlan: 'Cambiar Plan',
    cancelSubscription: 'Cancelar Suscripción',
    freePlan: 'Plan Gratuito',
    starterPlan: 'Plan Inicial',
    proPlan: 'Plan Pro',
    unlimitedPlan: 'Plan Ilimitado',
    perMonth: '/mes',
    perYear: '/año',
    selectPlan: 'Seleccionar Plan',
    subscribeNow: 'Suscribirse Ahora',
    mostPopular: 'Más Popular',
    
    // Créditos de Práctica
    practiceCredits: 'Créditos de Práctica',
    buyCredits: 'Comprar Créditos de Práctica',
    creditsRemaining: 'prácticas restantes este mes',
    practicesUsed: 'Prácticas Usadas',
    needMore: '¿Necesitas Más Prácticas?',
    purchaseAdditional: 'Compra créditos de práctica adicionales en cualquier momento',

    // Características
    feature_unlimited: 'Prácticas de IA ilimitadas',
    feature_practices: 'prácticas de IA por mes',
    feature_ambient: 'sonidos ambientales',
    feature_voice: 'opciones de voz',
    feature_support: 'soporte',
    feature_analytics: 'Análisis avanzados',
    feature_export: 'Exportar prácticas',
    feature_api: 'Acceso API',
    
    // Prácticas
    practices: 'Prácticas',
    quickPractices: 'Prácticas Rápidas',
    customPractice: 'Práctica Personalizada',
    startPractice: 'Iniciar Práctica',
    duration: 'Duración',
    minutes: 'minutos',
    
    // Estados Emocionales
    emotionalState: '¿Cómo te sientes?',
    calm: 'Tranquilo',
    stressed: 'Estresado',
    anxious: 'Ansioso',
    energized: 'Energizado',
    tired: 'Cansado',
    focused: 'Enfocado',

    // Mensajes de Confirmación
    confirmCancel: '¿Estás seguro de que deseas cancelar tu suscripción? Perderás el acceso a las funciones premium al final de tu período de facturación.',
    subscriptionCancelled: 'Suscripción cancelada. Puedes continuar usando las funciones gratuitas.',
    upgradeSuccess: 'Actualizado exitosamente',
    purchaseSuccess: 'Comprado exitosamente',
    
    // Errores
    errorLoading: 'Error al cargar datos',
    errorPurchase: 'Compra fallida. Por favor, inténtalo de nuevo.',
    errorUpgrade: 'Actualización fallida. Por favor, inténtalo de nuevo.',
  },

  fr: {
    // Navigation et Commun
    getStarted: 'Commencer',
    signIn: 'Se Connecter',
    signOut: 'Se Déconnecter',
    profile: 'Profil',
    settings: 'Paramètres',
    back: 'Retour',
    next: 'Suivant',
    save: 'Enregistrer',
    cancel: 'Annuler',
    close: 'Fermer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',

    // Page d'Accueil
    heroTitle: 'Trouvez Votre Paix Intérieure',
    heroSubtitle: 'Pratiques de méditation alimentées par IA conçues pour votre parcours unique',
    heroDescription: 'Nous croyons que la méditation doit être présente dans la vie quotidienne. Laissez-nous vous aider à trouver la pratique qui vous convient.',
    features: 'Fonctionnalités',
    pricing: 'Tarifs',
    about: 'À Propos',

    // Abonnement et Tarifs
    subscription: 'Abonnement',
    currentPlan: 'Plan Actuel',
    upgradePlan: 'Améliorer le Plan',
    changePlan: 'Changer de Plan',
    cancelSubscription: 'Annuler l\'Abonnement',
    freePlan: 'Plan Gratuit',
    starterPlan: 'Plan Débutant',
    proPlan: 'Plan Pro',
    unlimitedPlan: 'Plan Illimité',
    perMonth: '/mois',
    perYear: '/an',
    selectPlan: 'Sélectionner le Plan',
    subscribeNow: 'S\'abonner Maintenant',
    mostPopular: 'Plus Populaire',
    
    // Crédits de Pratique
    practiceCredits: 'Crédits de Pratique',
    buyCredits: 'Acheter des Crédits de Pratique',
    creditsRemaining: 'pratiques restantes ce mois',
    practicesUsed: 'Pratiques Utilisées',
    needMore: 'Besoin de Plus de Pratiques?',
    purchaseAdditional: 'Achetez des crédits de pratique supplémentaires à tout moment',

    // Caractéristiques
    feature_unlimited: 'Pratiques IA illimitées',
    feature_practices: 'pratiques IA par mois',
    feature_ambient: 'sons ambiants',
    feature_voice: 'options vocales',
    feature_support: 'support',
    feature_analytics: 'Analyses avancées',
    feature_export: 'Exporter les pratiques',
    feature_api: 'Accès API',
    
    // Pratiques
    practices: 'Pratiques',
    quickPractices: 'Pratiques Rapides',
    customPractice: 'Pratique Personnalisée',
    startPractice: 'Commencer la Pratique',
    duration: 'Durée',
    minutes: 'minutes',
    
    // États Émotionnels
    emotionalState: 'Comment vous sentez-vous?',
    calm: 'Calme',
    stressed: 'Stressé',
    anxious: 'Anxieux',
    energized: 'Énergisé',
    tired: 'Fatigué',
    focused: 'Concentré',

    // Messages de Confirmation
    confirmCancel: 'Êtes-vous sûr de vouloir annuler votre abonnement? Vous perdrez l\'accès aux fonctionnalités premium à la fin de votre période de facturation.',
    subscriptionCancelled: 'Abonnement annulé. Vous pouvez continuer à utiliser les fonctionnalités gratuites.',
    upgradeSuccess: 'Mis à niveau avec succès',
    purchaseSuccess: 'Acheté avec succès',
    
    // Erreurs
    errorLoading: 'Erreur de chargement des données',
    errorPurchase: 'Achat échoué. Veuillez réessayer.',
    errorUpgrade: 'Mise à niveau échouée. Veuillez réessayer.',
  },

  de: {
    // Navigation und Allgemein
    getStarted: 'Loslegen',
    signIn: 'Anmelden',
    signOut: 'Abmelden',
    profile: 'Profil',
    settings: 'Einstellungen',
    back: 'Zurück',
    next: 'Weiter',
    save: 'Speichern',
    cancel: 'Abbrechen',
    close: 'Schließen',
    loading: 'Lädt...',
    error: 'Fehler',
    success: 'Erfolg',

    // Startseite
    heroTitle: 'Finden Sie Ihren Inneren Frieden',
    heroSubtitle: 'KI-gestützte Meditationspraktiken für Ihre einzigartige Reise',
    heroDescription: 'Wir glauben, dass Meditation jeden Tag im Leben präsent sein sollte. Lassen Sie uns Ihnen helfen, die richtige Praxis für Sie zu finden.',
    features: 'Funktionen',
    pricing: 'Preise',
    about: 'Über Uns',

    // Abonnement und Preise
    subscription: 'Abonnement',
    currentPlan: 'Aktueller Plan',
    upgradePlan: 'Plan Upgraden',
    changePlan: 'Plan Ändern',
    cancelSubscription: 'Abonnement Kündigen',
    freePlan: 'Kostenloser Plan',
    starterPlan: 'Starter-Plan',
    proPlan: 'Pro-Plan',
    unlimitedPlan: 'Unbegrenzter Plan',
    perMonth: '/Monat',
    perYear: '/Jahr',
    selectPlan: 'Plan Auswählen',
    subscribeNow: 'Jetzt Abonnieren',
    mostPopular: 'Am Beliebtesten',
    
    // Praxis-Credits
    practiceCredits: 'Praxis-Credits',
    buyCredits: 'Praxis-Credits Kaufen',
    creditsRemaining: 'verbleibende Praktiken diesen Monat',
    practicesUsed: 'Verwendete Praktiken',
    needMore: 'Mehr Praktiken Benötigt?',
    purchaseAdditional: 'Kaufen Sie jederzeit zusätzliche Praxis-Credits',

    // Funktionen
    feature_unlimited: 'Unbegrenzte KI-Praktiken',
    feature_practices: 'KI-Praktiken pro Monat',
    feature_ambient: 'Umgebungsklänge',
    feature_voice: 'Sprachoptionen',
    feature_support: 'Unterstützung',
    feature_analytics: 'Erweiterte Analysen',
    feature_export: 'Praktiken Exportieren',
    feature_api: 'API-Zugriff',
    
    // Praktiken
    practices: 'Praktiken',
    quickPractices: 'Schnelle Praktiken',
    customPractice: 'Benutzerdefinierte Praxis',
    startPractice: 'Praxis Starten',
    duration: 'Dauer',
    minutes: 'Minuten',
    
    // Emotionale Zustände
    emotionalState: 'Wie fühlen Sie sich?',
    calm: 'Ruhig',
    stressed: 'Gestresst',
    anxious: 'Ängstlich',
    energized: 'Energiegeladen',
    tired: 'Müde',
    focused: 'Fokussiert',

    // Bestätigungsnachrichten
    confirmCancel: 'Sind Sie sicher, dass Sie Ihr Abonnement kündigen möchten? Sie verlieren den Zugang zu Premium-Funktionen am Ende Ihres Abrechnungszeitraums.',
    subscriptionCancelled: 'Abonnement gekündigt. Sie können weiterhin kostenlose Funktionen nutzen.',
    upgradeSuccess: 'Erfolgreich aktualisiert',
    purchaseSuccess: 'Erfolgreich gekauft',
    
    // Fehler
    errorLoading: 'Fehler beim Laden der Daten',
    errorPurchase: 'Kauf fehlgeschlagen. Bitte versuchen Sie es erneut.',
    errorUpgrade: 'Upgrade fehlgeschlagen. Bitte versuchen Sie es erneut.',
  },

  pt: {
    // Navegação e Comum
    getStarted: 'Começar',
    signIn: 'Entrar',
    signOut: 'Sair',
    profile: 'Perfil',
    settings: 'Configurações',
    back: 'Voltar',
    next: 'Próximo',
    save: 'Salvar',
    cancel: 'Cancelar',
    close: 'Fechar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',

    // Página Inicial
    heroTitle: 'Encontre Sua Paz Interior',
    heroSubtitle: 'Práticas de meditação orientadas por IA projetadas para sua jornada única',
    heroDescription: 'Acreditamos que a meditação deve estar presente na vida todos os dias. Deixe-nos ajudá-lo a encontrar a prática certa para você.',
    features: 'Recursos',
    pricing: 'Preços',
    about: 'Sobre',

    // Assinatura e Preços
    subscription: 'Assinatura',
    currentPlan: 'Plano Atual',
    upgradePlan: 'Atualizar Plano',
    changePlan: 'Mudar Plano',
    cancelSubscription: 'Cancelar Assinatura',
    freePlan: 'Plano Gratuito',
    starterPlan: 'Plano Inicial',
    proPlan: 'Plano Pro',
    unlimitedPlan: 'Plano Ilimitado',
    perMonth: '/mês',
    perYear: '/ano',
    selectPlan: 'Selecionar Plano',
    subscribeNow: 'Assinar Agora',
    mostPopular: 'Mais Popular',
    
    // Créditos de Prática
    practiceCredits: 'Créditos de Prática',
    buyCredits: 'Comprar Créditos de Prática',
    creditsRemaining: 'práticas restantes neste mês',
    practicesUsed: 'Práticas Usadas',
    needMore: 'Precisa de Mais Práticas?',
    purchaseAdditional: 'Compre créditos de prática adicionais a qualquer momento',

    // Recursos
    feature_unlimited: 'Práticas de IA ilimitadas',
    feature_practices: 'práticas de IA por mês',
    feature_ambient: 'sons ambientais',
    feature_voice: 'opções de voz',
    feature_support: 'suporte',
    feature_analytics: 'Análises avançadas',
    feature_export: 'Exportar práticas',
    feature_api: 'Acesso à API',
    
    // Práticas
    practices: 'Práticas',
    quickPractices: 'Práticas Rápidas',
    customPractice: 'Prática Personalizada',
    startPractice: 'Iniciar Prática',
    duration: 'Duração',
    minutes: 'minutos',
    
    // Estados Emocionais
    emotionalState: 'Como você está se sentindo?',
    calm: 'Calmo',
    stressed: 'Estressado',
    anxious: 'Ansioso',
    energized: 'Energizado',
    tired: 'Cansado',
    focused: 'Focado',

    // Mensagens de Confirmação
    confirmCancel: 'Tem certeza de que deseja cancelar sua assinatura? Você perderá o acesso aos recursos premium no final do seu período de cobrança.',
    subscriptionCancelled: 'Assinatura cancelada. Você pode continuar usando os recursos gratuitos.',
    upgradeSuccess: 'Atualizado com sucesso',
    purchaseSuccess: 'Comprado com sucesso',
    
    // Erros
    errorLoading: 'Erro ao carregar dados',
    errorPurchase: 'Compra falhou. Por favor, tente novamente.',
    errorUpgrade: 'Atualização falhou. Por favor, tente novamente.',
  },

  ja: {
    // ナビゲーションと共通
    getStarted: '始める',
    signIn: 'サインイン',
    signOut: 'サインアウト',
    profile: 'プロフィール',
    settings: '設定',
    back: '戻る',
    next: '次へ',
    save: '保存',
    cancel: 'キャンセル',
    close: '閉じる',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',

    // ランディングページ
    heroTitle: '内なる平和を見つけよう',
    heroSubtitle: 'あなた独自の旅のためにデザインされたAI搭載の瞑想プラクティス',
    heroDescription: '私たちは瞑想が毎日の生活に存在すべきだと信じています。あなたに適した実践を見つけるお手伝いをさせてください。',
    features: '機能',
    pricing: '料金',
    about: '私たちについて',

    // サブスクリプションと料金
    subscription: 'サブスクリプション',
    currentPlan: '現在のプラン',
    upgradePlan: 'プランをアップグレード',
    changePlan: 'プランを変更',
    cancelSubscription: 'サブスクリプションをキャンセル',
    freePlan: '無料プラン',
    starterPlan: 'スタータープラン',
    proPlan: 'プロプラン',
    unlimitedPlan: '無制限プラン',
    perMonth: '/月',
    perYear: '/年',
    selectPlan: 'プランを選択',
    subscribeNow: '今すぐ購読',
    mostPopular: '最も人気',
    
    // プラクティスクレジット
    practiceCredits: 'プラクティスクレジット',
    buyCredits: 'プラクティスクレジットを購入',
    creditsRemaining: '今月の残りのプラクティス',
    practicesUsed: '使用されたプラクティス',
    needMore: 'もっとプラクティスが必要ですか？',
    purchaseAdditional: 'いつでも追加のプラクティスクレジットを購入',

    // 機能
    feature_unlimited: '無制限のAIプラクティス',
    feature_practices: 'AIプラクティス/月',
    feature_ambient: 'アンビエントサウンド',
    feature_voice: 'ボイスオプション',
    feature_support: 'サポート',
    feature_analytics: '高度な分析',
    feature_export: 'プラクティスをエクスポート',
    feature_api: 'APIアクセス',
    
    // プラクティス
    practices: 'プラクティス',
    quickPractices: 'クイックプラクティス',
    customPractice: 'カスタムプラクティス',
    startPractice: 'プラクティスを開始',
    duration: '期間',
    minutes: '分',
    
    // 感情状態
    emotionalState: 'どのようにお感じですか？',
    calm: '穏やか',
    stressed: 'ストレス',
    anxious: '不安',
    energized: 'エネルギッシュ',
    tired: '疲れた',
    focused: '集中',

    // 確認メッセージ
    confirmCancel: 'サブスクリプションをキャンセルしてもよろしいですか？請求期間の終了時にプレミアム機能へのアクセスが失われます。',
    subscriptionCancelled: 'サブスクリプションがキャンセルされました。無料機能を引き続き使用できます。',
    upgradeSuccess: 'アップグレードに成功しました',
    purchaseSuccess: '購入に成功しました',
    
    // エラー
    errorLoading: 'データの読み込みエラー',
    errorPurchase: '購入に失敗しました。もう一度お試しください。',
    errorUpgrade: 'アップグレードに失敗しました。もう一度お試しください。',
  },

  zh: {
    // 导航和通用
    getStarted: '开始',
    signIn: '登录',
    signOut: '登出',
    profile: '个人资料',
    settings: '设置',
    back: '返回',
    next: '下一步',
    save: '保存',
    cancel: '取消',
    close: '关闭',
    loading: '加载中...',
    error: '错误',
    success: '成功',

    // 落地页
    heroTitle: '找到你的内心平静',
    heroSubtitle: '为您独特的旅程设计的AI驱动的冥想练习',
    heroDescription: '我们相信冥想应该每天存在于生活中。让我们帮助您找到适合您的练习。',
    features: '功能',
    pricing: '价格',
    about: '关于',

    // 订阅和定价
    subscription: '订阅',
    currentPlan: '当前计划',
    upgradePlan: '升级计划',
    changePlan: '更改计划',
    cancelSubscription: '取消订阅',
    freePlan: '免费计划',
    starterPlan: '入门计划',
    proPlan: '专业计划',
    unlimitedPlan: '无限计划',
    perMonth: '/月',
    perYear: '/年',
    selectPlan: '选择计划',
    subscribeNow: '立即订阅',
    mostPopular: '最受欢迎',
    
    // 练习积分
    practiceCredits: '练习积分',
    buyCredits: '购买练习积分',
    creditsRemaining: '本月剩余练习',
    practicesUsed: '已使用练习',
    needMore: '需要更多练习？',
    purchaseAdditional: '随时购买额外的练习积分',

    // 功能
    feature_unlimited: '无限AI练习',
    feature_practices: 'AI练习/月',
    feature_ambient: '环境声音',
    feature_voice: '语音选项',
    feature_support: '支持',
    feature_analytics: '高级分析',
    feature_export: '导出练习',
    feature_api: 'API访问',
    
    // 练习
    practices: '练习',
    quickPractices: '快速练习',
    customPractice: '自定义练习',
    startPractice: '开始练习',
    duration: '持续时间',
    minutes: '分钟',
    
    // 情绪状态
    emotionalState: '你感觉如何？',
    calm: '平静',
    stressed: '压力大',
    anxious: '焦虑',
    energized: '充满活力',
    tired: '疲倦',
    focused: '专注',

    // 确认消息
    confirmCancel: '您确定要取消订阅吗？在计费周期结束时，您将失去对高级功能的访问权限。',
    subscriptionCancelled: '订阅已取消。您可以继续使用免费功能。',
    upgradeSuccess: '升级成功',
    purchaseSuccess: '购买成功',
    
    // 错误
    errorLoading: '加载数据错误',
    errorPurchase: '购买失败。请重试。',
    errorUpgrade: '升级失败。请重试。',
  },
};

/**
 * Localized pricing by region/currency
 * Prices are adjusted based on purchasing power parity
 */
export const localizedPricing = {
  USD: { // United States, Canada, Australia
    currency: '$',
    symbol: 'USD',
    free: 0,
    starter: 9.99,
    pro: 19.99,
    unlimited: 49.99,
    credits: {
      10: 4.99,
      25: 9.99,
      50: 17.99,
      100: 29.99,
    },
  },
  EUR: { // Europe
    currency: '€',
    symbol: 'EUR',
    free: 0,
    starter: 8.99,
    pro: 17.99,
    unlimited: 44.99,
    credits: {
      10: 4.49,
      25: 8.99,
      50: 15.99,
      100: 26.99,
    },
  },
  GBP: { // United Kingdom
    currency: '£',
    symbol: 'GBP',
    free: 0,
    starter: 7.99,
    pro: 15.99,
    unlimited: 39.99,
    credits: {
      10: 3.99,
      25: 7.99,
      50: 14.49,
      100: 24.99,
    },
  },
  BRL: { // Brazil
    currency: 'R$',
    symbol: 'BRL',
    free: 0,
    starter: 39.99,
    pro: 79.99,
    unlimited: 199.99,
    credits: {
      10: 19.99,
      25: 39.99,
      50: 74.99,
      100: 129.99,
    },
  },
  JPY: { // Japan
    currency: '¥',
    symbol: 'JPY',
    free: 0,
    starter: 1100,
    pro: 2200,
    unlimited: 5500,
    credits: {
      10: 550,
      25: 1100,
      50: 1980,
      100: 3300,
    },
  },
  CNY: { // China
    currency: '¥',
    symbol: 'CNY',
    free: 0,
    starter: 68,
    pro: 138,
    unlimited: 348,
    credits: {
      10: 35,
      25: 68,
      50: 128,
      100: 218,
    },
  },
  INR: { // India
    currency: '₹',
    symbol: 'INR',
    free: 0,
    starter: 399,
    pro: 799,
    unlimited: 1999,
    credits: {
      10: 199,
      25: 399,
      50: 749,
      100: 1249,
    },
  },
  MXN: { // Mexico
    currency: 'MX$',
    symbol: 'MXN',
    free: 0,
    starter: 179,
    pro: 359,
    unlimited: 899,
    credits: {
      10: 89,
      25: 179,
      50: 329,
      100: 549,
    },
  },
};

/**
 * Map countries to currencies
 */
export const countryCurrency = {
  US: 'USD', CA: 'USD', AU: 'USD', NZ: 'USD',
  AT: 'EUR', BE: 'EUR', CY: 'EUR', EE: 'EUR', FI: 'EUR', FR: 'EUR', DE: 'EUR', 
  GR: 'EUR', IE: 'EUR', IT: 'EUR', LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', 
  NL: 'EUR', PT: 'EUR', SK: 'EUR', SI: 'EUR', ES: 'EUR',
  GB: 'GBP',
  BR: 'BRL',
  JP: 'JPY',
  CN: 'CNY',
  IN: 'INR',
  MX: 'MXN',
};

/**
 * Map countries to languages
 */
export const countryLanguage = {
  US: 'en', CA: 'en', GB: 'en', AU: 'en', NZ: 'en', IE: 'en',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  FR: 'fr', BE: 'fr', CH: 'fr', CA: 'fr',
  DE: 'de', AT: 'de', CH: 'de',
  PT: 'pt', BR: 'pt',
  JP: 'ja',
  CN: 'zh', TW: 'zh', HK: 'zh',
  IN: 'en', // English is widely used in India
};
