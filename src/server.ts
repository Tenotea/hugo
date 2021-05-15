import express from 'express'
import fs, { Dirent, Stats } from 'fs'
import path from 'path'
import os from 'os'
import chalk from 'chalk'
import boxen from 'boxen'
import { localNetwork } from '.'
const homedir = path.resolve(os.homedir())
const HUGO = express()

function getExt(url:string, filename: string): string {
	return path.extname(path.join(__dirname, url,filename)).replace('.', '')
}

function fileSize (size: number): string {
	if (size < 1024) {
		return `${size}B`
	}

	const _kb = parseFloat((size / 1024).toFixed(2))
	if (_kb < 1024) {
		return `${_kb}KB`
	}

	const _mb = parseFloat((_kb / 1024).toFixed(2))
	if (_mb < 1024) {
		return `${_mb}MB`
	}

	const _gb = parseFloat((_mb / 1024).toFixed(2))
	return `${_gb}GB`
}

function styledDate (timeCreated: Date): string {
	const d = new Date(timeCreated)
	let da: string | number = d.getDate()
	da = da > 3 ? da + `th` : da === 1 ? da + 'st' : da === 2 ? da + 'nd' : da + 'rd'
	const ms: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	let m: string | number = d.getMonth()
	m = <string> ms[m]
	let y = d.getFullYear()
	return `${da} ${m}, ${y}, ${d.toLocaleTimeString()}`
}

function fileType (ext:string, dir:boolean): string {
	const image = ['png', 'jpg', 'jpeg', 'webp', 'jfif', 'exif', 'gif', 'bmp', 'ppm', 'pgm', 'pbm', 'pnm', 'svg']
	const music = ['mp3', 'wav', 'aac', 'ogg', 'pcm', 'aiff', 'wma', 'flac', 'alac']
	const video = ['mp4', 'mkv']
	const html = ['html']
	if (!ext && dir) return 'folder'
	if (image.includes(ext)) return 'image'
	if (music.includes(ext)) return 'music'
	if (video.includes(ext)) return 'video'
	if (html.includes(ext)) return 'html'
	return 'file'
}

class HugoFile {
	public name: string
	public dir: boolean
	public ext: string
	public fullPath: string
	public size: string
	public fileType: string
	public timeCreated: string
	constructor(name: Dirent , fileInfo: Stats, url:string) {
		this.name = name.name;
		this.dir = name.isDirectory();
		this.ext = getExt(url, name.name);
		this.fullPath = url === '/' ? name.name : url + '/' + name.name;
		this.size = fileSize(fileInfo.size);
		this.fileType = fileType(this.ext, this.dir);
		this.timeCreated = styledDate(fileInfo.birthtime);
	}
}

interface previousPath {
	name?: string
	path?: string
}

HUGO.use('/assets', express.static(path.join(__dirname, './assets')))

HUGO.get('*', (req, res) => {
	req.url = decodeURIComponent(req.url)
	if (!getExt(req.url, '')) {
		fs.readdir(path.join(homedir, req.url), { withFileTypes: true }, (error, result) => {

			if (error) {
				res.json(error.message);
				return;
			}

			const files:HugoFile[] = []
			result.forEach( file => {
				try {
					fs.openSync(path.join(homedir, req.url, file.name), 'r')
					let fileStat = fs.statSync(path.join(homedir, req.url, file.name))
					if (!['.', '_'].includes(<string> file.name[0])) {
						files.push(new HugoFile(file, fileStat, req.url))
					}
				} catch (e) {
					// Ignore permission error
				}
			})
			
			fs.readFile(path.resolve(__dirname, './client/_template.html'), (error, template) => {
				if (error) {
					res.json('Error creating view')
					return
				}
				const htmlTemplate = (files: HugoFile[], paths: previousPath[]) => eval(template.toString('utf-8'))
				
				const paths = req.url.split('/').filter( path => path )
				const previousPaths: previousPath[] = []
				paths.forEach((p, i) => {
					previousPaths[i] = {}
					previousPaths[i]!.name = p
					let _tempArray = i < paths.length - 1 ? paths.slice(0, i+1) : paths.slice()
					_tempArray[0] = '/' + _tempArray[0]
					previousPaths[i]!.path = _tempArray.reduce((acc, pa) => acc + '/' + pa)
				})
				
				files.sort((a, b) => a.ext < b.ext ? -1 : 1)
				res.send(htmlTemplate(files, previousPaths))
			})
		})
	} else {
		res.sendFile(path.join(homedir, req.url))
	}
})

if (localNetwork) {
	HUGO.listen( parseInt(<string> process.env['PORT']) || parseInt(<string> process.env['HUGO_PORT']) || 80, localNetwork, () => {
		const msg = chalk.blackBright.bold(`
		🐱‍🚀🐱‍🚀 HUGO is running 🐱‍🚀🐱‍🚀
		
		>>> http://${localNetwork} <<<
		
		Thank you for choosing hugo
		HIRE ME: https://tenotea.dev
	`)
	
		console.log(boxen(msg, {
			padding: 1,
			margin: 1,
			borderStyle: 'bold',
			backgroundColor: 'yellowBright'
		}))
	})
}
