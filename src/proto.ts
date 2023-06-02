import { VaultsIndexService } from "./serviceImpl/sync/vaultsIndexService";


async function main() {
  const client = new VaultsIndexService();
  const resp = client.execute({
    src: "/Users/kevinlin/workspaces/kevin-garden/notes",
    dest: ""
  })
}

main()