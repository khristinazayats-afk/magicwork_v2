// @ts-nocheck
// Push Notifications API
import admin from 'firebase-admin';
import { sql } from './db/client.js';

export const config = { runtime: 'nodejs' };

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const messaging = admin.messaging();

// POST /api/notifications/subscribe-topic - Subscribe device to topic
export async function subscribeToTopic(req, res) {
  try {
    const { token, topic } = req.body;

    if (!token || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing token or topic',
      });
    }

    // Subscribe device to topic
    await messaging.subscribeToTopic([token], topic);

    // Record subscription in database
    await sql`
      INSERT INTO notification_subscriptions (token, topic, subscribed_at)
      VALUES (${token}, ${topic}, NOW())
      ON CONFLICT (token, topic) DO NOTHING
    `;

    res.status(200).json({
      success: true,
      message: `Subscribed to topic: ${topic}`,
    });
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe to topic',
    });
  }
}

// POST /api/notifications/unsubscribe-topic - Unsubscribe device from topic
export async function unsubscribeFromTopic(req, res) {
  try {
    const { token, topic } = req.body;

    if (!token || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing token or topic',
      });
    }

    // Unsubscribe device from topic
    await messaging.unsubscribeFromTopic([token], topic);

    // Remove subscription from database
    await sql`
      DELETE FROM notification_subscriptions
      WHERE token = ${token} AND topic = ${topic}
    `;

    res.status(200).json({
      success: true,
      message: `Unsubscribed from topic: ${topic}`,
    });
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsubscribe from topic',
    });
  }
}

// POST /api/notifications/send-to-topic - Send notification to topic
export async function sendToTopic(req, res) {
  try {
    const { topic, title, body, data = {} } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing topic, title, or body',
      });
    }

    const message = {
      notification: {
        title,
        body,
      },
      data,
      topic,
    };

    const response = await messaging.send(message);

    // Log notification
    await sql`
      INSERT INTO notifications_sent (topic, title, body, sent_at)
      VALUES (${topic}, ${title}, ${body}, NOW())
    `;

    res.status(200).json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification',
    });
  }
}

// POST /api/notifications/send-to-user - Send notification to specific user
export async function sendToUser(req, res) {
  try {
    const { userId, title, body, data = {} } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId, title, or body',
      });
    }

    const userTopic = `user_${userId}`;

    const message = {
      notification: {
        title,
        body,
      },
      data,
      topic: userTopic,
    };

    const response = await messaging.send(message);

    res.status(200).json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error('Error sending notification to user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification',
    });
  }
}

// POST /api/notifications/send-to-device - Send notification to specific device token
export async function sendToDevice(req, res) {
  try {
    const { deviceToken, title, body, data = {} } = req.body;

    if (!deviceToken || !title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing deviceToken, title, or body',
      });
    }

    const message = {
      notification: {
        title,
        body,
      },
      data,
      token: deviceToken,
    };

    const response = await messaging.send(message);

    res.status(200).json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error('Error sending notification to device:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification',
    });
  }
}

// POST /api/notifications/schedule - Schedule notification
export async function scheduleNotification(req, res) {
  try {
    const { topic, title, body, scheduledTime, data = {} } = req.body;

    if (!topic || !title || !body || !scheduledTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Store scheduled notification
    const result = await sql`
      INSERT INTO scheduled_notifications (
        topic, title, body, scheduled_time, data, created_at
      ) VALUES (
        ${topic}, ${title}, ${body},
        ${new Date(scheduledTime)},
        ${JSON.stringify(data)},
        NOW()
      )
      RETURNING id
    `;

    res.status(200).json({
      success: true,
      notificationId: result[0].id,
      message: 'Notification scheduled',
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule notification',
    });
  }
}

// Process scheduled notifications (run periodically)
export async function processScheduledNotifications(req, res) {
  try {
    // Get all due notifications
    const dueNotifications = await sql`
      SELECT * FROM scheduled_notifications
      WHERE scheduled_time <= NOW()
      AND sent_at IS NULL
      LIMIT 100
    `;

    let sentCount = 0;

    for (const notification of dueNotifications) {
      try {
        const message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data || {},
          topic: notification.topic,
        };

        await messaging.send(message);

        // Mark as sent
        await sql`
          UPDATE scheduled_notifications
          SET sent_at = NOW()
          WHERE id = ${notification.id}
        `;

        sentCount++;
      } catch (error) {
        console.error(
          `Error sending scheduled notification ${notification.id}:`,
          error,
        );
      }
    }

    res.status(200).json({
      success: true,
      sentCount,
    });
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process scheduled notifications',
    });
  }
}
