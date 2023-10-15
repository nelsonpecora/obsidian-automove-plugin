import { Notice, Plugin, moment, normalizePath } from "obsidian";
import { TAbstractFile, TFile } from "obsidian";

type Granularity = "day" | "month" | "year";

type NoteMeta = {
  shouldMove: boolean;
  granularity?: Granularity;
  year?: string;
  month?: string;
  day?: string;
};

const months: Record<string, string> = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

// Set to true to enable debug logging. TODO: make this a setting
const isDebug = false;

export default class AutomovePlugin extends Plugin {
  /** Determine if a note should move, and extract the year/month/day from its
	filename */
  getNoteMeta(file: TFile): NoteMeta {
    const name = file.basename;
    const isDailyNote = name.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const isMonthlyNote = name.match(/^(\d{4})-(\d{2})\s\w+$/);
    const isYearlyNote = name.match(/^(\d{4})$/);
    const isPeriodic = !!isDailyNote || !!isMonthlyNote || !!isYearlyNote;
    const isInJournal = file.path.includes("01 Journal");

    if (isDebug)
      console.log(
        `checking ${file.basename} (periodic: ${isPeriodic}, journal: ${isInJournal})`
      );
    if (!isPeriodic || isInJournal) return { shouldMove: false };

    let granularity: Granularity | undefined;
    let year, month, day;

    if (isDailyNote) {
      granularity = "day";
      year = isDailyNote[1];
      month = isDailyNote[2];
      day = isDailyNote[3];
    } else if (isMonthlyNote) {
      granularity = "month";
      year = isMonthlyNote[1];
      month = isMonthlyNote[2];
    } else if (isYearlyNote) {
      granularity = "year";
      year = isYearlyNote[1];
    }

    return {
      shouldMove: true,
      granularity,
      year,
      month,
      day,
    };
  }

  /** Create intermediate year/month folders if needed */
  async createIntermediateFolders(path: string) {
    // If all intermediate folders already exist, return early.
    if (this.app.vault.getAbstractFileByPath(path)) return;

    if (isDebug) console.log(`attempt to create ${path}`);
    await this.app.vault.createFolder(path);
  }

  /** Get the correct year/month/day template */
  async getTemplate(meta: NoteMeta) {
    if (!meta.granularity) return;

    let templatePath = "90 Resources/91 Templates/";

    if (meta.granularity === "day") {
      templatePath += "TPL Daily Note";
    } else if (meta.granularity === "month") {
      templatePath += "TPL Monthly Note";
    } else if (meta.granularity === "year") {
      templatePath += "TPL Yearly Note";
    }

    const normalizedPath = normalizePath(templatePath);
    const templateFile = this.app.metadataCache.getFirstLinkpathDest(
      normalizedPath,
      ""
    );

    if (templateFile && templateFile instanceof TFile) {
      return this.app.vault.cachedRead(templateFile);
    }
  }

  /** Get a momentjs date object from the parsed filename */
  getDate(meta: NoteMeta) {
    const { year, month, day } = meta;

    if (year && month && day) {
      return moment(`${year}-${month}-${day}`, "YYYY-MM-DD");
    } else if (year && month) {
      return moment(`${year}-${month}`, "YYYY-MM");
    } else if (year) {
      return moment(year, "YYYY");
    }
  }

  /** Run the newly-created file through a template, based on its granularity */
  async applyTemplate(path: string, meta: NoteMeta) {
    const file = this.app.vault.getAbstractFileByPath(path) as TFile;
    if (!meta.granularity || !file) return;

    const template = await this.getTemplate(meta);
    const date = this.getDate(meta);

    if (!template || !date) return;

    const result = template.replace(
      /\{\{\s*date(?::(.+?))?\s*\}\}/g,
      (_, format) => (format ? date.format(format) : date.format("YYYY-MM-DD"))
    );

    if (isDebug) console.log("Template:", file.path, result);
    await this.app.vault.modify(file, result);
  }

  /** Move a note, based on its filename */
  async moveNote(file: TFile, meta: NoteMeta) {
    const { year, month } = meta;
    const name = file.name;
    let path = "10 Journal/";

    new Notice(`Moving ${name}`);

    if (year && month) {
      path += `${year}/${month} ${months[month]}`;
    } else if (year) {
      path += `${year}`;
    }

    // Create intermediate year/month folders if we need to.
    await this.createIntermediateFolders(path);
    path += `/${name}`;

    // Move the note!
    await this.app.fileManager.renameFile(file, path);

    // Apply a template based on granularity.
    await this.applyTemplate(path, meta);
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
