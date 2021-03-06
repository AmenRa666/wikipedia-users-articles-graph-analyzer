"use strict"
// MODULES
const fs = require('fs')
const time = require('node-tictoc')
const path = require('path')
const async = require('async')
const _ = require('underscore')
const JsDiff = require('diff')
const difflib = require('difflib')
// Database Agent
const dbAgent = require('./dbAgent.js')


// LOGIC
let edges = []
let lastRevisionContent = null
let currentArticleTitle = null

// let articlesList = fs.readFileSync('articlesList.txt', 'utf8').trim().split('\n')

let articlesList = ['Pericles', 'ciccobbello']

const createEdge = (revisionBigram) => {
  time.tic()
  // First revision
  if (revisionBigram.length == 1) {
    let currentRevisionContent = revisionBigram[0].text
    currentRevisionContent = currentRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

    let differenceBetweenCurrentAndlastRevisions = difflib.contextDiff(currentRevisionContent, lastRevisionContent, {fromfile:'before', tofile:'after'})

    let survivedWords = []

    differenceBetweenCurrentAndlastRevisions = differenceBetweenCurrentAndlastRevisions.splice(4)

    for (var i = 0; i < differenceBetweenCurrentAndlastRevisions.length; i++) {
      if (differenceBetweenCurrentAndlastRevisions[i].indexOf('  ') == 0 && differenceBetweenCurrentAndlastRevisions[i].length > 2) {
        survivedWords.push(differenceBetweenCurrentAndlastRevisions[i].substring(2))
      }
      else if (differenceBetweenCurrentAndlastRevisions[i].indexOf('--- ') == 0) {
        break
      }
    }

    edges.push({
      user: revisionBigram[0].user,
      articleTitle: currentArticleTitle,
      numberOfWordsAddedAndSurvived: survivedWords.length
    })

    console.log(edges.length);
    time.toc()
  }
  // All others revisions
  else {
    let currentRevisionContent = revisionBigram[1].text
    currentRevisionContent = currentRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

    let differenceBetweenCurrentAndlastRevisions = difflib.contextDiff(currentRevisionContent, lastRevisionContent, {fromfile:'before', tofile:'after'})

    let survivedWords = []

    differenceBetweenCurrentAndlastRevisions = differenceBetweenCurrentAndlastRevisions.splice(4)

    for (var i = 0; i < differenceBetweenCurrentAndlastRevisions.length; i++) {
      if (differenceBetweenCurrentAndlastRevisions[i].indexOf('  ') == 0 && differenceBetweenCurrentAndlastRevisions[i].length > 2) {
        survivedWords.push(differenceBetweenCurrentAndlastRevisions[i].substring(2))
      }
      else if (differenceBetweenCurrentAndlastRevisions[i].indexOf('--- ') == 0) {
        break
      }
    }

    let previousRevisionContent = revisionBigram[0].text
    previousRevisionContent = previousRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

    let differenceBetweenPreviousAndCurrentRevisions =     difflib.contextDiff(previousRevisionContent, currentRevisionContent, {fromfile:'before', tofile:'after'})

    let addedWords = []
    let newRevision = false

    for (var i = 0; i < differenceBetweenPreviousAndCurrentRevisions.length; i++) {
      if (newRevision &&
        (differenceBetweenPreviousAndCurrentRevisions[i].indexOf('+' == 0) || differenceBetweenPreviousAndCurrentRevisions[i].indexOf('!' == 0))
      ){
        addedWords.push(differenceBetweenPreviousAndCurrentRevisions[i].substring(2))
      }
      else if (differenceBetweenPreviousAndCurrentRevisions[i].indexOf('--- ') == 0) {
        newRevision = true
      }
    }

    edges.push({
      user: revisionBigram[1].user,
      articleTitle: currentArticleTitle,
      numberOfWordsAddedAndSurvived: _.intersection(addedWords, survivedWords).length
    })

    console.log(edges.length);

    time.toc()
  }
}

const createEdgesList = (articleTitle, cb) => {
  time.tic()
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

    revisionBigrams.forEach((bigram) => {
      createEdge(bigram)
    })

    let _edges = []

    for (var i = 0; i < edges.length; i++) {
      let numberOfWordsAddedAndSurvived = edges[i].numberOfWordsAddedAndSurvived

      let notPresent = true

      for (var k = 0; k < _edges.length; k++) {
        if(_edges[k].user == edges[i].user){
          notPresent = false
          break
        }
      }

      if(notPresent) {
        for (var j = 0; j < edges.length; j++) {
          if ((edges[j].revid != edges[i].revid) && (edges[j].user == edges[i].user)) {
            numberOfWordsAddedAndSurvived = numberOfWordsAddedAndSurvived + edges[j].numberOfWordsAddedAndSurvived
          }
        }
        let edge = edges[i].articleTitle + ', ' + edges[i].user.replace(/ /g, '_') + ', ' + numberOfWordsAddedAndSurvived
        _edges.push(edges[i])
        fs.appendFileSync('edgesList.txt', edge + '\n')
      }
    }



    // revisions.forEach((revision) => {
    //   let edge = articleTitle + ', ' + revision.user.replace(/ /g, '_')
    //   if(edges.indexOf(edge) == -1) {
    //     edges.push(edge)
    //     fs.appendFileSync('edgesList.txt', edge + '\n')
    //   }
    // })


    time.toc()
    process.exit()
    cb(null, 'Create Edges List')
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
