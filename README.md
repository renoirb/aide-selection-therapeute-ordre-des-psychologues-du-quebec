# Aide à la sélection d’un psychologue de [l’Ordre des psychologues du Québec][www]

Le site web de [l’Ordre des Psychologues du Québec][www] est difficile à
utiliser pour trouver un thérapeute. Je voulais pouvoir consulter les
spécialités d’un thérapeute à la fois et prendre note de la spécialité de chacun
pour faire un choix.

L’engin de recherche ne permet pas de faire des marque pages, sauf si l’on
recherhe et retrouve une vue qui donne pour chaque membre.

Le fichier [src/data.ts](./src/data.ts) contient le "numéro de membre" que j’ai
pu obtenir en faisant une recherche dans le code source public du site. Il y a
probablement plusieurs autres, j'ai arrêté a 145.

Je publie cet outil et le rend disponible sur le Web dans l’espoir qu’il puisse
être utile pour quelqu’un d’autre.

Tout ce que vous faites sur cette application demeure dans votre navigateur web,
les choix, les domaines de spécialité, les "peut être", les non.

Pour commencer, vous n’avez qu’a ajuster l’adresse
([renoirb.github.io/aide-selection-therapeute-ordre-des-psychologues-du-quebec](https://renoirb.github.io/aide-selection-therapeute-ordre-des-psychologues-du-quebec))
pour avoir une série de "domaines" (e.g.
[?domain=anxiete&domaine=stress](https://renoirb.github.io/aide-selection-therapeute-ordre-des-psychologues-du-quebec?domain=anxiete&domaine=stress)),
et conservez cette adresse durant la période que vous voulez comparer.

[www]: https://www.ordrepsy.qc.ca/

## Comment utiliser

### Recherche utilisant le site

Le site de l’Ordre permet de choisir des critères et visualiser.

Mais ne permet pas de garder un marque page, il est possible seulement si l’on connaît la façon dont les vues sont faites.

https://user-images.githubusercontent.com/296940/135773733-336d0bf0-c64a-4cef-b253-76833b9f4a34.mp4


### Utiliser cet outil

Cet outil contient une liste des identifiants des membres de l’ordre, et permet de créer vos propres critères de sélection.

https://user-images.githubusercontent.com/296940/135773514-4aa015ed-2a22-44d0-81e6-cb69d7566226.mp4