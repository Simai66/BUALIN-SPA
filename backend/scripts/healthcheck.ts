/**
 * Thai Spa - System Health Check Script
 * ตรวจสอบสุขภาพระบบทั้งหมด: Backend, Database, SMTP, Security
 */

import axios from 'axios';
import { env } from '../src/config/env';
import { db } from '../src/config/db';
import nodemailer from 'nodemailer';

interface HealthResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  duration?: number;
  details?: any;
}

class HealthChecker {
  private results: HealthResult[] = [];
  private baseURL: string;
  private frontendURL: string;

  constructor() {
    this.baseURL = env.BASE_URL;
    this.frontendURL = env.FRONTEND_URL;
  }

  async runAll(): Promise<void> {
    console.log('🏥 Starting Thai Spa Health Check...\n');

    await this.checkAPIHealth();
    await this.checkDatabasePing();
    await this.checkMigrationState();
    await this.checkSMTPConnection();
    await this.checkCORS();
    await this.checkSecurityHeaders();
    await this.checkRateLimit();
    
    // Smoke tests
    await this.smokeTestServices();
    await this.smokeTestTherapists();
    
    this.printReport();
    this.exit();
  }

  private async checkAPIHealth(): Promise<void> {
    const start = Date.now();
    try {
      const response = await axios.get(`${this.baseURL}/health`, { timeout: 5000 });
      const duration = Date.now() - start;
      
      if (response.status === 200 && response.data.status === 'ok') {
        this.results.push({
          name: 'API Health Endpoint',
          status: 'pass',
          message: `✅ Responded in ${duration}ms`,
          duration,
          details: response.data
        });
      } else {
        throw new Error('Unexpected response');
      }
    } catch (error: any) {
      this.results.push({
        name: 'API Health Endpoint',
        status: 'fail',
        message: `❌ ${error.message}`
      });
    }
  }

  private async checkDatabasePing(): Promise<void> {
    try {
      await db.raw('SELECT 1 as result');
      this.results.push({
        name: 'Database Ping',
        status: 'pass',
        message: '✅ SQLite connection successful'
      });
    } catch (error: any) {
      this.results.push({
        name: 'Database Ping',
        status: 'fail',
        message: `❌ ${error.message}`
      });
    }
  }

  private async checkMigrationState(): Promise<void> {
    try {
      const tables = [
        'users', 'services', 'service_prices', 'promotions',
        'therapists', 'schedules', 'timesheets', 'gallery', 'bookings'
      ];
      
      const existingTables: string[] = [];
      const missingTables: string[] = [];

      for (const table of tables) {
        const exists = await db.schema.hasTable(table);
        if (exists) {
          existingTables.push(table);
        } else {
          missingTables.push(table);
        }
      }

      if (missingTables.length === 0) {
        this.results.push({
          name: 'Migration State',
          status: 'pass',
          message: `✅ All ${tables.length} tables present`,
          details: { tables: existingTables }
        });
      } else {
        this.results.push({
          name: 'Migration State',
          status: 'fail',
          message: `❌ Missing tables: ${missingTables.join(', ')}`,
          details: { existing: existingTables, missing: missingTables }
        });
      }
    } catch (error: any) {
      this.results.push({
        name: 'Migration State',
        status: 'fail',
        message: `❌ ${error.message}`
      });
    }
  }

