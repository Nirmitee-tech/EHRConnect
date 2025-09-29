# Contributing to EHRConnect

## Welcome & Scope

We welcome contributions to EHRConnect! Whether you're interested in reporting issues, improving documentation, or contributing code, your participation helps make this project better for everyone.

## Getting Started

### Prerequisites

- Git
- Node.js LTS (for ehr-web)
- Python 3.11+ (for ehr-integration-gateway if applicable)
- Docker (optional)

### Clone & Branch Workflow

```bash
git clone https://github.com/Nirmitee-tech/EHRConnect.git
git checkout -b feat/<short-name>
```

## Project Structure (Monorepo)

```
/ehr-web                    - Frontend web application
/ehr-api                    - Backend API services  
/ehr-integration-gateway    - Integration gateway for EHR systems
/infra/helm                 - Kubernetes Helm charts for deployment
```

## How to Contribute

1. **For major changes**: Open an issue first to discuss your proposed changes
2. **For small fixes**: You can directly open a Pull Request

## Coding & Commit Conventions

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Examples:

```
feat(api): add Patient endpoint
fix(web): resolve CORS error on dev server
docs: update README for setup
```

### Code Standards

- Keep PRs focused and include tests where applicable
- Follow existing code style and patterns
- Write clear, descriptive commit messages

## PR Process

1. **Link the issue** your PR closes (if applicable)
2. **Use our checklist**:
   - [ ] Tests pass
   - [ ] Documentation updated (if needed)
   - [ ] No secrets or sensitive data in diff
   - [ ] PR description clearly explains changes

## Security Policy

If you discover a security vulnerability, please report it privately to security@ehrconnect.org rather than opening a public issue.

## License

By contributing to EHRConnect, you agree that your contributions will be licensed under the Apache License 2.0. See [LICENSE](./LICENSE) for details.

---

Thank you for contributing to EHRConnect! 🚀
