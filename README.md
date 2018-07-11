labs-ember-search
==============================================================================

Invoke the component like this:
```
{{labs-search}}
```

Be sure to have the host info configured in your environment.js!
```
    'labs-search': {
      host: (environment === 'devlocal') ? '//localhost:4000' : 'https://zola-search-api.planninglabs.nyc',
      route: 'search',
    },
```

Installation
------------------------------------------------------------------------------

```
ember install labs-ember-search
```


Usage
------------------------------------------------------------------------------

[Longer description of how to use the addon in apps.]


Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd labs-ember-search`
* `npm install`

### Linting

* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
