# Contributing to HealthTrack

Thank you for your interest in contributing to HealthTrack! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/healthtrack.git
   cd healthtrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Project

```bash
# Web app
npm run dev:web

# Mobile app
npm run dev:mobile

# Build packages
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

- `apps/web` - React web application
- `apps/mobile` - React Native mobile app
- `packages/` - Shared packages
- `services/api` - Lambda function handlers
- `services/infra` - AWS CDK infrastructure
- `docs/` - Documentation

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Use enums for fixed sets of values

### React/React Native

- Use functional components with hooks
- Keep components small and focused
- Use meaningful component and variable names
- Extract reusable logic into custom hooks
- Use React Query for data fetching

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `useCamelCase.ts`
- Types: `types.ts` or inline in the same file

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(web): add lab report trend visualization

Added interactive chart component to display lab test value changes over time.

Closes #123
```

```
fix(api): correct upload handler S3 permission issue

Updated IAM policy to grant proper S3 bucket access for pre-signed URLs.
```

## Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run tests and linting**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

3. **Create a pull request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe your changes in detail
   - Add screenshots for UI changes
   - Ensure all CI checks pass

4. **Code Review**
   - Address review feedback promptly
   - Keep discussions focused and respectful
   - Update your PR based on feedback

5. **Merge**
   - Squash commits if requested
   - Ensure branch is up to date
   - Wait for approval from maintainers

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
# Web
npm run test:e2e:web

# Mobile
npm run test:e2e:mobile
```

### Writing Tests

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example:

```typescript
describe('CourseCard', () => {
  it('should display course information correctly', () => {
    // Arrange
    const course = { ... };
    
    // Act
    render(<CourseCard course={course} />);
    
    // Assert
    expect(screen.getByText(course.medicine)).toBeInTheDocument();
  });
});
```

## Security

- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for configuration
- Follow HIPAA compliance guidelines
- Report security vulnerabilities privately

## Documentation

- Update documentation for new features
- Keep README.md current
- Add JSDoc comments for complex functions
- Update API documentation in OpenAPI spec

## Questions?

Feel free to:
- Open an issue for discussion
- Ask questions in pull requests
- Contact maintainers directly

Thank you for contributing to HealthTrack! 🏥
