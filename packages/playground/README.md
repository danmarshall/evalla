# Evalla Playground

An interactive Astro-based playground for experimenting with the evalla math evaluator library.

## 🚀 Features

- **Live Evaluation**: Test evalla expressions in real-time
- **Interactive UI**: Add, edit, and remove expressions dynamically
- **Built-in Examples**: Load pre-configured examples to get started quickly
- **Error Handling**: Clear error messages and visual feedback
- **Dependency Visualization**: See evaluation order for dependent variables

## 🎮 Try It Out

The playground allows you to:

- Define multiple variables with math expressions
- Reference other variables in expressions
- Use built-in namespaces (`$math`, `$unit`, `$angle`)
- See results computed with decimal precision
- Experiment with object literals and nested property access

## 🛠️ Development

```bash
# Install dependencies (from monorepo root)
cd ../..
npm install

# Start development server
npm run dev:playground

# Or run from playground directory
cd packages/playground
npm run dev
```

The playground will be available at `http://localhost:4321`

## 📦 Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Example Expressions

The playground comes with built-in examples demonstrating:

- Basic arithmetic with variables
- Using `$math.PI` and other constants
- Calculating geometric formulas
- Object literals and property access
- Unit and angle conversions

## 🔗 Related

- [evalla](../evalla/) - Core math evaluator library
- [Repository README](../../README.md) - Monorepo overview

## 📝 License

MIT
