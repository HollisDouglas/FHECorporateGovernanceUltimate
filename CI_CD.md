# CI/CD Documentation

Comprehensive Continuous Integration and Continuous Deployment setup for the Corporate Governance Platform.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Code Quality Tools](#code-quality-tools)
- [Coverage Reporting](#coverage-reporting)
- [Setup Instructions](#setup-instructions)
- [Workflow Triggers](#workflow-triggers)
- [Secrets Configuration](#secrets-configuration)

## Overview

This project uses GitHub Actions for automated testing, code quality checks, and deployment. The CI/CD pipeline ensures code quality, security, and reliability before deployment.

### CI/CD Features

✅ **Automated Testing** on push and pull requests
✅ **Multi-Node Version Testing** (Node 18.x, 20.x)
✅ **Cross-Platform Testing** (Ubuntu, Windows)
✅ **Code Quality Checks** with Solhint
✅ **Code Coverage** with Codecov integration
✅ **Gas Reporting** for contract optimization
✅ **Security Audits** with npm audit
✅ **Automated Deployment** to Sepolia/Mainnet
✅ **Contract Verification** on Etherscan

## GitHub Actions Workflows

### 1. Test and Coverage (`test.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### Test Job
- Runs on Node.js 18.x and 20.x
- Executes on Ubuntu Linux
- Steps:
  1. Checkout code
  2. Setup Node.js with caching
  3. Install dependencies
  4. Run Solhint code quality checks
  5. Compile contracts
  6. Run all tests
  7. Generate coverage report
  8. Upload coverage to Codecov (Node 20.x only)
  9. Archive test results

#### Windows Test Job
- Runs on Windows with Node.js 20.x
- Ensures cross-platform compatibility
- Runs compilation and tests

#### Gas Report Job
- Generates detailed gas usage report
- Uploads report as artifact
- Helps optimize contract efficiency

#### Security Check Job
- Runs npm audit for vulnerabilities
- Optional Slither security analysis
- Identifies potential security issues

#### Summary Job
- Aggregates all test results
- Posts summary to GitHub Actions
- Provides pass/fail status

**Usage:**
```bash
# Automatically runs on push/PR
# Manual trigger (if configured):
# gh workflow run test.yml
```

### 2. Deployment (`deploy.yml`)

**Triggers:**
- Manual workflow dispatch only

**Parameters:**
- `network`: Choose between `sepolia` or `mainnet`

**Jobs:**

#### Deploy Job
- Runs on Ubuntu Linux
- Requires environment-specific secrets
- Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Compile contracts
  5. Run tests before deployment
  6. Deploy to selected network
  7. Verify contract on Etherscan
  8. Upload deployment artifacts
  9. Generate deployment summary

**Usage:**
```bash
# Via GitHub UI: Actions > Deploy to Sepolia > Run workflow
# Or via GitHub CLI:
gh workflow run deploy.yml -f network=sepolia
```

### 3. Pull Request Check (`pr-check.yml`)

**Triggers:**
- Pull request opened, synchronized, or reopened

**Jobs:**

#### Quality Check
- Runs Solhint linting
- Checks compilation
- Runs full test suite
- Verifies coverage thresholds
- Posts results as PR comment

#### Size Check
- Analyzes compiled contract sizes
- Ensures contracts fit within size limits
- Posts summary to workflow

#### Security Audit
- Runs npm audit
- Checks for known vulnerabilities
- Provides security summary

**Usage:**
```bash
# Automatically runs on all PRs
# Results posted as PR comments
```

## Code Quality Tools

### Solhint

Solidity linter for code quality and best practices.

**Configuration:** `.solhint.json`

**Rules:**
- Code complexity: max 10
- Compiler version: ^0.8.20
- Function visibility required
- Max line length: 120
- No empty blocks
- Proper naming conventions
- State visibility enforcement

**Commands:**
```bash
# Run linting
npm run lint:sol

# Auto-fix issues
npm run lint:sol:fix
```

### Prettier

Code formatter for consistent styling.

**Configuration:** `.prettierrc`

**Commands:**
```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

## Coverage Reporting

### Codecov Integration

**Configuration:** `codecov.yml`

**Settings:**
- Target coverage: 90% for project
- Patch coverage: 85%
- Precision: 2 decimal places
- Automatic PR comments
- Coverage badges

**Coverage Thresholds:**
- Project: 90% target, 2% threshold
- Patch: 85% target, 5% threshold

**Ignored Paths:**
- `test/**/*`
- `scripts/**/*`
- `**/*.config.js`

**View Coverage:**
- Codecov dashboard: `https://codecov.io/gh/YOUR_ORG/YOUR_REPO`
- PR comments show coverage changes
- GitHub Actions upload coverage after tests

## Setup Instructions

### 1. GitHub Repository Setup

1. Create repository on GitHub
2. Push code to repository
3. Enable GitHub Actions (enabled by default)

### 2. Configure Secrets

Go to: `Settings > Secrets and variables > Actions`

**Required Secrets:**

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `PRIVATE_KEY` | Deployment wallet private key | Deployment |
| `SEPOLIA_RPC_URL` | Sepolia RPC endpoint | Sepolia deployment |
| `MAINNET_RPC_URL` | Mainnet RPC endpoint | Mainnet deployment |
| `ETHERSCAN_API_KEY` | Etherscan verification key | Contract verification |
| `CODECOV_TOKEN` | Codecov upload token | Coverage reporting |

**How to Add Secrets:**

```bash
# Using GitHub CLI
gh secret set PRIVATE_KEY -b "your_private_key_here"
gh secret set ETHERSCAN_API_KEY -b "your_api_key_here"
gh secret set CODECOV_TOKEN -b "your_codecov_token_here"

# Or via GitHub UI:
# Settings > Secrets and variables > Actions > New repository secret
```

### 3. Codecov Setup

1. Sign up at [codecov.io](https://codecov.io)
2. Link your GitHub repository
3. Get your Codecov token
4. Add token to GitHub secrets as `CODECOV_TOKEN`
5. Coverage reports will upload automatically

### 4. Enable Workflow Permissions

Go to: `Settings > Actions > General`

**Workflow permissions:**
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

## Workflow Triggers

### Automatic Triggers

| Event | Workflow | Branches |
|-------|----------|----------|
| Push | Test and Coverage | main, develop |
| Pull Request | Test and Coverage | main, develop |
| Pull Request | PR Check | all PRs |

### Manual Triggers

| Workflow | How to Trigger |
|----------|----------------|
| Deploy | GitHub UI > Actions > Deploy > Run workflow |
| Test (manual) | Can enable workflow_dispatch in test.yml |

## Local Development

Run CI checks locally before pushing:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint:sol

# Check formatting
npm run format:check

# Run tests
npm test

# Generate coverage
npm run coverage

# Check gas usage
npm run test:gas

# Security audit
npm audit
```

## Continuous Integration Flow

```
┌─────────────────────────────────────────────────┐
│  Developer pushes code to GitHub                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  GitHub Actions: Test Workflow Triggered        │
├─────────────────────────────────────────────────┤
│  1. Checkout code                                │
│  2. Setup Node.js (18.x, 20.x)                  │
│  3. Install dependencies                         │
│  4. Run Solhint                                  │
│  5. Compile contracts                            │
│  6. Run tests                                    │
│  7. Generate coverage                            │
│  8. Upload to Codecov                            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  All checks passed? ──────Yes────────▶ ✅ Merge  │
│         │                                        │
│        No                                        │
│         ▼                                        │
│  ❌ Fix issues and push again                    │
└─────────────────────────────────────────────────┘
```

## Deployment Flow

```
┌─────────────────────────────────────────────────┐
│  Manual Trigger: Deploy Workflow                │
│  Select Network: Sepolia or Mainnet             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  GitHub Actions: Deploy Workflow                │
├─────────────────────────────────────────────────┤
│  1. Checkout code                                │
│  2. Setup environment                            │
│  3. Run tests                                    │
│  4. Deploy contracts                             │
│  5. Verify on Etherscan                          │
│  6. Upload artifacts                             │
│  7. Create summary                               │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  ✅ Deployment Complete                          │
│  📦 Artifacts available for download            │
│  🔗 Etherscan link in workflow output           │
└─────────────────────────────────────────────────┘
```

## Best Practices

### For Developers

1. **Before Pushing:**
   - Run `npm run lint:sol` to check code quality
   - Run `npm test` to ensure tests pass
   - Run `npm run coverage` to check coverage
   - Fix any issues before pushing

2. **Pull Requests:**
   - Wait for all CI checks to pass
   - Review coverage report in PR comments
   - Address any security warnings
   - Ensure gas usage is reasonable

3. **Deployments:**
   - Always deploy to Sepolia first
   - Test thoroughly on testnet
   - Review gas costs
   - Verify contract on Etherscan
   - Only then consider mainnet deployment

### For Maintainers

1. **Protect Branches:**
   - Require CI checks to pass before merge
   - Require code review approval
   - Enforce linear history (optional)

2. **Monitor Workflows:**
   - Check GitHub Actions regularly
   - Review failed workflow logs
   - Update dependencies periodically
   - Rotate secrets annually

3. **Security:**
   - Never commit secrets to repository
   - Use environment-specific secrets
   - Review npm audit reports
   - Keep dependencies updated

## Troubleshooting

### Common Issues

#### Tests Fail Locally But Pass in CI

**Problem:** Tests pass on your machine but fail in CI.

**Solutions:**
- Ensure you're using the correct Node.js version
- Run `npm ci` instead of `npm install`
- Check for hardcoded paths or environment variables
- Review test timeout settings

#### Coverage Upload Fails

**Problem:** Codecov upload fails or shows errors.

**Solutions:**
- Verify `CODECOV_TOKEN` is set correctly
- Check codecov.yml configuration
- Ensure coverage files are generated
- Review Codecov dashboard for errors

#### Deployment Fails

**Problem:** Deployment workflow fails.

**Solutions:**
- Verify all secrets are set correctly
- Check wallet has sufficient balance
- Ensure RPC URL is accessible
- Review error logs in workflow output

#### Gas Limit Exceeded

**Problem:** Deployment fails due to gas limit.

**Solutions:**
- Review contract size
- Optimize contract code
- Check gas price settings
- Use more efficient patterns

## Monitoring and Alerts

### GitHub Actions

- **Status Badges:** Add to README
- **Email Notifications:** Configure in GitHub settings
- **Slack Integration:** Set up GitHub app for Slack

### Codecov

- **Coverage Badge:** Display in README
- **Slack Notifications:** Configure in Codecov settings
- **Email Alerts:** Set threshold alerts

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com/)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Hardhat Testing](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)

## Status Badges

Add these to your README.md:

```markdown
[![Tests](https://github.com/YOUR_ORG/YOUR_REPO/workflows/Test%20and%20Coverage/badge.svg)](https://github.com/YOUR_ORG/YOUR_REPO/actions)
[![codecov](https://codecov.io/gh/YOUR_ORG/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_ORG/YOUR_REPO)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

---

**CI/CD Pipeline Status:** ✅ Active
**Last Updated:** 2024
**Maintained By:** Development Team
