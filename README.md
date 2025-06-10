# envloadr

[![CI](https://github.com/patoale/envloadr/actions/workflows/ci.yml/badge.svg)](https://github.com/patoale/envloadr/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/patoale/envloadr/graph/badge.svg?token=TBJGQ4LBYE)](https://codecov.io/gh/patoale/envloadr)
[![NPM Version](https://img.shields.io/npm/v/envloadr?logo=npm&logoColor=%23CB3837)](https://www.npmjs.com/package/envloadr)
[![NPM License](https://img.shields.io/npm/l/envloadr?logo=opensourceinitiative&logoColor=%23FFFFFF)](https://www.npmjs.com/package/envloadr)

**envloadr** is a simple, lightweight, and zero-dependency library for Node.js that simplifies the process of loading environment variables from files into the runtime environment of an application.

## Table of Contents

- 💡 [Why This Project](#-why-this-project)
- 🌱 [Installing](#-installing)
- ⌨️ [How to Use](#-how-to-use)
- ⚙️ [Options](#-options)
- 📚 [Examples](#-examples)
- 🤝 [Contributing](#-contributing)
- 📄 [License](#-license)

## 💡 Why This Project

- **For simplicity**. In many projects, environment variables are distributed across multiple files (e.g., `.env`, `.env.dev`, `.env.prod`, etc.), requiring you to load each file individually, one by one:
```bash
node --env-file=.env --env-file=.env.prod --env-file=.env.local start.js
```

With the `--file` option (or its alias `-f`), you can specify a list of file paths, simplifying commands and improving readability:
```bash
envloadr -f=.env,.env.prod,.env.local start.js
```

- **For convenience**. In some cases, script in your `package.json` may internally execute other scripts that depend on the same environment variables, requiring the same `.env` file to be loaded multiple times:
```json
{
  "scripts": {
    "build": "node --env-file=.env.prod check-env.js && node --env-file=.env.prod build.js",
    "deploy": "npm run -- build && node deploy.js"
  }
}
```

**envloadr** propagates environment variables from parent to child processes, so you don't need to reload the same `.env` files in each child script, reducing repetition and minimizing errors:
```json
{
  "scripts": {
    "build": "node check-env.js && node build.js",
    "deploy": "envloadr -f=.env.prod npm run -- build && node deploy.js"
  }
}
```

- **For efficiency**. There are scenarios in the `package.json` where the same script needs to run with different environment variables depending on the context (e.g., development vs production), leading to script duplication:
```json
{
  "scripts": {
    "db:up:dev": "node --env-file=.env.dev database.js",
    "db:up:prod": "node --env-file=.env.prod database.js",
    "dev": "npm run -- db:up:dev && node --env-file=.env.dev dev.js",
    "start": "npm run -- db:up:prod && node --env-file=.env.prod start.js"
  }
}
```

Since **envloadr** loads environment variables in parent processes, child scripts can be abstracted from the context they run in, reducing duplicate scripts and promoting more reusable and maintainable code:
```json
{
  "scripts": {
    "db:up": "node database.js",
    "dev": "envloadr --file=.env.dev db:up && node --env-file=.env.dev dev.js",
    "start": "envloadr --file=.env.prod db:up && node --env-file=.env.prod start.js"
  }
}
```

## 🌱 Installing

To install **envloadr**, you can use **npm**, **yarn**, or **pnpm**.

### Using npm:

```bash
npm install envloadr
```

### Using yarn:

```bash
yarn add envloadr
```

### Using pnpm:

```bash
pnpm add envloadr
```

## ⌨️ How to Use

The basic syntax of **envloadr** is as follows:
```bash
envloadr [<options>] <target-command>
```

- **options**: These are optional flags you can use to configure **envloadr**. Options that take an argument require an equals sign (`=`) to separate the option name from the argument. For list arguments, separate values with commas (`,`). If the argument contains spaces, enclose it in quotation marks (`'...'` or `"..."`).

- **target-command**: The command to run once the environment variables are loaded. This is **required**.

### Basic Usage

First, create a `.env` file in the root of your project:
```env
API_KEY="your_api_key_here"
API_PORT=4000
```

Next, add **envloadr** to your `package.json` scripts like this:
```json
{
  "scripts": {
    "start": "envloadr node app.js"
  }
}
```
This will automatically load the environment variables from the `./.env` file and run the provided command with those variables set.

Now, you can access the keys and values you defined in your `.env` file through `process.env`, like this:
```js
express.listen(process.env.API_PORT, () => {
  console.log(`[API] Service is up & ready!`);
});
```

Alternatively, you can specify a different file using the `--file` option (or its alias `-f`):
```json
{
  "scripts": {
    "start": "envloadr --file=.env.prod node app.js"
  }
}
```

## ⚙️ Options

You can use the following command line options to override the default configuration settings

#### `--file=<file-path>[,<file-path>...]` or `-f=<file-path>[,<file-path>...]`
Specifies the source file(s) from which variables will be loaded into the runtime environment. By default, if this option is not used, the `./.env` file will be loaded.

This option follows a defined loading order: the specified files are read sequentially from left to right, and the variables within each file are processed sequentially from top to bottom.

#### `--no-override[=true|false]`
By default, **envloadr** overwrites the value of variables that are defined multiple times. This option prevents overwriting, causing repeated variables to retain their first associated value.

#### `--verbose[=true|false]` or `-v[=true|false]`
Enables detailed output in the console about the process of loading environment variables, which can be helpful for debugging.

#### `--help` or `-h`
Displays help information about the library, including a list of available options and their usage. This is useful for understanding how to use the library and its commands.

## 📚 Examples

> [!NOTE]
> Although the examples use `npm`, you can use any npm-compatible package manager such as `yarn` or `pnpm` with the same commands.

### Using from the Terminal

- **Load from default `.env` file:**
```bash
envloadr npm start
```

- **Load multiple `.env` files:**
```bash
envloadr --file=.env,.env.prod node server.js
```

- **Prevent overwriting existing variables:**
```bash
envloadr --no-override node app.js
```

- **Show detailed output of loaded variables:**
```bash
envloadr --verbose=true npm run dev
```

- **Combine multiple options:**
```bash
envloadr -f=.env.prod,.env.secret --no-override -v npm run build
```

### Using in `package.json` Scripts

```json
{
  "scripts": {
    "db:migrate": "sequelize db:migrate",
    "start": "envloadr -f=.env.prod npm run -- db:migrate && envloadr -f=.env.prod node dist/index.js",
    "dev": "envloadr -v npm run -- db:migrate && envloadr -v node src/index.js",
    "build": "envloadr --file=.env.prod webpack",
    "test": "envloadr -f=.env,.env.test --verbose --no-override jest"
  }
}
```

Then run scripts as usual:
```bash
npm run build && npm start
```

## 🤝 Contributing

Want to contribute? Awesome! Please check out the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to get started.

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).