// Each series entry supports an optional `image` field: the filename of a cover image
// stored at src/images/series/<slug>/<filename> (e.g. image: 'featured.jpg').
// When omitted the series card falls back to the first post's featured image.
export default [
  {
    slug: 'angular-tutorial',
    name: 'Angular Tutorial',
    description:
      'A step-by-step guide to building Angular applications from scratch, covering components, data binding, routing, and more.',
    topics: ['Angular'],
    posts: [
      '/angular/01-getting-started/',
      '/angular/02-building-blocks/',
      '/angular/03-components/',
      '/angular/04-data-binding/',
      '/angular/05-component-input-output/',
    ],
  },
  {
    slug: 'javafx',
    name: 'JavaFX Tutorial',
    description:
      'A practical guide to building desktop GUI applications with JavaFX, covering layouts, CSS styling, FXML, Scene Builder, and Spring Boot integration.',
    topics: ['Java', 'JavaFX'],
    posts: [
      '/javafx-getting-started/',
      '/javafx-hello-world/',
      '/javafx-fxml-scene-builder/',
      '/javafx-layouts-basic/',
      '/javafx-layouts-advanced/',
      '/javafx-css/',
      '/javafx-spring-boot/',
    ],
  },
];
