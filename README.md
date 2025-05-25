# envloadr

**envloadr** is a simple, lightweight, and zero-dependency library that simplifies the process of loading environment variables from files into the runtime environment of an application.

## 💡 Why
- **For simplicity**. In many projects, environment variables are distributed across multiple files (e.g., `.env`, `.env.dev`, `.env.prod`, etc.), requiring loading each file one by one manually.
```json
"start": "node --env-file=.env --env-file=.env.prod --env-file=.env.local start.js"
```
With the `--file` option (or its alias `-f`), you can directly specify a list of file paths, simplifying commands and improving readability.
```json
"start": "envloadr -f=.env,.env.prod,.env.local start.js"
```

- **For convenience**. In some scenarios, a script may internally execute other scripts that require the same environment variables.
```json
"build": "node --env-file=.env.prod check-env.js && node --env-file=.env.prod build.js",
"deploy": "npm run -- build && node deploy.js"
```
**envloadr** propagates environment variables from the parent to child processes. This eliminates the need to manually reload the same `.env` files in each subprocess, reducing repetition, simplifying execution, and minimizing errors.
```json
"build": "node check-env.js && node build.js",
"deploy": "envloadr -f=.env.prod npm run -- build && node deploy.js"
```

- **For efficiency**. In workflows where the same script needs to run with different environment variables (e.g., development vs production)
```json
"db:up:dev": "node --env-file=.env.dev database.js",
"db:up:prod": "node --env-file=.env.prod database.js",
"dev": "npm run -- db:up:dev && node --env-file=.env.dev dev.js",
"start": "npm run -- db:up:prod && node --env-file=.env.prod start.js",
```
Since **envloadr** loads environment variables in the parent process, child scripts can be abstracted from the environment they run in. This reduces the need to duplicate scripts, promoting cleaner, more reusable, and maintainable code.
```json
"db:up": "node database.js",
"dev": "envloadr --file=.env.dev db:up && node --env-file=.env.dev dev.js",
"start": "envloadr --file=.env.prod db:up && node --env-file=.env.prod start.js",
```

## ⌨️ How to use

The basic syntax of **envloadr** is as follows:
```bash
envloadr [<options>] <target-command>
```

- **options**: These are optional flags you can use to configure **envloadr**. Options that take an argument require an equals sign (`=`) to separate the option name from the argument. For list arguments, separate values with commas (`,`). If the argument contains spaces, enclose it in quotation marks (`'...'` or `"..."`).

- **target-command**: The command to run once the environment variables are loaded. This is **required**.

### Basic usage

To use **envloadr**, you can add it to your `package.json` scripts like this:
```json
{
  "scripts": {
    "start": "envloadr -- node app.js"
  }
}
```

This will automatically load the environment variables from the `./.env` file and run the provided command with those variables set. Alternatively, you can specify a different file by using the `--file` option (or its alias `-f`) like this:
```json
{
  "scripts": {
    "start": "envloadr --file=.env.prod -- node app.js"
  }
}
```

## ⚙️ Available command line options

You can use the following command line options to override the default configuration settings

#### `--file=<env-file-path>[,<env-file-path>]*` or `-f=<env-file-path>[,<env-file-path>]*`
Specifies the source file(s) from which variables will be loaded into the runtime environment. By default, if this option is not used, the `./.env` file will be loaded.

```sh
$ envloadr --file=.env,.env.prod node dist/index.js
```

This option follows a defined loading order: the specified files are read sequentially from left to right, and the variables within each file are processed sequentially from top to bottom.

#### `--no-override`
By default, **envloadr** overwrites the value of variables that are defined multiple times. This option prevents overwriting, causing repeated variables to retain their first associated value.

#### `--verbose` or `-v`
Enables detailed output in the console about the process of loading environment variables, which can be helpful for debugging.

#### `--help` or `-h`
Displays help information about the library, including a list of available options and their usage. This is useful for understanding how to use the library and its commands.