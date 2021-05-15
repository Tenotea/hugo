#!/usr/bin/env node
import Yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import os from 'os'
import cmd_hugo_run from './commands/run'
import cmd_hugo_stop from './commands/stop'

export const localNetwork = os.networkInterfaces()['Wi-Fi']?.find(ni => ni.family === 'IPv4')?.address

export const yargs = Yargs(hideBin(process.argv))
.usage(`Usage: hugo [-port, -dir]`)
.option('port', {
  alias: 'p',
  type: 'string',
  description: 'Tells hugo on what port the local server should run'
})
.command('run', 'Starts the hugo explorer', ({ argv }) => {
  cmd_hugo_run(argv)
}).command('stop', 'Shuts down the hugo explorer server', () => {
  cmd_hugo_stop()
}).argv
