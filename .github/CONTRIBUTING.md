# Contributing

Contributions are welcome and will be fully credited!

We accept contributions via Pull Requests on [Github](<https://github.com/>{{ githubAccount }}/{{ name }}).

## Setup

- Use `pnpm@8`
- Install `firebase-tools` globally: `npm install -g firebase-tools`

## Pull Requests

Here are some guidelines to make the process smoother:

- **Add a test** - New features and bugfixes need tests. If you find it difficult to test, please tell us in the pull request and we will try to help you!
- **Document any change in behaviour** - Make sure the `README.md` and any other relevant documentation are kept up-to-date.
- **Run `npm test` locally** - This will allow you to go faster
- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests.
- **Send coherent history** - Make sure your commits message means something
- **Consider our release cycle** - We try to follow [SemVer v2.0.0](http://semver.org/). Randomly breaking public APIs is not an option.

## Project structure

### Root

The root folder includes the VueFire library

### `packages/nuxt`

This folder includes the Nuxt module. To have proper TS support in your IDE, you might need to open this folder individually rather than opening the root folder of the VueFire project.

### `playground`

Includes a Vue 3 playground to test out with a real app.
