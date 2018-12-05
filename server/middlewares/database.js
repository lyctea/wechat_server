import fs from 'fs'
import { resolve } from 'path'
import mongoose from 'mongoose'
import config from '../config'

const models = resolve(__dirname, '../database/schema')

// 读取所有 schema 目录下的js文件，并且require进来
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*js$/))
  .forEach(file => require(resolve(models, file)))

export const database = app => {
  mongoose.set('debug', true)

  mongoose.connect(config.db)

  mongoose.connection.on('disconnected', () => {
    mongoose.connect(config.db)
  })

  mongoose.connection.on('error', err => {
    console.error(err)
  })

  mongoose.connection.on('open', async => {
    console.log('Connected to MongoDB Success', config.db)
  })
}
