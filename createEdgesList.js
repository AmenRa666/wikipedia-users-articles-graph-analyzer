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

// let articlesList = fs.readFileSync('articlesList.txt', 'utf8').trim().split('\n')

let articlesList = ['Pericles', 'ciccobbello']

const createEdgesList = (articleTitle, cb) => {
  let edges = []

  dbAgent.findRevisionsByArticleTitle(articleTitle, (revisions) => {
    console.log(revisions.length);

    revisions.sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    })

    let lastRevisionContent = revisions[revisions.length-1].text
    lastRevisionContent = lastRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

    for (let i = 0; i < revisions.length; i++) {

      let currentRevisionContent = revisions[i].text
      currentRevisionContent = currentRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

      let differenceBetweenCurrentAndlastRevisions = JsDiff.diffArrays(currentRevisionContent, lastRevisionContent)

      let survivedWords = []
      differenceBetweenCurrentAndlastRevisions.forEach((word) => {
        if (word.added != true && word.removed != true) {
          survivedWords = survivedWords.concat(word.value)
        }
      })

      let numberOfWordsAddedAndSurvived = 0

      if (i == 0) {
        // Number of words added in with the current revision and survived to others
        numberOfWordsAddedAndSurvived = survivedWords
      }
      else {
        let previousRevisionContent = revisions[i-1].text
        previousRevisionContent = previousRevisionContent.replace(/[,\.:;!?]/g, '').split(' ')

        let differenceBetweenPreviousAndCurrentRevisions = JsDiff.diffArrays(previousRevisionContent, currentRevisionContent)

        let addedWords = []
        differenceBetweenPreviousAndCurrentRevisions.forEach((word) => {
          if (word.added == true) {
            addedWords = addedWords.concat(word.value)
          }
        })

        // Number of words added in with the current revision and survived to others
        numberOfWordsAddedAndSurvived = _.intersection(addedWords, survivedWords).length

      }

      console.log('i');

      let edgeAlredyPresent = false
      for (let j = 0; j < edges.length; j++) {
        if (edges[j].user == revisions[i].user) {
          edges[j].numberOfWordsAddedAndSurvived = edges[j].numberOfWordsAddedAndSurvived + numberOfWordsAddedAndSurvived
          edgeAlredyPresent = true
          break
        }
      }

      if (!edgeAlredyPresent) {
        edges.push(
          {
            articleTitle: articleTitle,
            user: revisions[i].user,
            numberOfWordsAddedAndSurvived: numberOfWordsAddedAndSurvived
          }
        )
      }

      console.log(i);

    }

    console.log(edges.length);
    console.log(edges);

    process.exit()






    // revisions.forEach((revision) => {
    //   let edge = articleTitle + ', ' + revision.user.replace(/ /g, '_')
    //   if(edges.indexOf(edge) == -1) {
    //     edges.push(edge)
    //     fs.appendFileSync('edgesList.txt', edge + '\n')
    //   }
    // })
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
