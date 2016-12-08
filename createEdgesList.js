"use strict"
// MODULES
const fs = require('fs')
const time = require('node-tictoc')
const path = require('path')
const async = require('async')
const _ = require('underscore')
const JsDiff = require('diff')
// Database Agent
const dbAgent = require('./dbAgent.js')


// LOGIC
let edges = []

// let articleTitles = fs.readFileSync('articlesList.txt', 'utf8').trim().split('\n')

let articleTitles = ['Pericles', 'ciccobbello']

const createEdgesList = (articleTitle, cb) => {
  dbAgent.findRevisionsByArticleTitle(articleTitle, (revisions) => {
    revisions.forEach((revision) => {
      let edge = articleTitle + ', ' + revision.user.replace(/ /g, '_')
      if(edges.indexOf(edge) == -1) {
        edges.push(edge)
        fs.appendFileSync('edgesList.txt', edge + '\n')
      }
    })
    cb(null, 'Create Edges List')
  })
}

async.eachSeries(
  articleTitles,
  createEdgesList,
  (err, res) => {
    if (err) throw err
    else {
      console.log('Edges list created!');
      process.exit()
    }
  }
)
