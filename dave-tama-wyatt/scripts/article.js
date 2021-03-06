'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// PUT YOUR RESPONSE HERE
// This function needs to have its own 'this' context, therefore it has to be a conventional function
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // PUT YOUR RESPONSE HERE
  // This is a ternary operator - It first checks "does .publishedOn exist?' if so, publishStatus is assigned a template literal that says when it was published. Otherwise, publishStatus is assigned to a string that says it's a draft.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// PUT YOUR RESPONSE HERE
// This function is called inside the fetchAll method below. rawData is an array that contains stringified Article objects. The difference is that rawData is loaded either from localStorage or it's collected from the data file hackerIpsum.json via AJAX. It's not (as previously) loaded as an array in a script.
Article.loadAll = rawData => {
  rawData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  rawData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  // This if statement is checking to see if we already have a copy of rawData in localStorage, hence do not need to load the data from the json source.
  if (localStorage.rawData) {
    $.ajax({
      url:"../data/hackerIpsum.json",
      type: "HEAD",
      success: function(data, message, xhr) {
        if (xhr.getResponseHeader('ETag') !== JSON.parse(localStorage.ETag)) {
          localStorage.clear(rawData);
          Article.fetchAll();
        }
      }
    });

    Article.loadAll(JSON.parse(localStorage.rawData));
    articleView.initIndexPage();

  } else {
    $.ajax({
      url:"../data/hackerIpsum.json",
      type: "GET",
      success: function(data, message, xhr) {
        localStorage.rawData = JSON.stringify(data);
        localStorage.ETag = xhr.getResponseHeader('Etag');
        Article.loadAll(data);
        articleView.initIndexPage();
      }
    });
  }
}
