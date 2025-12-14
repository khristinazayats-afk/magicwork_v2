// Quick test script for gamification API
// Run with: node test-gamification.js

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const USER_ID = 'test-user-123';

async function testEvents() {
  console.log('\n🧪 Testing POST /api/events...\n');

  // Test 1: Practice complete
  console.log('1. Testing practice_complete...');
  try {
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
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  // Test 2: Share post
  console.log('\n2. Testing share_post...');
  try {
    const res2 = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: USER_ID,
        event_type: 'share_post',
        metadata: { space: 'Gentle De-Stress', privacy: 'public' },
      }),
    });
    const data2 = await res2.json();
    console.log('✅ Response:', JSON.stringify(data2, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  // Test 3: Light send
  console.log('\n3. Testing light_send...');
  try {
    const res3 = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: USER_ID,
        event_type: 'light_send',
        metadata: {},
      }),
    });
    const data3 = await res3.json();
    console.log('✅ Response:', JSON.stringify(data3, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  // Test 4: Tune play (1 minute)
  console.log('\n4. Testing tune_play (60 seconds)...');
  try {
    const res4 = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: USER_ID,
        event_type: 'tune_play',
        metadata: { duration_sec: 60 },
      }),
    });
    const data4 = await res4.json();
    console.log('✅ Response:', JSON.stringify(data4, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

async function testProgress() {
  console.log('\n🧪 Testing GET /api/progress...\n');
  try {
    const res = await fetch(`${API_BASE}/api/progress?user_id=${USER_ID}`);
    const data = await res.json();
    console.log('✅ Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

async function runTests() {
  console.log('🚀 Starting gamification API tests...');
  console.log(`📍 API Base: ${API_BASE}`);
  console.log(`👤 User ID: ${USER_ID}\n`);

  await testEvents();
  await testProgress();

  console.log('\n✨ Tests complete!\n');
}

runTests().catch(console.error);

