import type { Options } from '@wdio/types';

export const config: Options.Testrunner = {
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            project: './tsconfig.e2e.json',
            transpileOnly: true
        }
    },

    // ==================
    // Specify Test Files
    // ==================
    specs: [
        './test/e2e/specs/**/*.e2e.ts'
    ],
    exclude: [],

    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                '--headless',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--no-sandbox',
                '--disable-dev-shm-usage'
            ]
        },
        acceptInsecureCerts: true
    }],

    // ===================
    // Test Configurations
    // ===================
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost:5173',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [],

    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },

    // =====
    // Hooks
    // =====
    before: function () {
        // 全局設定
    },
    
    beforeTest: function () {
        // 每個測試前執行
    },
    
    afterTest: function (test, context, { error, result, duration, passed, retries }) {
        if (error) {
            browser.saveScreenshot(`./test/e2e/screenshots/${test.title}.png`);
        }
    }
};
