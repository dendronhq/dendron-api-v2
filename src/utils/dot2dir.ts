export type FileType = "file" | "index";

export function determineFileTypes(filenames: string[]): Map<string, FileType> {
  const fileTypes = new Map<string, FileType>();

  // Populate fileTypes with all filenames as keys and "file" as default value
  for (const filename of filenames) {
    fileTypes.set(filename, "file");
  }

  for (const filename of filenames) {
    const parts = filename.split(".");

    // Iterate through prefixes and update fileTypes if a parent is found
    for (let i = parts.length - 1; i > 0; i--) {
      const prefix = parts.slice(0, i).join(".");

      if (fileTypes.has(prefix)) {
        fileTypes.set(prefix, "index");
        break;
      }
    }
  }

  return fileTypes;
}