  private async checkSMTPConnection(): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });

      await transporter.verify();
      
      this.results.push({
        name: 'SMTP Connection',
        status: 'pass',
        message: `✅ Connected to ${env.SMTP_HOST}:${env.SMTP_PORT}`,
        details: { host: env.SMTP_HOST, port: env.SMTP_PORT }
      });
    } catch (error: any) {
      this.results.push({
        name: 'SMTP Connection',
        status: 'fail',
        message: `❌ ${error.message}`,
        details: { host: env.SMTP_HOST, port: env.SMTP_PORT }
      });
    }
  }

  private async checkCORS(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        headers: {
          'Origin': this.frontendURL
        }
      });

      const allowOrigin = response.headers['access-control-allow-origin'];
      const allowCreds = response.headers['access-control-allow-credentials'];

      if (allowOrigin === this.frontendURL && allowCreds === 'true') {
        this.results.push({
          name: 'CORS Configuration',
          status: 'pass',
          message: `✅ Configured for ${this.frontendURL}`,
          details: { origin: allowOrigin, credentials: allowCreds }
        });
      } else {
        this.results.push({
          name: 'CORS Configuration',
          status: 'fail',
          message: `❌ Expected origin: ${this.frontendURL}, got: ${allowOrigin}`,
          details: { expected: this.frontendURL, actual: allowOrigin }
        });
      }
    } catch (error: any) {
      this.results.push({
        name: 'CORS Configuration',
        status: 'fail',
        message: `❌ ${error.message}`
      });
    }
  }

  private async checkSecurityHeaders(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      
      const requiredHeaders = [
        'x-dns-prefetch-control',
        'x-frame-options',
        'x-content-type-options',
        'x-download-options',
        'x-xss-protection'
      ];

      const presentHeaders: string[] = [];
      const missingHeaders: string[] = [];

      for (const header of requiredHeaders) {
        if (response.headers[header]) {
          presentHeaders.push(header);
        } else {
          missingHeaders.push(header);
        }
      }

      if (missingHeaders.length === 0) {
        this.results.push({
          name: 'Security Headers (Helmet)',
          status: 'pass',
          message: `✅ All ${requiredHeaders.length} headers present`,
          details: { headers: presentHeaders }
        });
      } else {
        this.results.push({
          name: 'Security Headers (Helmet)',
          status: 'fail',
          message: `❌ Missing headers: ${missingHeaders.join(', ')}`,
          details: { present: presentHeaders, missing: missingHeaders }
        });
      }
    } catch (error: any) {
      this.results.push({
        name: 'Security Headers (Helmet)',
        status: 'fail',
        message: `❌ ${error.message}`
      });
    }
  }

  private async checkRateLimit(): Promise<void> {
    try {
      const requests = [];
      // Try to make 15 requests (limit is 10 per 15 minutes)
      for (let i = 0; i < 15; i++) {
        requests.push(
          axios.post(`${this.baseURL}/api/auth/login`, {
            email: 'test@test.com',
            password: 'wrong'
          }, { validateStatus: () => true })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);

      if (rateLimited) {
        this.results.push({
          name: 'Rate Limiting',
          status: 'pass',
          message: '✅ Rate limit enforced (blocked after 10 requests)',
          details: { limit: '10 requests per 15 minutes' }
        });
      } else {
        this.results.push({
          name: 'Rate Limiting',
          status: 'fail',
          message: '❌ Rate limit not enforced',
          details: { expected: '429 after 10 requests', actual: 'no limit detected' }
        });
      }
    } catch (error: any) {
      this.results.push({
        name: 'Rate Limiting',
        status: 'fail',
        message: `❌ ${error.message}`
      });
    }
  }

  private async smokeTestServices(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseURL}/api/services`);
      
      if (response.status === 200 && Array.isArray(response.data.services)) {
        const count = response.data.services.length;
        this.results.push({
          name: 'Smoke: Services API',
          status: 'pass',
          message: `✅ Retrieved ${count} services`,
          details: { count, endpoint: '/api/services' }
        });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      this.results.push({
        name: 'Smoke: Services API',
        status: 'fail',
        message: `❌ ${error.message}`
      });
    }
  }

  private async smokeTestTherapists(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseURL}/api/therapists`);
      
      if (response.status === 200 && Array.isArray(response.data.therapists)) {
        const count = response.data.therapists.length;
        const allActive = response.data.therapists.every((t: any) => t.is_active);
        
        if (allActive) {
          this.results.push({
            name: 'Smoke: Therapists API',
            status: 'pass',
            message: `✅ Retrieved ${count} active therapists`,
            details: { count, endpoint: '/api/therapists' }
          });
        } else {
          this.results.push({
            name: 'Smoke: Therapists API',
            status: 'fail',
            message: '❌ Some therapists are inactive',
            details: { count }
          });
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      this.results.push({
        name: 'Smoke: Therapists API',
        status: 'fail',
        message: `❌ ${error.message}`
      });
    }
  }

  private printReport(): void {
    const format = process.argv.includes('--format=json') ? 'json' : 'markdown';
    
    if (format === 'json') {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        results: this.results,
        summary: {
          total: this.results.length,
          passed: this.results.filter(r => r.status === 'pass').length,
          failed: this.results.filter(r => r.status === 'fail').length
        }
      }, null, 2));
    } else {
      this.printMarkdownReport();
    }
  }

  private printMarkdownReport(): void {
    console.log('\n# 🏥 Thai Spa Health Report\n');
    console.log(`**Environment:** ${env.NODE_ENV}`);
    console.log(`**Timestamp:** ${new Date().toLocaleString('th-TH')}`);
    console.log(`**Base URL:** ${this.baseURL}`);
    console.log(`**Frontend URL:** ${this.frontendURL}\n`);

    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;

    console.log('## Summary\n');
    console.log(`- **Total Checks:** ${this.results.length}`);
    console.log(`- **Passed:** ✅ ${passed}`);
    console.log(`- **Failed:** ❌ ${failed}\n`);

    console.log('## Detailed Results\n');
    
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : '❌';
      console.log(`### ${icon} ${result.name}`);
      console.log(`${result.message}`);
      
      if (result.duration) {
        console.log(`*Duration: ${result.duration}ms*`);
      }
      
      if (result.details && Object.keys(result.details).length > 0) {
        console.log('```json');
        console.log(JSON.stringify(result.details, null, 2));
        console.log('```');
      }
      console.log('');
    });

    if (failed > 0) {
      console.log('## ⚠️ Action Required\n');
      console.log('Some health checks failed. Please review the errors above and take corrective action.\n');
    } else {
      console.log('## 🎉 All Systems Operational\n');
      console.log('All health checks passed successfully!\n');
    }
  }

  private exit(): void {
    const failed = this.results.filter(r => r.status === 'fail').length;
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run if executed directly
if (require.main === module) {
  const checker = new HealthChecker();
  checker.runAll().catch(error => {
    console.error('Fatal error during health check:', error);
    process.exit(1);
  });
}

export default HealthChecker;
