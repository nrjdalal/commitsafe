#!/usr/bin/env node
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import password from '@inquirer/password'
import { program } from 'commander'
import CryptoJS from 'crypto-js'
import { parse } from 'envfile'
import { customAlphabet } from 'nanoid'
import { z } from 'zod'

process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

const programOptions = z.object({
  encrypt: z.boolean().optional(),
  decrypt: z.boolean().optional(),
  config: z.string().optional(),
  key: z.string().optional(),
  files: z.array(z.string()),
})

async function main() {
  program
    .name('commitsafe')
    .description('encrypt and decrypt environment variables in a file')
    .option('-l, --list', 'list given files and their keys')
    .option('-e, --encrypt', 'encrypt environment variables in a file')
    .option('-d, --decrypt', 'decrypt environment variables in a file')
    .option(
      '-k, --key <key>',
      'optional: key to encrypt or decrypt environment variables, defaults to a keys stored in ~/.commitsafe',
    )
    .argument('<files...>', 'Files to encrypt or decrypt')
    .action(async (files, opts) => {
      try {
        programOptions.parse({ ...opts, files })
      } catch (err) {
        console.error(err.errors)
        process.exit(1)
      }

      if (opts.list) {
        const configfile = path.resolve(os.homedir(), '.commitsafe')

        let config = {}

        try {
          await fs.access(configfile)
          config = parse(await fs.readFile(configfile, 'utf-8'))
        } catch {
          console.error('No keyfile found')
          process.exit(1)
        }

        for (let file of files) {
          const name = path.basename(file)
          file = path.resolve(file)

          if (!config[file]) {
            console.log(`No key found for file: ${name}`)
          } else {
            console.log(`--- ${name} --- \n\n${config[file]}\n`)
          }
        }

        console.log('--- END ---')

        process.exit(0)
      }

      if (opts.encrypt && opts.decrypt) {
        console.error('Cannot encrypt and decrypt at the same time')
        process.exit(1)
      }

      const action = opts.encrypt ? 'encrypt' : opts.decrypt ? 'decrypt' : null

      if (!action) {
        console.error(
          'Either -e | --encrypt or -d | --decrypt option is required',
        )
        process.exit(1)
      }

      let keys = {}

      for (let file of files) {
        const name = path.basename(file)
        file = path.resolve(file)

        try {
          await fs.access(file)
        } catch (err) {
          console.error(`File not found: ${file}`)
          process.exit(1)
        }

        if (opts.key) {
          keys[file] = opts.key
        } else {
          const configfile = path.resolve(os.homedir(), '.commitsafe')

          let config = {}

          try {
            await fs.access(configfile)
            config = parse(await fs.readFile(configfile, 'utf-8'))
          } catch (err) {
            await fs.writeFile(configfile, '', 'utf-8')
          }

          if (!config[file]) {
            try {
              config[file] = await password({
                message: `Enter key for file ${name} ${action}ion:`,
                mask: '*',
              })
            } catch {
              config[file] = null
              console.log('Auto generating key for file')
            }

            if (!config[file]) {
              config[file] = customAlphabet(
                'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                128,
              )()
            }

            await fs.writeFile(
              configfile,
              Object.entries(config)
                .map(([k, v]) => `${k}=${v}`)
                .join('\n'),
              'utf-8',
            )
          }

          keys[file] = config[file]
        }

        console.log(`Processing file: ${name}`)

        const newFile = []
        const lines = (await fs.readFile(file, 'utf-8')).split('\n')

        for (let line in lines) {
          const isEnvLine = parse(lines[line])

          if (Object.keys(isEnvLine).length) {
            const [key, value] = Object.entries(isEnvLine)[0]

            if (action === 'encrypt') {
              if (!value.startsWith('encrypted::')) {
                newFile.push(
                  `${key}=encrypted::${CryptoJS.AES.encrypt(
                    value,
                    keys[file],
                  ).toString()}`,
                )
              } else {
                newFile.push(lines[line])
              }
            }

            if (action === 'decrypt') {
              if (value.startsWith('encrypted::')) {
                newFile.push(
                  `${key}=${CryptoJS.AES.decrypt(
                    value.replace('encrypted::', ''),
                    keys[file],
                  ).toString(CryptoJS.enc.Utf8)}`,
                )
              } else {
                newFile.push(lines[line])
              }
            }
          } else {
            newFile.push(lines[line])
          }
        }

        await fs.writeFile(file, newFile.join('\n'), 'utf-8')
      }
    })

  program.parse()
}

main()
