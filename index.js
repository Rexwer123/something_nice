import { createWriteStream } from 'node:fs'
import { v4 as uuidv4 } from 'uuid';
import { ProductImageModel } from '../models/ProductImageModel'
import fs from 'node:fs/promises'

class FileUploadService {
    static async upload({
        extension = undefined,
        stream
    }) {

        if (!extension) {
            throw {
                error: true,
                message: 'File must have an extension!'
            }
        }

        if (!stream) {
            throw {
                error: true,
                message: 'We should have a readable stream!'
            }
        }
        
        const path = `${uuidv4()}.${extension}`
        const absolutePath = `/shopFiles/${path}`
        const writer = createWriteStream(absolutePath, { autoClose: true })

        await new Promise((resolve, reject) => {
            stream
                .pipe(writer)
                .on('finish', () => resolve(`/shopFiles/${path}`))
                .on('error', (err) => reject(err))
        })

        const file = new ProductImageModel({ path: absolutePath })
       
        try {
            await file.save()
        } catch(err) {
            await fs.unlink(absolutePath)

            throw {
                error: true,
                message: 'Could not index file in db, aborting upload',
                details: err
            }
        }
    }
}

export default FileUploadService
