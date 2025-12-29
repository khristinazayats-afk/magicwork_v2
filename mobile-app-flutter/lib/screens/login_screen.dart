import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../providers/auth_provider.dart';
import '../providers/analytics_provider.dart';
import '../providers/user_profile_provider.dart';

const secureStorage = FlutterSecureStorage();

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  List<String> _savedEmails = [];
  bool _showSavedAccounts = false;

  @override
  void initState() {
    super.initState();
    _loadSavedAccounts();
    // Auto-redirect if already logged in
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      if (authProvider.isAuthenticated) {
        context.go('/feed');
      }
    });
  }

  Future<void> _loadSavedAccounts() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedEmailsJson = prefs.getStringList('saved_emails') ?? [];
      setState(() {
        _savedEmails = savedEmailsJson;
      });
    } catch (e) {
      print('Error loading saved accounts: $e');
    }
  }

  Future<void> _selectSavedAccount(String email) async {
    try {
      final password = await secureStorage.read(key: 'password_$email');
      setState(() {
        _emailController.text = email;
        _passwordController.text = password ?? '';
        _showSavedAccounts = false;
      });
    } catch (e) {
      print('Error loading password: $e');
    }
  }

  Future<void> _saveCrendentials(String email, String password) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedEmails = prefs.getStringList('saved_emails') ?? [];
      if (!savedEmails.contains(email)) {
        savedEmails.add(email);
        await prefs.setStringList('saved_emails', savedEmails);
      }
      await secureStorage.write(key: 'password_$email', value: password);
    } catch (e) {
      print('Error saving credentials: $e');
    }
  }

  Future<void> _removeSavedAccount(String email) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedEmails = prefs.getStringList('saved_emails') ?? [];
      savedEmails.remove(email);
      await prefs.setStringList('saved_emails', savedEmails);
      await secureStorage.delete(key: 'password_$email');
      _loadSavedAccounts();
    } catch (e) {
      print('Error removing account: $e');
    }
  }

  Future<void> _handleGoogleSignIn() async {
    final authProvider = context.read<AuthProvider>();
    final analyticsProvider = context.read<AnalyticsProvider>();
    
    final success = await authProvider.signInWithGoogle();
    
    if (mounted) {
      if (success) {
        final userId = authProvider.user?.id;
        if (userId != null) {
          await analyticsProvider.initialize(userId);
          await analyticsProvider.trackAction(
            actionName: 'google_signin_success',
            userId: userId,
            screenName: 'Login',
          );
        }
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Google Sign-In successful!'),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/feed');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? 'Google Sign-In failed'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  Future<void> _handleAppleSignIn() async {
    final authProvider = context.read<AuthProvider>();
    final analyticsProvider = context.read<AnalyticsProvider>();
    
    final success = await authProvider.signInWithApple();
    
    if (mounted) {
      if (success) {
        final userId = authProvider.user?.id;
        if (userId != null) {
          await analyticsProvider.initialize(userId);
          await analyticsProvider.trackAction(
            actionName: 'apple_signin_success',
            userId: userId,
            screenName: 'Login',
          );
        }
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Apple Sign-In successful!'),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/feed');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? 'Apple Sign-In failed'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    
    // Show loading indicator
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Logging in...'),
          duration: Duration(seconds: 1),
        ),
      );
    }
    
    final success = await authProvider.signInWithEmail(email, password);

    if (mounted) {
      if (success) {
        // Save credentials if successful
        await _saveCrendentials(email, password);
        
        // Track login success
        final analyticsProvider = context.read<AnalyticsProvider>();
        final profileProvider = context.read<UserProfileProvider>();
        final userId = authProvider.user?.id;
        
        if (userId != null) {
          try {
            // Initialize analytics for logged-in user
            await analyticsProvider.initialize(userId);
            
            // Load user profile - if table is missing, this will fail but shouldn't stop login
            await profileProvider.loadProfile(userId);
            
            if (profileProvider.error != null && profileProvider.error!.contains('relation "public.user_profiles" does not exist')) {
              print('⚠️ Database table user_profiles missing. Profile features will be limited.');
            }
            
            // Track login event
            await analyticsProvider.trackAction(
              actionName: 'login_success',
              userId: userId,
              screenName: 'Login',
            );
          } catch (e) {
            print('Error during post-login tasks: $e');
          }
        }

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Login successful!'),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/feed');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? 'Login failed. Please try again.'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF8F2),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                const Text(
                  'Welcome Back',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF172223),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                // Saved Accounts Section
                if (_savedEmails.isNotEmpty)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Saved Accounts',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1e2d2e),
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _showSavedAccounts = !_showSavedAccounts;
                              });
                            },
                            child: Text(
                              _showSavedAccounts ? 'Hide' : 'Show',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF94d1c4),
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (_showSavedAccounts)
                        Column(
                          children: _savedEmails.map((email) {
                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: const Color(0xFFE0E0E0),
                                ),
                              ),
                              child: ListTile(
                                title: Text(
                                  email,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: Color(0xFF1e2d2e),
                                  ),
                                ),
                                trailing: PopupMenuButton(
                                  itemBuilder: (context) => [
                                    PopupMenuItem(
                                      child: const Text('Remove'),
                                      onTap: () => _removeSavedAccount(email),
                                    ),
                                  ],
                                ),
                                onTap: () => _selectSavedAccount(email),
                              ),
                            );
                          }).toList(),
                        ),
                      const SizedBox(height: 24),
                    ],
                  ),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your email';
                    }
                    if (!value.contains('@')) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your password';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => context.push('/forgot-password'),
                    child: const Text('Forgot Password?'),
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF172223),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Login'),
                ),
                const SizedBox(height: 16),
                OutlinedButton(
                  onPressed: () => context.go('/signup'),
                  child: const Text('Create Account'),
                ),
                const SizedBox(height: 24),
                // Divider
                Row(
                  children: [
                    Expanded(
                      child: Divider(
                        color: Colors.grey[300],
                        thickness: 1,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'or continue with',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ),
                    Expanded(
                      child: Divider(
                        color: Colors.grey[300],
                        thickness: 1,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // SSO Buttons Row
                Row(
                  children: [
                    // Apple Sign-In
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _handleAppleSignIn,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.black,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.apple, size: 20),
                            SizedBox(width: 8),
                            Text('Apple'),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Google Sign-In
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _handleGoogleSignIn,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                            side: const BorderSide(color: Colors.grey),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.g_translate, size: 20),
                            SizedBox(width: 8),
                            Text('Google'),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

