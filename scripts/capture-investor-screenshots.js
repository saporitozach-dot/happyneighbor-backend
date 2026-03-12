#!/usr/bin/env node
/**
 * Capture investor-ready screenshots of the Happy Neighbor website.
 * Run with: node scripts/capture-investor-screenshots.js
 *
 * Prerequisites:
 * - npm run dev (frontend) should be running on http://localhost:3000
 * - For Results and Street Portal: npm run dev:server (API) on port 3005
 * - Add logo.png and hero-neighborhood.png to public/images/ for best results
 */

import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'assets', 'investor-screenshots');
const BASE_URL = 'http://localhost:3000';

const VIEWPORT = { width: 1440, height: 900 }; // Investor deck aspect ratio

const pages = [
  {
    name: '01-homepage',
    path: '/',
    waitFor: 'nav',
    scrollToBottom: true,
    description: 'Homepage hero and How It Works',
  },
  {
    name: '02-survey',
    path: '/survey',
    waitFor: 'selector',
    selector: '[class*="Tell Us About"]',
    description: 'Neighborhood preference survey',
  },
  {
    name: '03-community-gateway',
    path: '/community',
    waitFor: 2000,
    description: 'Community Hub entry - address lookup',
  },
  {
    name: '04-community-hub',
    path: '/community/demo',
    waitFor: 2000,
    extraSteps: async (page) => {
      // Enter DEMO code and unlock
      const codeInput = await page.$('input[type="text"], input[placeholder]');
      if (codeInput) {
        await codeInput.click();
        await page.keyboard.type('DEMO', { delay: 50 });
        await page.waitForTimeout(500);
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text && (text.includes('Explore') || text.includes('Unlock'))) {
            await btn.click();
            break;
          }
        }
        await page.waitForTimeout(2000);
      }
    },
    description: 'Community Hub - Events, Tasks, Marketplace',
  },
  {
    name: '05-how-it-works',
    path: '/how-it-works',
    waitFor: 2000,
    description: 'How Happy Neighbor Works',
  },
  {
    name: '06-results',
    path: '/results',
    waitFor: 'networkidle0',
    preSteps: async (page) => {
      // Set survey preferences so Results doesn't redirect to Survey
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('userPreferences', JSON.stringify({
          noise: 'Quiet',
          walkability: 'Walkable',
          safety: 'Very Important',
          kids_friendly: 'Important',
          public_education: 'Important',
          events: 'Regular',
          lawn_space: 'Important',
          neighbor_familiarity: 'Important',
        }));
      });
    },
    description: 'Street match results (may show error if API offline)',
  },
  {
    name: '07-street-portal',
    path: '/street/1',
    waitFor: 3000,
    description: 'Street detail + real estate listings (may show error if API offline)',
  },
];

async function capturePage(browser, config, index) {
  const page = await browser.newPage();

  await page.setViewport(VIEWPORT);
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

  if (config.preSteps) {
    await config.preSteps(page);
  }

  await page.goto(BASE_URL + config.path, {
    waitUntil: 'domcontentloaded',
    timeout: 15000,
  });

  if (config.waitFor) {
    if (typeof config.waitFor === 'number') {
      await new Promise(r => setTimeout(r, config.waitFor));
    } else if (config.waitFor === 'networkidle0') {
      await new Promise(r => setTimeout(r, 3000));
    } else if (config.waitFor === 'selector' && config.selector) {
      try {
        await page.waitForSelector(config.selector, { timeout: 5000 });
      } catch (e) {
        console.warn(`  ⚠ Could not find selector: ${config.selector}`);
      }
    }
  }

  if (config.extraSteps) {
    await config.extraSteps(page);
  }

  if (config.scrollToBottom) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  const filepath = join(OUTPUT_DIR, `${config.name}.png`);
  await page.screenshot({
    path: filepath,
    fullPage: config.scrollToBottom || config.name === '01-homepage',
  });

  await page.close();
  console.log(`  ✓ ${config.name}.png`);
}

async function main() {
  console.log('📸 Happy Neighbor – Investor Screenshot Capture\n');
  console.log(`Output: ${OUTPUT_DIR}\n`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    for (let i = 0; i < pages.length; i++) {
      const config = pages[i];
      console.log(`[${i + 1}/${pages.length}] ${config.description}...`);
      try {
        await capturePage(browser, config, i);
      } catch (err) {
        console.error(`  ✗ ${config.name}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('Failed to launch browser:', err.message);
    console.log('\nMake sure the dev server is running: npm run dev');
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }

  console.log('\n✅ Screenshots saved to assets/investor-screenshots/');
}

main();
