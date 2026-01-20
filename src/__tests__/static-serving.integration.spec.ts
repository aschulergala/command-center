/**
 * Integration tests for static serving and SPA fallback.
 * These tests require a built client in dist/client directory.
 *
 * Run: npm run build && npm run test:server
 */
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';

describe('Static Serving Integration', () => {
  let serverProcess: ChildProcess;
  const PORT = 3999; // Use different port to avoid conflicts

  const waitForServer = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server timeout')), 10000);

      const check = () => {
        const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
          if (res.statusCode === 200) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(check, 100);
          }
        });
        req.on('error', () => setTimeout(check, 100));
      };
      check();
    });
  };

  const httpGet = (urlPath: string): Promise<{ status: number; body: string }> => {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${PORT}${urlPath}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode!, body: data }));
      }).on('error', reject);
    });
  };

  beforeAll(async () => {
    // Check if dist/client exists
    const clientPath = path.join(__dirname, '../../dist/client/index.html');
    if (!fs.existsSync(clientPath)) {
      console.warn('Skipping static serving tests - run "npm run build" first');
      return;
    }

    // Start the server
    serverProcess = spawn('node', ['dist/src/main.js'], {
      cwd: path.join(__dirname, '../..'),
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'pipe',
    });

    await waitForServer();
  }, 15000);

  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill('SIGKILL');
      // Give the process time to terminate
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  });

  it('should serve index.html at root', async () => {
    const clientPath = path.join(__dirname, '../../dist/client/index.html');
    if (!fs.existsSync(clientPath)) {
      return; // Skip if not built
    }

    const { status, body } = await httpGet('/');
    expect(status).toBe(200);
    expect(body).toContain('<!DOCTYPE html>');
  });

  it('should serve index.html for SPA routes (tokens)', async () => {
    const clientPath = path.join(__dirname, '../../dist/client/index.html');
    if (!fs.existsSync(clientPath)) {
      return;
    }

    const { status, body } = await httpGet('/tokens');
    expect(status).toBe(200);
    expect(body).toContain('<!DOCTYPE html>');
  });

  it('should serve index.html for SPA routes (nfts)', async () => {
    const clientPath = path.join(__dirname, '../../dist/client/index.html');
    if (!fs.existsSync(clientPath)) {
      return;
    }

    const { status, body } = await httpGet('/nfts');
    expect(status).toBe(200);
    expect(body).toContain('<!DOCTYPE html>');
  });

  it('should serve index.html for SPA routes (creators)', async () => {
    const clientPath = path.join(__dirname, '../../dist/client/index.html');
    if (!fs.existsSync(clientPath)) {
      return;
    }

    const { status, body } = await httpGet('/creators');
    expect(status).toBe(200);
    expect(body).toContain('<!DOCTYPE html>');
  });

  it('should serve API routes correctly', async () => {
    const clientPath = path.join(__dirname, '../../dist/client/index.html');
    if (!fs.existsSync(clientPath)) {
      return;
    }

    const { status, body } = await httpGet('/api/health');
    expect(status).toBe(200);
    const data = JSON.parse(body);
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
  });
});
