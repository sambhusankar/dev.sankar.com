# Getting Started with CI/CD Pipelines

CI/CD stands for Continuous Integration and Continuous Deployment. It's a practice that lets you automatically build, test, and deploy your code every time you push a change.

## Why bother?

Without CI/CD, deployments are manual, error-prone, and stressful. With it, every push to your main branch can automatically run tests and ship to production — safely.

## Setting up GitHub Actions

Create a file at `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm test
      - run: npm run build
```

## What happens next

Every time you push to `main`, GitHub spins up a fresh Ubuntu machine, checks out your code, installs dependencies, runs tests, and builds. If any step fails, the pipeline stops and you get an email.

## Adding deployment

After the build step, add a deploy step that pushes your built files to a server, S3 bucket, or any hosting provider. Most providers have official GitHub Actions you can drop in.

## Key takeaways

- Start simple — one workflow file is enough to begin.
- Run tests on every push, not just before releases.
- Automate the boring parts so you can focus on building.
