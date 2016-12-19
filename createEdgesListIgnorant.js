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
let lastRevisionContent = null
let currentArticleTitle = null

// let articlesList = fs.readFileSync('articlesList.txt', 'utf8').trim().split('\n')

let articlesList = ['Pericles']

const ceateEdge = (revisionBigram, cb) => {
  // First revision
  if (revisionBigram.length == 1) {
    let currentRevisionContent = revisionBigram[0].text
    currentRevisionContent = currentRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

    edges.push({
      articleTitle: currentArticleTitle,
      user: revisionBigram[0].user,
      numberOfWordsAddedAndSurvived: _.intersection(currentRevisionContent, lastRevisionContent).length,
      revid: revisionBigram[0].revid
    })

    console.log(edges.length);

    cb(null, 'Create Edge')
  }
  // All others revisions
  else {
    let currentRevisionContent = revisionBigram[1].text

    currentRevisionContent = currentRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

    let previousRevisionContent = revisionBigram[0].text
    previousRevisionContent = previousRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

    let differenceBetweenCurrentAndPreviousRevisions = _.difference(currentRevisionContent, previousRevisionContent)

    edges.push({
      articleTitle: currentArticleTitle,
      user: revisionBigram[1].user,
      numberOfWordsAddedAndSurvived: _.intersection(differenceBetweenCurrentAndPreviousRevisions, lastRevisionContent).length,
      revid: revisionBigram[1].revid
    })

    console.log(edges.length);

    cb(null, 'Create Edge')
  }
}

const createEdgesList = (articleTitle, cb) => {
  edges = []
  lastRevisionContent = null
  currentArticleTitle = articleTitle

  dbAgent.findRevisionsByArticleTitle(articleTitle, (revisions) => {
    if (revisions.length == 0) {
      console.log(articleTitle)
      process.exit()
    }
    else {
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
          cb(null, ('Create Edges List'))
        }
      )
    }


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
time.tic()
async.eachSeries(
  articlesList,
  createEdgesList,
  (err, res) => {
    if (err) throw err
    else {

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

      console.log('Edges list created!');
      time.toc()
      process.exit()
    }
  }
)
