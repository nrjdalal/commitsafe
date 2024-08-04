# commitsafe - a CLI tool to help you not to worry about exposing your secrets in your .env files when you commit them to your repository

> NPM: [commitsafe](https://www.npmjs.com/package/commitsafe)

```
Usage: commitsafe [options] <files...>

encrypt and decrypt environment variables in a file

Arguments:
  files            Files to encrypt or decrypt

Options:
  -l, --list       list given files and their keys
  -e, --encrypt    encrypt environment variables in a file
  -d, --decrypt    decrypt environment variables in a file
  -k, --key <key>  optional: key to encrypt or decrypt environment variables, defaults to a keys stored in ~/.commitsafe
  -h, --help       display help for command
```

## What it does

```env
# original .env file
HELLO=world

# after running `commitsafe -e .env`
HELLO=encrypted::U2FsdGVkX1/A1PgtAOSvOKQjs5CgGX+Y2gXGahVkgHc=

# after running `commitsafe -d .env`
HELLO=world
```

## How to use

### Single file

```bash
# encryption
commitsafe -e .env

# decryption
commitsafe -d .env
```

### Multiple files

```bash
# encryption
commitsafe -e .env .env.local ...

# decryption
commitsafe -d .env .env.local ...
```

### Using a key (useful for CI/CD)

```bash
# encryption
commitsafe -e .env -k my-secret-key

# decryption
commitsafe -d .env -k my-secret-key
```

### List files and their keys

```bash
commitsafe -l .env .env.local ...
```

---

## How to easily commit your .env files without worrying about exposing your secrets

### Using pre-commit hooks with lint-staged and simple-git-hooks

1. Install the required dev dependencies

```bash
bun add -D commitsafe lint-staged simple-git-hooks
```

2. Add the following to your `package.json` and run `bun run prepare`

```json
{
  // ... package.json
  "scripts": {
    "prepare": "bunx simple-git-hooks"
  },
  "lint-staged": {
    ".env*": ["commitsafe -e"]
  },
  "simple-git-hooks": {
    "pre-commit": "bunx lint-staged"
  }
}
```
