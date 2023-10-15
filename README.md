# Obsidian Automove Plugin

This is a (private) plugin that automatically moves and templates any daily, monthly, or yearly notes that get created outside of my periodic notes folder.

I love the [Periodic Notes](https://github.com/liamcain/obsidian-periodic-notes/tree/main) plugin, but sometimes I don't create a periodic note by clicking the calendar or using a command. Sometimes, I just want to quickly reference a day/month/year that might not exist yet, and I've found myself clicking through those links and getting a blank note created in my default notes folder. This sucks, so I wrote this plugin to:

- watch for note creation, and if it's a periodic note that's not in my periodic notes folder...
- move the newly-created note to the right folder, creating intermediate year/month folders as necessary
- use my existing daily/monthly/yearly templates to format the newly-created note!

## Installation

This plugin needs some work in order for other folks (who don't use my exact note and folder naming scheme) to use it, so it is **not in the Obsidian Plugins directory**.

### Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Usage

- Create a daily note with `[[YYYY-MM-DD]]` anywhere in the vault, e.g. `[[2023-10-31]]`
- Create a monthly note with `[[YYYY-MM MMMM]]` anywhere in the vault, e.g. `[[2023-01 January]]`
- Create a yearly note with `[[YYYY]]` anywhere in the vault, e.g. `[[2024]]`

On creation, the note will be moved to the right folder and templated. In the template, `{{date}}` and `{{date:format}}` will be replaced with the note's correct dates.

## Contributing

If you're interested in making this plugin more generic, here's what I think we'd have to do:

- Move hardcoded stuff into settings (note regex, templates, periodic notes folder)
- Add settings for folder creation (or pull ALL of these settings from the Periodic Notes options, if we can)
- Add support for weekly and quarterly notes (I don't use them)

### Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

### Adding your plugin to the community plugin list

- Check https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

### How to develop

- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.

### API Documentation

See https://github.com/obsidianmd/obsidian-api
