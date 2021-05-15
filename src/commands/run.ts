import pm2 from 'pm2'
import { exit } from 'process'
import chalk from 'chalk'
import path from 'path'
import boxen from 'boxen'
import { localNetwork } from '..'

const instanceAlreadyExists = chalk.yellowBright.bold('Failed to start Hugo \n\n') 
  + chalk.whiteBright.bgRed.bold("× An active hugo instance already exists!") 
  + chalk.yellowBright(`\n\n use: ${chalk.green.bold('hugo stop')} \n to close the active instance and try again.`)

const failedProcess = (message:string) :string => chalk.yellowBright.bold('Failed to start Hugo \n\n') 
+ chalk.whiteBright.bgRed.bold("× " + message) 
+ chalk.yellowBright(`\n\n use: ${chalk.green.bold('hugo run --port <port>')} \n to start a hugo instance.`)

const boxenMessage = (msg:string) => {
  return boxen(msg, {
    padding: 1,
    margin: 1,
    borderStyle: 'bold',
    borderColor: 'red'
  })
}

const cmd_hugo_run = (args: any) => {
  pm2.list((error, processes) => {
    if (!error) {
      const hugoInstance = processes.find((pid) => pid.name === 'hugo')
      if (hugoInstance) {
        console.log(boxenMessage(instanceAlreadyExists))
        exit(0)
      } else {
        pm2.start({
          name: 'hugo',
          script: path.join(__dirname, '../server.js'),
          env: {
            HUGO_PORT: args.port
          }
        }, (error, proc:any) => {
          if (error) {
            console.log(boxenMessage(failedProcess(error.message)))
            exit(0)
          } else {
            const msg = chalk.yellowBright.bold(`${chalk.green('√') + chalk.green('√')} HUGO ${chalk.green('√') + chalk.green('√')}

status: ${chalk.blue.bold(proc[0].pm2_env.status)}
>>> http://${localNetwork}${args.port ? `:${args.port}` : ''} <<<
		
Thank you for using hugo
Hire me: ${chalk.blue.bold('https://tenotea.dev')} or
Buy me a coffee: ${chalk.blue.bold('https://buymeacoffee.com/tenotea')}
`)
		console.log(boxen(msg, {
			padding: 1,
			margin: 1,
			borderStyle: 'bold',
			borderColor: 'greenBright'
		}))
            exit(0)
          }
        })
      }
    } else {
      console.log(boxenMessage(failedProcess('Failed to list existing processes')))
    }
  })
}

export default cmd_hugo_run
