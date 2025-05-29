# Contributing to envloadr

Thank you for considering contributing to this project! We welcome contributions of all kinds, including bug fixes, feature enhancements, documentation improvements, and more.

## Table of Contents

- [Discussions](#-discussions-for-non-issue-topics)
- [Issues and Feature Requests](#-issues-and-feature-requests)
- [Pull Requests](#-submitting-pull-requests)

## 💬 Discussions for Non-Issue Topics

While we use **Issues** to track bugs, tasks, and specific feature requests, **Discussions** provides a space for more open-ended conversations that **don't require immediate action**. You can use Discussions for:

- 🤔 **Asking questions** about how to use the project, or to clarify parts of the documentation.
- 💡 **Sharing ideas** for new features, improvements, or how the project could evolve.
- 👥 **Engaging with the community** in casual conversations, or discussing the vision of the project.
- 📚 **Providing educational resources**, tutorials, or links that could benefit other contributors.

By keeping these types of conversations in Discussions, we can maintain Issues focused on real problems and development tasks.

## 📝 Issues and Feature Requests

If you’ve found a **task that requires immediate attention** or action, like a **bug** or a **specific feature request**, please follow the steps below.

### Search First

Before opening a new issue, **check the existing [issues](https://github.com/patoale/envloadr/issues)** to see if the same topic has already been reported.  
If you find something similar, consider commenting or adding a reaction instead of creating a duplicate.

### Guidelines for Creating Issues

- **Use a descriptive title** that summarizes the issue clearly.
- **Explain the context**: what you were doing, what you expected, and what actually happened.
- **Provide reproduction steps** or logs if helpful.
- **Tag appropriately** (e.g., `bug`, `enhancement`) if you have permissions.

## 🚀 Submitting Pull Requests

We welcome code contributions! Please follow the steps below to ensure a smooth review process and increase the chances of your pull request being accepted.

### 1. Fork the Repository

Go to the [envloadr GitHub page](https://github.com/patoale/envloadr) and click the **Fork** button at the top right.  

> [!TIP]
> You probably only need to copy the default branch (`develop`). If you skip this, all branches will be copied into your fork.

### 2. Clone Your Fork Locally

Use the following command, replacing `YOUR-USERNAME` with your GitHub username:

```bash
git clone git@github.com:YOUR-USERNAME/envloadr.git
cd envloadr
git remote add upstream https://github.com/patoale/envloadr.git
git fetch upstream
```

### 3. Install Dependencies

This project uses [`pnpm`](https://pnpm.io) as the package manager.

If you don't have it installed, you can install it globally:

```bash
npm install -g pnpm
```

Then install the project dependencies:

```bash
pnpm install
```

> [!WARNING]
> Please do not use npm or yarn, as it may break the dependency structure.

### 4. Create a New Branch

Create a feature branch using the following format:

```bash
git checkout -b <prefix>/<concise-description>
```

This format uses a semantic prefix to describe the type of change you're making. Here are some examples of what the branch name could look like:
- `feat/add-support-for-custom-env-files`
- `fix/missing-error-on-invalid-path`
- `docs/update-contributing-guide`
- `chore/upgrade-dependencies`

#### Semantic Prefix Naming Convention

Here’s a list of available prefixes and their meanings:
- `build`: Changes that affect the build system (e.g., updates to pnpm or build scripts).
- `chore`: Tasks that don't affect functionality (e.g., updating dependencies, modifying configuration files, etc.).
- `ci`: Changes related to continuous integration.
- `docs`: Documentation-only changes.
- `feat`: A new feature.
- `fix`: A bug fix.
- `perf`: Improvements related to performance.
- `refactor`: Code changes that don't add a feature or fix a bug (e.g., renaming a variable, simplifying a function, etc.).
- `style`: Code style changes that don't affect functionality (e.g., formatting, missing semicolons, etc.).
- `test`: Adding new tests or updating existing ones.

### 5. Make Your Changes

Now you can edit or add files under the `/src` directory, write tests under `/tests`, or update documentation.

> [!NOTE]
> If you’ve added a new feature or fixed a bug, don't forget to add or update the relevant tests. See the [tests](#) guide for more information.
>
> If your changes affect how the project is used, make sure to update the documentation.

The project uses automated tools to assist you and help maintain a consistent code style across all contributions.

_For more details on the code style, see the [Code Style](#) section._

### 6. Run Tests

Before committing, make sure all tests pass:

```bash
pnpm test
```

If any tests fail, address the issues before committing your changes.

### 7. Commit Your Changes

Group related changes logically into separate commits. This makes it easier to review changes when they are divided into smaller, focused commits. There's no limit to the number of commits in a pull request.

#### Commit Message Guidelines

We follow the [semantic commit messages](https://conventionalcommits.org) convention, which includes specific prefixes to categorize commits. Here are some examples:
- `feat(cli): add RC file option`
- `fix: resolve duplicated env vars issue`
- `docs: update README "Available options" section`

_For a full list of semantic prefixes and their meanings, see the previous [semantic prefix convention](#semantic-prefix-naming-convention)._

When writing commit messages, please follow these guidelines:
1. The first line should:
    - Be a concise description of the change (no more than 72 characters).
    - Use lowercase, except for proper nouns and code elements (e.g., functions, variables).
2. If you add a body, leave the second line blank.
3. Wrap all lines in the body to 100 characters.

### 8. Rebase Your Branch

Once you've committed your changes, it's a good idea to rebase (not merge) your branch to synchronize your work with the main repository:

```bash
git fetch upstream
git rebase upstream/develop
```

This ensures that your branch is up to date with the latest changes from `patoale/envloadr`'s `develop` branch.

### 9. Push Your Branch

Once your commits are ready, push your branch to your fork on GitHub to start the pull request process:

```bash
git push origin my-branch
```