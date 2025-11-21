const [runId, repo, actor] = process.argv.slice(2);

let input = '';

process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  const results = JSON.parse(input || '{}');

  const passed = results?.stats?.expected || 0;
  const failed = results?.stats?.unexpected || 0;
  const skipped = results?.stats?.skipped || 0;
  const total = passed + failed + skipped;
  const duration = results?.stats?.duration || 0;

  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  const summaryTable = `
| Total | ✅ Passed | ⏭️ Skipped | ❌ Failed | ⏱️ Duration |
|-------|-----------|-------------|-----------|-------------|
| ${total} ran | ${passed} passed | ${skipped} skipped | ${failed} failed | ${durationStr} |
  `.trim();

  const formatDateTime = (date) => {
    const day = date.toLocaleString('en-IN', {
      day: '2-digit',
      timeZone: 'Asia/Kolkata',
    });

    const month = date.toLocaleString('en-IN', {
      month: 'long',
      timeZone: 'Asia/Kolkata',
    });

    const time = date.toLocaleString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });

    return `${day} ${month} @ ${time.toUpperCase()}`;
  };

  // Function to recursively collect all test results
  const collectTests = (suites = [], parentTitles = []) => {
    let tests = [];

    for (const suite of suites) {
      const currentTitles = [...parentTitles, suite.title].filter(Boolean);

      // Add tests from this suite
      if (suite.specs) {
        for (const spec of suite.specs) {
          // Check for skipped tests in the test results
          const isSkipped = spec.tests?.some((test) => test.results?.some((result) => result.status === 'skipped'));

          // Check for failed tests
          const isFailed = !spec.ok && !isSkipped;

          tests.push({
            title: [...currentTitles, spec.title].join(' › '),
            status: isSkipped ? 'skipped' : isFailed ? 'failed' : 'passed',
            ...spec,
          });
        }
      }

      // Process nested suites
      if (suite.suites) {
        tests = tests.concat(collectTests(suite.suites, currentTitles));
      }
    }

    return tests;
  };

  // Get all tests with their full title paths
  const allTests = collectTests(results.suites || []);

  // Get failed and skipped tests
  const failedTests = allTests.filter((t) => t.status === 'failed');
  const skippedTests = allTests.filter((t) => t.status === 'skipped');

  const formattedDate = formatDateTime(new Date());

  const statusMessage =
    failed > 0
      ? `❌ ${failed} of ${total} tests failed. Time to squish some bugs 🐛`
      : `✅ All ${passed} tests passed! Great work!`;

  const formatTestList = (tests, emoji, label) => {
    if (!tests.length) return '';

    return [
      `### ${emoji} ${label} Tests`,
      '',
      '| Test | Browser | Status |',
      '|------|---------|--------|',
      ...tests.map((t) => {
        // Extract browser name from the first test result
        const browser = t.tests?.[0]?.projectName || 'unknown';

        return `| ${t.title} | ${browser} | ${emoji} ${label} |`;
      }),
    ].join('\n');
  };

  const failedTestsSection = failedTests.length ? formatTestList(failedTests, '❌', 'Failed') : '';
  const skippedTestsSection = skippedTests.length ? formatTestList(skippedTests, '⏭️', 'Skipped') : '';

  const markdownPlaywrightComment = `
## 🎭 Playwright Test Results

${summaryTable}

${statusMessage}

${failedTestsSection}

${skippedTestsSection}

📊 Dive deeper into test results: [View full report](https://github.com/${repo}/actions/runs/${runId})
🕓 Executed on: ${formattedDate}
🧩 **Test Environment**
- Base URL: https://app.zamp.ai
- Browser: Chromium + WebKit
- Headless: true
- Triggered by: @${actor}

---

✨ Powered by Playwright & GitHub Actions – Keeping bugs in check! 🐞
  `.trim();

  console.log(markdownPlaywrightComment);
});
