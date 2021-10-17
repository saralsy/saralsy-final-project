# Create and Sell NFT

## Overview
The website allows you to upload any picture / existing art you have and turns it into NFT that can be sold or exchanged on the marketplace.

## Data Model
The application will store Users, Lists, Art Items for Sale

* Users can have private Art Items that are not open to the public
* There can be multiple lists depending on the category of the Art
* Users can decide which List to display their Art

An Example User:
  
 ```js  
 {
    username: "conartist",
    hash: // password hash,
    lists: // an array of Art,
    wallet: // address of the wallet to receive payment
    artSold: // popularity of the Artist
}
```
An Example Art:
```js
{
    user: // reference to the User object
    title: "coffee with milk", 
    createdAt: // timestamp
    category: // an arry of references to List object
    price: // listed price
    public: true, // whether this can be viewed by the public
    sold: false // whether this has been sold
}
```
An Example List with Embedded Art:
```js
{
    name: "random" 
    items: [
      {user: "conartist", name: "coffee with milk" ... sold: false}, // An array of reference to the Art Object
    ]
}
```
#### [Link to Commented First Draft Schema](./db.js)

## Wireframes

