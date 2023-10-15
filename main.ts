import { Notice, Plugin } from "obsidian";
import { TAbstractFile, TFile } from "obsidian";

type NoteMeta = {
  shouldMove: boolean;
  year?: string;
  month?: string;
  day?: string;
};

export default class AutomovePlugin extends Plugin {
  isDebug: false;

  /** Determine if a note should move, and extract the year/month/day from its
	filename */
  getNoteMeta(file: TFile): NoteMeta {
    const name = file.basename;
    const isDailyNote = name.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const isMonthlyNote = name.match(/^(\d{4})-(\d{2})\s\w+$/);
    const isYearlyNote = name.match(/^(\d{4})$/);
    const isPeriodic = !!isDailyNote || !!isMonthlyNote || !!isYearlyNote;
    const isInJournal = file.path.includes("01 Journal");

    if (this.isDebug)
      console.log(
        `checking ${file.basename} (periodic: ${isPeriodic}, journal: ${isInJournal})`
      );
    if (!isPeriodic || isInJournal) return { shouldMove: false };

    let year, month, day;

    if (isDailyNote) {
      year = isDailyNote[1];
      month = isDailyNote[2];
      day = isDailyNote[3];
    } else if (isMonthlyNote) {
      year = isMonthlyNote[1];
      month = isMonthlyNote[2];
    } else if (isYearlyNote) {
      year = isYearlyNote[1];
    }

    return {
      shouldMove: true,
      year,
      month,
      day,
    };
  }

  createIntermediateFolders(path: string) {
    // If all intermediate folders already exist, return early.
    if (this.app.vault.getAbstractFileByPath(path)) return;

    if (this.isDebug) console.log(`attempt to create ${path}`);
    this.app.vault.createFolder(path);
  }

  /** Move a note, based on its filename */
  moveNote(file: TFile, meta: NoteMeta) {
    const { year, month } = meta;
    const name = file.name;
    let path = "01 Journal/";

    new Notice(`Moving ${name}`);

    if (year && month) {
      path += `${year}/${month}`;
    } else if (year) {
      path += `${year}`;
    }

    // Create intermediate year/month folders if we need to.
    this.createIntermediateFolders(path);
    path += `/${name}`;

    this.app.fileManager.renameFile(file, path);
  }

  async onload() {
    // When the plugin instantiates, register an event handler to know when
    // new notes are created.
    this.registerEvent(
      this.app.vault.on("create", (file: TAbstractFile) => {
        if (file instanceof TFile) {
          const meta = this.getNoteMeta(file);

          if (!meta.shouldMove) return;
          this.moveNote(file, meta);
        }
      })
    );
  }

  onunload() {}
}
