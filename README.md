# Google Sheets Based Website

The goal of this experiment is to create a statically generated website that
gets the data from Google Sheets and creates content based on that.

For the demo it will load a list of people from a Google Sheets and use it to
render a static website.

The website is very simple
   - Show links to the associated Google Form and Google Sheets.
   - Every person gets a card with their name and job title
   - When the card is clicked, the card enlarges to fill the screen and the rest of the data is shown

Extra points if I can make a web-hook to re-render the static site when
the sheet changes.

Extra points for a way to authorize the Google API key to access a private spreadsheet (otherwise the spreadsheet has to be public)

## Build Log

```
yarn create astro gsheets-based-website
cd gsheets-based-website
```

Updated this readme

Added React and Tailwind

```
yarn astro add tailwind
yarn astro add react
```

Updated package.json project name

Commit code to Git