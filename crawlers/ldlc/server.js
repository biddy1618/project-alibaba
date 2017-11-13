/*
	name: server.js
	metaname: LDLC Crawler
	author: Dauren Baitursyn
	Description: script for crawling CPUs data from "http://www.ldlc.com"
	date: 11.05.15
*/

// import modules
var Database = require('../database/Database')

// import crawlers
var crawlCPU = require('./ldlcCPU')
var crawlRAM = require('./ldlcRAM')
var crawlGPU = require('./ldlcGPU')
var crawlMotherboard = require('./ldlcMotherboard')

// it could be optimized s.t. every crawler will start after another one is done
Database.open()
crawlCPU('/informatique/pieces-informatique/processeur/c4300/')
crawlRAM('/informatique/pieces-informatique/memoire-pc/c4703/')
crawlGPU('/informatique/pieces-informatique/carte-graphique-interne/c4684/')
crawlGPU('/informatique/pieces-informatique/carte-professionnelle/c4685/')
crawlMotherboard('/informatique/pieces-informatique/carte-mere/c4293/')

process.on('SIGINT', function () {
  console.log('\nSIGINT (Ctrl+C), exiting...')

  console.log('\nClosing database...')
  Database.close()

  process.exit(0)
})

