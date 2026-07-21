# Studio CV

Éditeur de CV visuel et générique prêt à être hébergé sur Vercel. L'interface est ouverte à tous ; le CV de Syntiche Monney reste disponible comme exemple entièrement modifiable.

## Installation locale

```bash
npm install
npm run dev
```

## Déploiement Vercel

1. Décompressez le ZIP.
2. Importez le dossier dans un dépôt GitHub, ou utilisez `vercel` dans ce dossier.
3. Vercel détecte automatiquement Vite.
4. Lancez le déploiement sans ajouter de variable d’environnement.

Les modifications du CV sont enregistrées dans le navigateur de l’utilisateur.

## Nouveautés de cette version

- 12 fonds complets, des ambiances fraîches aux styles brasserie, éditorial, pâtisserie et cantine graphique ;
- 6 modèles de CV prêts à l'emploi qui conservent les textes existants ;
- 8 familles de polices applicables à un texte précis ou à l'ensemble du CV ;
- formes courbes et organiques à la place d'une sidebar rectangulaire ;
- dessins culinaires intégrés à chaque thème ;
- ajout manuel de blobs, cercles, arches et vagues ;
- chaque forme reste déplaçable, redimensionnable, recolorable, verrouillable et repositionnable dans les calques.
- sauvegarde automatique sur l'appareil et restauration après actualisation ou fermeture de la page ;
- jusqu'à 12 sauvegardes manuelles, restaurables et supprimables dans l'éditeur.
- interface responsive utilisable sur téléphone avec panneaux coulissants, commandes tactiles et zoom automatique du CV.
- création d'un CV vierge et noms d'exports générés automatiquement depuis le nom saisi.

## Architecture

- `src/App.tsx` : orchestration de l'éditeur ;
- `src/types.ts` : modèles TypeScript partagés ;
- `src/utils/project.ts` : clonage, noms de fichiers et téléchargements ;
- `src/styles.css` : interface responsive et rendu du canvas.
