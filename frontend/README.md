## Initial setup

1. Install yarn: <https://yarnpkg.com/lang/en/docs/install/>
2. `yarn global add @angular/cli`
3. `ng set --global packageManager=yarn`
4. `yarn install` in this directory

## Installing dependencies

Run `yarn install` in this directory to install the required modules.

If new modules are needed:
- For production: `yarn add package-name`
- Development only: `yarn add package-name --dev`

## Development server

Run `ng serve -o` to start the development server and automatically open the endpoint.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Running unit tests

Run `ng test` to execute the unit tests.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests.
