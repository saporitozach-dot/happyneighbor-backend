#!/usr/bin/env node
/**
 * Capture website screenshots for showcasing (20 total).
 * Run: npm run dev (in one terminal), then node scripts/capture-screenshots.js
 * Output: screenshots/
 */

import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'screenshots');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const VIEWPORT = { width: 1440, height: 900 };

const prefs = { noise: 'Quiet', walkability: 'Walkable', safety: 'Very Important', kids_friendly: 'Important', public_education: 'Important', events: 'Regular', lawn_space: 'Important', neighbor_familiarity: 'Important' };

const PAGES = [
  {
    name: '01-homepage-full',
    path: '/',
    wait: 1000,
    fullPage: true,
    extraSteps: async (page) => {
      await page.evaluate(() => document.getElementById('the-problem')?.scrollIntoView({ behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 5500));
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise(r => setTimeout(r, 300));
    },
  },
  { name: '02-homepage-hero', path: '/', wait: 1500 },
  {
    name: '03-homepage-stats',
    path: '/',
    wait: 1000,
    extraSteps: async (page) => {
      await page.evaluate(() => document.getElementById('the-problem')?.scrollIntoView());
      await new Promise(r => setTimeout(r, 5500));
    },
  },
  { name: '04-survey', path: '/survey', wait: 2500 },
  {
    name: '05-survey-step2',
    path: '/survey',
    wait: 2000,
    extraSteps: async (page) => {
      const opts = ['Very Quiet', 'Very Walkable', 'Very Safe', 'Very Family-Friendly'];
      for (const text of opts) {
        await page.evaluate((t) => {
          const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === t);
          if (btn) btn.click();
        }, text);
        await new Promise(r => setTimeout(r, 150));
      }
      await new Promise(r => setTimeout(r, 200));
      await page.evaluate(() => {
        const next = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Next');
        if (next && !next.disabled) next.click();
      });
      await new Promise(r => setTimeout(r, 1200));
    },
  },
  { name: '06-how-it-works', path: '/how-it-works', wait: 2500 },
  { name: '07-about', path: '/about', wait: 2000 },
  { name: '08-contact', path: '/contact', wait: 2000 },
  { name: '09-faq', path: '/faq', wait: 2000 },
  { name: '10-testimonials', path: '/testimonials', wait: 2000 },
  { name: '11-community-gateway', path: '/community', wait: 2500 },
  {
    name: '12-community-inside',
    path: '/community/demo',
    wait: 3500,
    preSteps: async (page) => {
      await page.evaluateOnNewDocument(() => localStorage.setItem('demoVerified', 'true'));
    },
  },
  {
    name: '13-results',
    path: '/results',
    wait: 3500,
    preSteps: async (page) => {
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('userPreferences', JSON.stringify(prefs));
      });
    },
  },
  { name: '14-street-portal', path: '/street/1', wait: 3000 },
  {
    name: '15-compare',
    path: '/compare',
    wait: 2500,
    preSteps: async (page) => {
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('userPreferences', JSON.stringify(prefs));
        localStorage.setItem('savedStreets', JSON.stringify([1, 2]));
      });
    },
  },
  { name: '16-businesses-shops', path: '/businesses', wait: 2500 },
  {
    name: '17-businesses-realtors',
    path: '/businesses',
    wait: 1500,
    extraSteps: async (page) => {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const realtors = btns.find(b => b.textContent.includes('Realtors'));
        if (realtors) realtors.click();
      });
      await new Promise(r => setTimeout(r, 1000));
    },
  },
  { name: '18-login', path: '/login', wait: 2000 },
  { name: '19-resident-submit', path: '/submit', wait: 2500 },
  { name: '20-submission-success', path: '/submission-success', wait: 2000 },
];

async function capture(browser, config) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  if (config.preSteps) await config.preSteps(page);
  await page.goto(BASE_URL + config.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, config.wait || 2000));
  if (config.extraSteps) await config.extraSteps(page).catch(() => {});
  const filepath = join(OUTPUT_DIR, `${config.name}.png`);
  await page.screenshot({ path: filepath, fullPage: config.fullPage || false });
  await page.close();
  console.log(`  ✓ ${config.name}.png`);
}

async function main() {
  console.log('📸 Capturing Happy Neighbor screenshots\n');
  await mkdir(OUTPUT_DIR, { recursive: true });

  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    for (const config of PAGES) {
      try {
        await capture(browser, config);
      } catch (err) {
        console.error(`  ✗ ${config.name}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.log('\nStart the dev server first: npm run dev');
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
  console.log(`\n✅ Saved to screenshots/`);
}

main();
