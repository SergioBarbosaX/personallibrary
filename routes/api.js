/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect                      = require('chai').expect;
var MongoClient                 = require('mongodb').MongoClient;
var ObjectId                    = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      MongoClient.connect(MONGODB_CONNECTION_STRING)
                   .then ( db => {
                      let dbo = db.db( "personalLibrary" );
                      dbo.collection( "books" ).find().toArray()
                         .then( books => {
                            res.send( books.map( ( book ) => {
                              let { _id, title, comments } = book;
                              return { _id, title, commentcount: comments.length };
                            } ) )
                         } )
                         .catch( err => console.log( err ));
                     //dbo.close();
                   } )
                   .catch( err => console.log( err ) );
    })
    
    .post(function (req, res){
      //response will contain new book object including atleast _id and title
      let newBook = {
        title   : req.body.title, 
        comments: []
      };
    
      if (newBook.title.length > 0) {
        MongoClient.connect(MONGODB_CONNECTION_STRING)
                   .then( db => {
                      let dbo = db.db( "personalLibrary" );
                      dbo.collection( "books" ).insertOne( newBook )
                         .then( doc => res.json( doc.ops[0] ) )
                         .catch( err => console.log(err) );
                      db.close();
                   } )
                   .catch( err => console.log(err) );
      }
      else
        res.send( '"title" field must be filled' );
    })
    
    .delete(function(req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING)
                 .then( db => {
                      let dbo = db.db( "personalLibrary" );
                      dbo.collection( "books" ).deleteMany( { } )
                         .then( () => res.send( 'complete delete successful' ) )
                         .catch( err => console.log( err ) );
                   } )
                   .catch( err => console.log( err ) );
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookId = new ObjectId(req.params.id);
      
      MongoClient.connect(MONGODB_CONNECTION_STRING)
                 .then( db => {
                      let dbo = db.db( "personalLibrary" );
                      dbo.collection( "books" ).findOne( { _id: bookId } )
                         .then( book => book === null ? res.send( 'no book exists' ) : res.json( book ))
                         .catch( err => console.log( err ) ); 
                   } )
                   .catch( err => console.log( err ) );
    })
    
    .post(function(req, res){
      let bookId = new ObjectId(req.params.id);
      let comment = req.body.comment;
    
      MongoClient.connect(MONGODB_CONNECTION_STRING)
                 .then( db => {
                      let dbo = db.db( "personalLibrary" );
                      dbo.collection( "books" ).findOneAndUpdate( { _id: bookId }, { $push: { comments: comment } }, { returnOriginal: false } )
                         .then( book => book.value === null ? res.send( 'no book exists' ) : res.json( book.value ) )
                         .catch( err => console.log( err ) ); 
                   } )
                   .catch( err => console.log( err ) );
      //json res format same as .get
    })

    .delete(function(req, res){
      let bookId = new ObjectId( req.params.id );
    
      MongoClient.connect(MONGODB_CONNECTION_STRING)
                 .then( db => {
                      let dbo = db.db( "personalLibrary" );
                      dbo.collection( "books" ).findOneAndDelete( { _id: bookId } )
                         .then( book => book.value === null ? res.send( 'no book exists' ) : res.send( 'delete successful' ) )
                         .catch( err => console.log( err ) ); 
                   } )
                   .catch( err => console.log( err ) );
      //json res format same as .get
      //if successful response will be 'delete successful'
    });
  
};
