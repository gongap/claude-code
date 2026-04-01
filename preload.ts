// Preload script: defines build-time globals that are normally inlined by Bun bundler

// @ts-ignore - global MACRO object normally inlined at build time
globalThis.MACRO = {
  VERSION: '1.0.0-dev',
  VERSION_CHANGELOG: '',
  BUILD_TIME: new Date().toISOString(),
  FEEDBACK_CHANNEL: 'https://github.com/anthropics/claude-code/issues',
  ISSUES_EXPLAINER: 'report the issue at https://github.com/anthropics/claude-code/issues',
  NATIVE_PACKAGE_URL: '',
  PACKAGE_URL: '',
}
