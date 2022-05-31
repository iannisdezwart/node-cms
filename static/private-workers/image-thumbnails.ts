import * as fs from 'fs'
import * as graphicsMagick from 'gm'
import * as crypto from 'crypto'

const imageMagick = graphicsMagick.subClass({ imageMagick: true })

const imageExtensions = [ 'jpeg', 'jpg', 'gif', 'png', 'apng', 'svg', 'bmp', 'ico', 'webp' ]

const isImage = (path: string) => {
	const extension = path.split('.').pop().toLowerCase()
	return imageExtensions.includes(extension)
}

const createThumbnail = (
	imagePath: string
) => {
	const hash = crypto.createHash('md5').update(imagePath).digest('hex')

	if (fs.existsSync(`${ __dirname }/../root/thumbnails/${ hash }.png`)) {
		return
	}

	imageMagick(__dirname + '/../root/content/' + imagePath)
		.resize(64, 64, '>')
		.quality(80)
		.strip()
		.write(`${ __dirname }/../root/thumbnails/${ hash }.png`, err => {
			if (err) {
				console.log(err)
				return
			}
		})
}

const createThumbnailHelper = (
	directoryPath = ''
) => {
	fs.readdir(__dirname + '/../root/content/' + directoryPath, (_err, files) => {
		for (const file of files) {
			if (fs.statSync(`${ __dirname }/../root/content${ directoryPath }/${ file }`).isDirectory()) {
				createThumbnailHelper(`${ directoryPath }/${ file }`)
			} else if (isImage(file)) {
				createThumbnail(`${ directoryPath }/${ file }`)
			}
		}
	})

}

export const createThumbnails = () => {
	if (!fs.existsSync(__dirname + '/../root/thumbnails')) {
		fs.mkdirSync(__dirname + '/../root/thumbnails')
	}

	createThumbnailHelper()
}