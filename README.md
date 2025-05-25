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

## ⌨️ How to use command line options

Some command line options are simple strings, such as the env file pathname `./.env` in the following example:

```sh
$ envloadr --file=./.env node dist/index.js
```

Each option that takes an argument requires an equals sign (`=`) to separate the argument from the option name. If the argument value is a string containing spaces, you must use quotation marks (`'...'` or `"..."`) around the argument. For options that accept a list of values as an argument, the values must be separated by commas (`,`).

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