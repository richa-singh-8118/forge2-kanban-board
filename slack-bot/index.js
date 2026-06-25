import pkg from '@slack/bolt';
const { App } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000,
  clientOptions: {
    slackApiUrl: 'https://slack.com/api/',
  },
});

// Listen to ALL messages (not pattern-matched) for debugging
app.event('message', async ({ event, client, say }) => {
  console.log('Message received:', JSON.stringify(event, null, 2));

  const text = event.text?.toLowerCase() || '';

  if (text.includes('build a kanban board')) {
    await say({
      text: `*Hermes - Plan received* 📋\n\nPlan:\n1. Create Laravel API\n2. Create React UI\n3. Add tags\n4. Add assignee support\n5. Add due dates`,
      channel: event.channel,
    });
  } else if (text.includes('create react board ui')) {
    await say({
      text: `*OpenClaw - Task Complete* ✅\n\nCompleted React board UI.\nCreated Board, List, and Card components.`,
      channel: event.channel,
    });
  } else if (text.includes('status')) {
    await say({
      text: `*Autonomous status update* 🤖\n\nFrontend complete.\nBackend complete.\nTesting in progress.`,
      channel: event.channel,
    });
  }
});

(async () => {
  await app.start();
  console.log('⚡️ Slack bot is running!');
  console.log('Bot is now listening for messages in all channels.');
})();
