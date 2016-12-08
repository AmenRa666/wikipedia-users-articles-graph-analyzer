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
let authors = []

// let articleTitles = fs.readFileSync('articlesList.txt', 'utf8').trim().split('\n')

let articleTitles = ['Pericles', 'ciccobbello']

const createAuthorsList = (articleTitle, cb) => {
  dbAgent.findRevisionsByArticleTitle(articleTitle, (revisions) => {
    revisions.forEach((revision) => {
      if(authors.indexOf(revision.user) == -1) {
        authors.push(revision.user)
        fs.appendFileSync('authorsList.txt', revision.user + '\n')
      }
    })
    cb(null, 'Create Authors List')
  })
}

async.eachSeries(
  articleTitles,
  createAuthorsList,
  (err, res) => {
    if (err) throw err
    else {
      console.log('Authors list created!');
      process.exit()
    }
  }
)
