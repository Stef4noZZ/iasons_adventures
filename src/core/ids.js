// Book ids and storage names used to be spelled "iasons". This maps old values to the current "iasonas",
// so settings, reading positions, recordings, backup files and old links made before the rename keep working.
export const renameLegacyId = (id) => (typeof id === "string" ? id.replace(/^iasons_/, "iasonas_") : id);
