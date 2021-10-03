/**
 * Cette classe peux être utilisée pour copier-coller sur ordrepsy.qc.ca
 * Dans la liste de recherche et obtenir les IDs.
 * Avec les IDs d'une recherche selon vos critères, vous pourrez
 * avoir une liste sur laquelle voir si les candidats répondent à vos
 * besoin en spécialité.
 */
export class DocumentPsychologueIdExtractor {
  public ids = new Set<string>()
  public get urls(): ReadonlyArray<string> {
    const list: string[] = []
    this.ids.forEach((id) =>
      list.push(`https://www.ordrepsy.qc.ca/voir/psychologue/${id}`),
    )
    return list as ReadonlyArray<string>
  }
  crawl(doc: Document): void {
    const domNodes = Array.from(doc.querySelectorAll('.resultat[id]'))
    // membre-1111-2222
    // Dans le HTML, le ID que l'on veux est "1111"
    const listOfIds = domNodes.map(
      (n) =>
        (n.getAttribute('id') as string).replace('membre-', '').split('-')[0],
    )
    listOfIds.forEach((i) => this.ids.add(i))
  }
}
