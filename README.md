## About
This is the source code for my blog powered by GatsbyJS, running at `https://www.vojtechruzicka.com/`. All the articles are included in Markdown format under `/src/posts`.

## Forking
Feel free to fork this blog and use it for your purposes. You can delete all the posts and change the personal info, themes or anything else.

## Contributing
If you would like to contribute - such as fixing or updating some information, propose a guest post etc., please check `CONTRIBUTING.md`.

## Running locally in development
1. Make sure you have [node.js](https://nodejs.org/en/) installed.
2. Run `npm install` in the root directory to download the dependencies.
3. Run `gatsby develop` to run local development server.
4. Access the running blog on `http://localhost:8000/`.

## Configuring search
To enable search you will need to provide your own configuration for Algolia DocSearch. You will need to provide following properties (environment variables):

```
GATSBY_DOCSEARCH_APP_ID
GATSBY_DOCSEARCH_INDEX_NAME
GATSBY_DOCSEARCH_API_KEY
```

For local development you can create `.env.development` file in the root directory and add values for your env variables:

```
GATSBY_DOCSEARCH_APP_ID=XXX
GATSBY_DOCSEARCH_INDEX_NAME=XXX
GATSBY_DOCSEARCH_API_KEY=XXX
```

For production build, you will need to set these variables on the build machine or your build service (such as Netlify).

## Google analytics
Similar to search configuration, Google Analytics key is stored in environmental variable `GA_ID`, which needs to be configured for analytics to work.