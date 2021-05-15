import boxen from 'boxen'
import chalk from 'chalk'
import pm2 from 'pm2'
import { exit } from 'process'

const cmd_hugo_stop = () => {
  pm2.delete('hugo', (error) => {
    const msg = chalk.yellowBright.bold(`${chalk.green('√') + chalk.green('√')} HUGO ${chalk.green('√') + chalk.green('√')} \n\n status: ${chalk.red.bold('offline')} \n Thank you for using hugo \n\n Hire me: ${chalk.blue.bold('https://tenotea.dev')} or \n Buy me a coffee: ${chalk.blue.bold('https://buymeacoffee.com/tenotea')}
`)
	
		console.log(boxen(msg, {
			padding: 1,
			margin: 1,
			borderStyle: 'bold',
			borderColor: 'greenBright'
		}))
      exit(0)
  })
}

export default cmd_hugo_stop
