import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_FILE = path.resolve('data', 'tasks.json');
const LOG_FILE = path.resolve('logs.txt');

export async function getTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}
export async function logRequest(method, url) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${method} - ${url}\n`;
  try {
    await fs.appendFile(LOG_FILE, logMessage, 'utf-8');
  } catch (error) {
    console.error('ERROR : ', error);
  }
}
