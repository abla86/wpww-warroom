# Security Policy

## Reporting a vulnerability

Do not open a public GitHub issue for a suspected security vulnerability.

Report suspected vulnerabilities privately through GitHub's repository security reporting mechanism when available. Include the affected component, reproduction steps, impact, and mitigation if known.

Never include real credentials, API keys, passwords, private keys, or personal data in a report.

## Secrets

Never commit credentials or production secrets. Use environment variables and GitHub Actions secrets. The committed .env.example contains placeholders only.

## Branch policy

main is the protected release branch. Changes should go through pull requests and pass CI/security checks before merging.
