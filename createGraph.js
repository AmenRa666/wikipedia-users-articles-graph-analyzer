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
// let articlesList = fs.readFileSync('articlesList.txt', 'utf8').trim().split('\n')

let articlesList = ['Pericles', 'ciccobbello']

let authorsList = fs.readFileSync('authorsList.txt', 'utf8').trim().split('\n')

let edgesList = fs.readFileSync('edgesList.txt', 'utf8').trim().split('\n')

// articles nodes
let articles = []
// author nodes
let authors = []
// edges
let edges = []

// Initialize articles vector
articlesList.forEach((title) => {
  let article = {
    title: title,
    quality: 1
  }
  articles.push(article)
})

// Initialize authors vector
authorsList.forEach((username) => {
  let author = {
    user: username,
    authority: 1
  }
  authors.push(author)
})

// Initialize edges vector
edgesList.forEach((_edge) => {
  let edgeAsArray = _edge.split(', ')
  let edge = {
    articleTitle: edgeAsArray[0],
    user: edgeAsArray[1],
    numberOfWordsAddedAndSurvived: edgeAsArray[2]
  }
  edges.push(edge)
})





const processBasic = () => {

  let _edges = edges.slice(0)

  authors.forEach((author) => {
    let authorEdges = []

    for (var i = 0; i < _edges.length; i++) {
      if (_edges[i].user == author.user) {
        authorEdges.push(_edges[i])
        i--
        array.splice(i, 1)
      }
    }

    edges.forEach((edge) => {
      if (edge.user == author.user) {

      }
    })

  })


}





// initialize edges vector
// const initializeEdgesVector = (articleTitle, cb) => {
//   console.log('1');
//   let revisions = []
//
//   dbAgent.findRevisionsByArticleTitle(articleTitle, (_revisions) => {
//     console.log('2');
//     revisions = _revisions
//
//     revisions.sort((a, b) => {
//     return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
//     });
//
//     console.log(revisions);
//
//     // for (var i = 0; i < revisions.length; i++) {
//     //   if (userList.indexOf(revisions[i].user) == -1) {
//     //     userList.push(revisions[i].user)
//     //     let user = {
//     //       name: revisions[i].user,
//     //       autorship: 1
//     //     }
//     //     users.push(user)
//     //   }
//     // }
//
//     cb(null, 'Initializa Edges Vector')
//   })
// }
//
//
// async.eachSeries(
//   articlesList,
//   initializeEdgesVector,
//   (err, res) => {
//     console.log(err);
//     process.exit()
//   }
// )




// // initialize(articleTitle)
//
//
//
//
// let lastRevision = "I'm pretty. I'm god. I love anal. I'm god. jhsd jshdvf jhsf facial."
// let previousRevision = "I'm pretty. I love anal. I'm god."
// let currentRevision = "I'm god. I love facial. I'm."
//
// previousRevision = previousRevision.replace(/[,\.:;!?]/g, '').split(' ')
// currentRevision = currentRevision.replace(/[,\.:;!?]/g, '').split(' ')
// lastRevision = lastRevision.replace(/[,\.:;!?]/g, '').split(' ')
//
// // let differenceBetweenOldAndLastRevisions = JsDiff.diffArrays(previousRevision, lastRevision)
// let differenceBetweenCurrentAndlastRevisions = JsDiff.diffArrays(currentRevision, lastRevision)
// let differenceBetweenPreviousAndCurrentRevisions = JsDiff.diffArrays(previousRevision, currentRevision)
//
// console.log(differenceBetweenPreviousAndCurrentRevisions);
// console.log(' - - - - - ');
// console.log(differenceBetweenCurrentAndlastRevisions);
//
// let addedWords = []
// differenceBetweenPreviousAndCurrentRevisions.forEach((word) => {
//   if (word.added == true) {
//     addedWords = addedWords.concat(word.value)
//   }
// })
//
// let survivedWords = []
// differenceBetweenCurrentAndlastRevisions.forEach((word) => {
//   if (word.added != true && word.removed != true) {
//     survivedWords = survivedWords.concat(word.value)
//   }
// })
//
// // Number of words added in with the current revision and survived to others
// let numberOfWordsAddedAndSurvived = _.intersection(addedWords, survivedWords).length
