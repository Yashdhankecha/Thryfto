# Contributing to ReWear

Thank you for your interest in contributing to our project! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### 1. Fork the Repository
1. Go to the main repository page
2. Click the "Fork" button in the top right corner
3. Clone your forked repository to your local machine

### 2. Set Up Development Environment
```bash
# Clone your fork
git clone https://github.com/yourusername/ReWear.git
cd ReWear

# Install dependencies
cd server && npm install
cd ../client && npm install

# Set up environment variables
# Copy .env.example to .env and configure
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 4. Make Your Changes
- Write clean, readable code
- Follow the existing code style
- Add comments where necessary
- Update documentation if needed

### 5. Test Your Changes
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Manual testing
npm run dev
```

### 6. Commit Your Changes
```bash
git add .
git commit -m "feat: add new authentication feature"
```

### 7. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 🧪 Testing Guidelines

### Backend Testing
- Write unit tests for new functions
- Test API endpoints
- Ensure error handling works correctly

### Frontend Testing
- Test component functionality
- Ensure responsive design works
- Test user interactions

## 📋 Pull Request Guidelines

### Before Submitting
1. **Test thoroughly** - Ensure all tests pass
2. **Update documentation** - If adding new features
3. **Check code style** - Follow existing patterns
4. **Squash commits** - Keep history clean

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Backend tests pass
- [ ] Frontend tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🐛 Reporting Bugs

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10]
- Node.js version: [e.g., 16.14.0]
- Browser: [e.g., Chrome 91]

## Additional Information
Screenshots, logs, etc.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Use Case
Why this feature is needed

## Proposed Implementation
How you think it should be implemented

## Alternatives Considered
Other approaches you considered
```

## 🔧 Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Environment Variables
Create `.env` files in both `server/` and `client/` directories:

#### Server (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-jwt-secret
MONGODB_URI=mongodb://localhost:27017/mern-auth-app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
```

#### Client (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📚 Code Style Guidelines

### JavaScript/Node.js
- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable names
- Add JSDoc comments for functions

### React
- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Keep components small and focused

### CSS
- Use Tailwind CSS classes
- Follow BEM methodology for custom CSS
- Keep styles organized and maintainable

## 🚀 Getting Help

If you need help with contributing:

1. **Check existing issues** - Your question might already be answered
2. **Read the documentation** - Check README.md and inline comments
3. **Ask in discussions** - Use GitHub Discussions for questions
4. **Join our community** - Connect with other contributors

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- GitHub contributors page

Thank you for contributing to ReWear! 🎉 