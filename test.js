"use strict"
// MODULES
const fs = require('fs')
const time = require('node-tictoc')
const path = require('path')
const async = require('async')
const _ = require('underscore')
const JsDiff = require('diff')
var difflib = require('difflib')
// Database Agent
const dbAgent = require('./dbAgent.js')


// LOGIC
let edges = []
let lastRevisionContent = null
let currentArticleTitle = null

// let articlesList = fs.readFileSync('articlesList.txt', 'utf8').trim().split('\n')

let articlesList = ['Pericles', 'ciccobbello']

const ceateEdge = (revisionBigram, cb) => {
  time.tic()
  // First revision
  if (revisionBigram.length == 1) {
    let currentRevisionContent = revisionBigram[0].text
    currentRevisionContent = currentRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

    // let differenceBetweenCurrentAndlastRevisions = JsDiff.diffArrays(currentRevisionContent, lastRevisionContent)

    difflib.contextDiff(currentRevisionContent, lastRevisionContent, {fromfile:'before', tofile:'after'})

    // let survivedWords = []
    // differenceBetweenCurrentAndlastRevisions.forEach((word) => {
    //   if (word.added != true && word.removed != true) {
    //     survivedWords = survivedWords.concat(word.value)
    //   }
    // })
    //
    // edges.push({
    //   articleTitle: currentArticleTitle,
    //   user: revisionBigram[0].user,
    //   numberOfWordsAddedAndSurvived: survivedWords
    // })

    console.log(edges.length);
    time.toc()
    cb(null, 'Create Edge')
  }
  // All others revisions
  else {
    let currentRevisionContent = revisionBigram[1].text
    currentRevisionContent = currentRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

    // let differenceBetweenCurrentAndlastRevisions = JsDiff.diffArrays(currentRevisionContent, lastRevisionContent)

    difflib.contextDiff(currentRevisionContent, lastRevisionContent, {fromfile:'before', tofile:'after'})

    // let survivedWords = []
    // differenceBetweenCurrentAndlastRevisions.forEach((word) => {
    //   if (word.added != true && word.removed != true) {
    //     survivedWords = survivedWords.concat(word.value)
    //   }
    // })

    let previousRevisionContent = revisionBigram[0].text
    previousRevisionContent = previousRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

    // let differenceBetweenPreviousAndCurrentRevisions = JsDiff.diffArrays(previousRevisionContent, currentRevisionContent)

    difflib.contextDiff(previousRevisionContent, currentRevisionContent, {fromfile:'before', tofile:'after'})

    // let addedWords = []
    // differenceBetweenPreviousAndCurrentRevisions.forEach((word) => {
    //   if (word.added == true) {
    //     addedWords = addedWords.concat(word.value)
    //   }
    // })
    //
    // edges.push({
    //   articleTitle: currentArticleTitle,
    //   user: revisionBigram[1].user,
    //   numberOfWordsAddedAndSurvived: _.intersection(addedWords, survivedWords).length
    // })

    console.log(edges.length);

    time.toc()
    cb(null, 'Create Edge')
  }
}

const createEdgesList = (articleTitle, cb) => {
  edges = []
  lastRevisionContent = null
  currentArticleTitle = articleTitle

  dbAgent.findRevisionsByArticleTitle(articleTitle, (revisions) => {
    console.log(revisions.length);

    revisions.sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    })

    lastRevisionContent = revisions[revisions.length-1].text
    lastRevisionContent = lastRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

    let revisionBigrams = []

    for (let i = 0; i < revisions.length; i++) {
      if (i == 0) {
        revisionBigrams.push([revisions[i]])
      }
      else {
        revisionBigrams.push([revisions[i-1], revisions[i]])
      }
    }

    async.each(
      revisionBigrams,
      ceateEdge,
      (err, res) => {
        console.log(edges.length);
        process.exit()
      }
    )







    // revisions.forEach((revision) => {
    //   let edge = articleTitle + ', ' + revision.user.replace(/ /g, '_')
    //   if(edges.indexOf(edge) == -1) {
    //     edges.push(edge)
    //     fs.appendFileSync('edgesList.txt', edge + '\n')
    //   }
    // })
    // cb(null, 'Create Edges List')
  })
}

async.eachSeries(
  articlesList,
  createEdgesList,
  (err, res) => {
    if (err) throw err
    else {
      console.log('Edges list created!');
      process.exit()
    }
  }
)
