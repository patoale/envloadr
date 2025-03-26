# envloadr

**envloadr** is a simple, lightweight, and zero-dependency library that simplifies the process of loading environment variables from files into the runtime environment of an application.

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