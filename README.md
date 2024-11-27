# commitsafe

> A powerful CLI tool that encrypts and decrypts .env files to protect your sensitive information during git commits. CommitSafe ensures that secrets remain secure and reduces the risk of accidental exposure in your repositories.

![npm version](https://img.shields.io/npm/v/commitsafe)
![license](https://img.shields.io/npm/l/commitsafe)
![downloads](https://img.shields.io/npm/dt/commitsafe)

- **NPM Package:** [commitsafe](https://www.npmjs.com/package/commitsafe)
- **GitHub Repository:** [nrjdalal/commitsafe](https://github.com/nrjdalal/commitsafe)

## What's New in Version 2.3.0?

- Enhanced Git hooks integration for seamless operation.
- Transitioned encryption/decryption backend from `npm:crypto-js` to the efficient `node:crypto` module.

## Installation

You can install `commitsafe` using either npm or bun:

```bash
# Using npm
npm install --save-dev commitsafe
```

```bash
# Using bun
bun add --dev commitsafe
```

## Usage

`commitsafe` enables encryption and decryption of environment variables within files. Run `commitsafe --help` for command-line interface details:

```
Usage: commitsafe [options] <files...>

Encrypt and decrypt environment variables in a file.

Arguments:
  <files...>       Files to encrypt or decrypt

Options:
  -l, --list       List files and their corresponding encryption keys
  -e, --encrypt    Encrypt environment variables in a file
  -d, --decrypt    Decrypt environment variables in a file
  -k, --key <key>  Optional: Specify the encryption/decryption key. By default, commitsafe uses keys stored in ~/.commitsafe
  -h, --help       Display help for command
```

## How It Works

- Encrypts specified environment variables in `.env` files.
- Securely decrypts the variables back when needed.

Example:

```env
# Original .env file
HELLO=world

# After running `commitsafe -e .env`
HELLO=encrypted::8cwf0HbsXjaniUiCZ4EH+A==:7XMi+FfjoKu3b+q/lRNuwQ==

# After running `commitsafe -d .env`
HELLO=world
```

## Instructions

### Encrypting/Decrypting a Single File

```bash
# Encrypt a single .env file
commitsafe -e .env

# Decrypt a single .env file
commitsafe -d .env
```

### Encrypting/Decrypting Multiple Files

```bash
# Encrypt multiple .env files
commitsafe -e .env .env.local ...

# Decrypt multiple .env files
commitsafe -d .env .env.local ...
```

### Using a Specific Key (Ideal for CI/CD Environments)

```bash
# Encrypt using a specific key
commitsafe -e .env -k my-secret-key

# Decrypt using a specific key
commitsafe -d .env -k my-secret-key
```

### Listing Files and Their Encryption Keys

```bash
commitsafe -l .env .env.local ...
```

## Best Practices: Committing `.env` Files Safely

To automate the safe management of `.env` files using Git hooks, follow these steps:

1. **Install necessary development dependencies:**

   ```bash
   bun add -D commitsafe lint-staged simple-git-hooks
   ```

2. **Encrypt your `.env` file initially to set up an encryption key:**

   ```bash
   commitsafe -e .env
   ```

3. **Configure Git hooks and lint-staged in your `package.json`:**

   Add the following scripts to automate pre-commit encryption and post-commit decryption:

   ```json
   // In package.json
   {
     "scripts": {
       "prepare": "simple-git-hooks"
     },
     "lint-staged": {
       ".env": ["commitsafe -e"]
     },
     "simple-git-hooks": {
       "pre-commit": "bunx lint-staged",
       "post-commit": "bunx commitsafe -d .env"
     }
   }
   ```

   Then, apply the hook configuration with:

   ```bash
   bun run prepare
   ```

---

By leveraging `commitsafe`, you can confidently manage your `.env` files by ensuring that sensitive information remains encrypted, reducing the risk of accidental exposure.

For more details, visit the [GitHub repository](https://github.com/nrjdalal/commitsafe). If you encounter issues, please report them [here](https://github.com/nrjdalal/commitsafe/issues).

This project is licensed under the MIT License.
