[![Version][version-svg]][package-url]
[![License][license-image]][license-url]
[![Build Status][ci-svg]][ci-url]
[![Pull reminders][pull-reminders-svg]][pull-reminders-url]

VisionJS is a vanilla JavaScript library that lets you create a healthcare search eperience using [Clinia][clinia-website]'s
search API. It is part of the Vision product family:

**VisionJS** | [React Vision][react-vision-github] | [Angular Vision][angular-vision-github] | [React Vision Native][react-vision-github] | [Vision Android][android-vision-github]

<details>
  <summary><strong>Table of contents</strong></summary>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Why](#why)
- [Getting started](#getting-started)
- [Installation](#installation)
- [Documentation](#documentation)
- [Demos](#demos)
- [Playground](#playground)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

</details>

## Why

You should be using Vision if you want to:

- Design healthcare search experiences with best practices
- Customize your components at will
- Remain independant from external frameworks

## Getting started

Using VisionJS is as simple as adding this JavaScript code to your page:

```javascript
// 1. Instantiate the search
const search = vision({
  indexName: 'health_facility',
  searchClient: clinia('appId', 'apiKey')
});

search.addWidgets([
  // 2. Create an interactive search box
  vision.widgets.searchBox({
    container: '#searchbox',
    placeholder: 'Search for pharmacies'
  }),

  // 3. Plug the search results into the healthfacilities container
  vision.widgets.records({
    container: '#healthfacilties',
    templates: {
      item: '{{name}}',
    },
  }),
]);

// 4. Start the search
search.start();
```

TODO: link to website documentation js guides

## Installation

```sh
npm install @clinia/vision clinia
# or
yarn add @clinia/vision clinia
```

## Documentation

The documentation is available on the [Clinia website (coming soon)]()

## Playground

You can play around with VisionJS on [this playground (coming soon)]()

## Browser support

We support the **last two version of major browsers** (Chrome, Edge, Firefox, Safari).

## License

VisionJS is [MIT licensed](license-url).

<!-- Badges -->

[version-svg]: https://img.shields.io/npm/v/@clinia/vision.svg?style=flat-square
[package-url]: https://npmjs.org/package/@clinia/vision
[ci-svg]: https://img.shields.io/circleci/project/github/clinia/vision-js.svg?style=flat-square
[ci-url]: https://circleci.com/gh/clinia/vision-js
[pull-reminders-svg]: https://img.shields.io/badge/pull%20reminders-✓-success.svg?style=flat-square
[pull-reminders-url]: https://pullreminders.com?ref=badge
[license-image]: http://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE

<!-- Links -->

[clinia-website]: https://www.clinia.com/?utm_source=visionjs&utm_campaign=repository
[react-vision-github]: https://github.com/clinia/react-vision/
[android-vision-github]: https://github.com/clinia/vision-android
[angular-vision-github]: https://github.com/clinia/angular-vision

