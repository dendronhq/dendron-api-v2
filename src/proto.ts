import { VaultsIndexService } from "./serviceImpl/sync/vaultsIndexService";


async function main() {
  const client = new VaultsIndexService();
  const resp = await client.execute({
    src: "/Users/kevinlin/workspaces/kevin-garden/notes/notes",
    dest: "",
    vaultName: "notes"
  })
}

main()


// const storage = '/Users/kevinlin/workspaces/kevin-garden/metadata-es.db'
// const client = sqlClient({ storage })
// const base = '/Users/kevinlin/workspaces/kevin-garden/notes/notes/';
// const fname = 'db.sqlite.ref.foreign-keys.md'
// const fpath = path.join(base, fname)
// await syncNote({ fpath, sequelize: client })



// async function syncNoteWithDB() {
//   const sql = `
//   UPDATE Note
//   SET body = '${quote(body)}',
//       root = '${quote(root)}',
//       title = '${quote(title)}',
//       tags = '${JSON.stringify(tags)}',
//       created = ${created},
//       updated = ${updated}
//   WHERE
//       id = '${id}'`;
//   Bag.print(sql);
//   return opts.sequelize.query(sql, {
//     type: QueryTypes.UPDATE,
//   });
// }