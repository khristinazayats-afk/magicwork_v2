// Quick test for gamification endpoints
// Run: node quick-test.js [url]

const API_BASE = process.argv[2] || 'http://localhost:3000';
const USER_ID = 'test-user-' + Date.now();

console.log('🧪 Testing Gamification API');
console.log('📍 URL:', API_BASE);
console.log('👤 User ID:', USER_ID);
console.log('');

async function test() {
  try {
    // Test 1: Practice complete
    console.log('1️⃣ Testing practice_complete...');
    const res1 = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: USER_ID,
        event_type: 'practice_complete',
        metadata: { space: 'Slow Morning', duration: 120 },
      }),
    });
    const data1 = await res1.json();
    console.log('✅ Response:', JSON.stringify(data1, null, 2));
    
    if (data1.milestone_granted) {
      console.log('🎉 Milestone granted:', data1.milestone_granted.title);
    }
    console.log('');

    // Test 2: Get progress
    console.log('2️⃣ Testing GET /api/progress...');
    const res2 = await fetch(`${API_BASE}/api/progress?user_id=${USER_ID}`);
    const data2 = await res2.json();
    console.log('✅ Response:', JSON.stringify(data2, null, 2));
    console.log('');

    // Test 3: Share post
    console.log('3️⃣ Testing share_post...');
    const res3 = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: USER_ID,
        event_type: 'share_post',
        metadata: { space: 'Gentle De-Stress', privacy: 'public' },
      }),
    });
    const data3 = await res3.json();
    console.log('✅ Response:', JSON.stringify(data3, null, 2));
    console.log('');

    // Test 4: Light send
    console.log('4️⃣ Testing light_send...');
    const res4 = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: USER_ID,
        event_type: 'light_send',
        metadata: {},
      }),
    });
    const data4 = await res4.json();
    console.log('✅ Response:', JSON.stringify(data4, null, 2));
    console.log('');

    // Final progress check
    console.log('5️⃣ Final progress check...');
    const res5 = await fetch(`${API_BASE}/api/progress?user_id=${USER_ID}`);
    const data5 = await res5.json();
    console.log('✅ Today\'s LP:', data5.today_lp);
    console.log('✅ Streak:', data5.streak);
    console.log('✅ Lifetime days:', data5.lifetime_days);
    console.log('✅ Milestones:', data5.milestones.length);

    console.log('\n✨ All tests complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('fetch')) {
      console.error('\n💡 Make sure:');
      console.error('   1. The server is running');
      console.error('   2. The URL is correct');
      console.error('   3. CORS is enabled');
    }
  }
}

test();

